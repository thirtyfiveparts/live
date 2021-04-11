import AWS from 'aws-sdk'
import {promisify} from 'util'
import pify from 'pify'
import fs from 'fs-extra'
import employees from './.dev/employees'
import offices from './.dev/offices'
import customers from './.dev/customers'
import _ from 'lodash'
import eres from 'eres'
import pMap from 'p-map'
import 'hard-rejection/register'
import {Netmask} from 'netmask'
import c from 'chalk'

export default async function() {
  const credentials = new AWS.SharedIniFileCredentials({
    profile: 'xxx-vaughan',
  })
  AWS.config.credentials = credentials
  const region = process.env.AWS_REGION || 'eu-central-1'
  AWS.config.update({region})
  let ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

  const groups = await getAllGroups(ec2, true)

  const sshProxyGroupId = 'sg-123456'
  const group = _(groups).find({GroupId: sshProxyGroupId})
  //console.log(JSON.stringify(group, null, 2))
  const {IpPermissions, IpPermissionsEgress, GroupId} = group

  customers.map(c => (c.type = 'customer'))
  employees.map(c => (c.type = 'employee'))
  offices.map(c => (c.type = 'office'))
  const users = _.flatten([customers, employees, offices])

  await getAllUsersIps(employees)

  const locationIdToReportedIp = {}
  function getLocationIdsToIp(desc) {
    // In the description we store an id of the `LocationAddress`.
    // We want the AWS Management Console to be user readable.
    // The description is concatenated to 18 chars.
    // We put an abbreviated description in here.
    //
    // Reference: https://aws.amazon.com/blogs/aws/new-descriptions-for-security-group-rules/

    // `locationId` is `<company-abbr>--<location-name-abbr>`.
    // E.g. qt--vr-ffm -> x.x.x.x
    users.map(u => {
      if (u.locations) {
        u.locations.map(l => {
          // qt--vr-ffm
          const companyAbbr = u.type === 'employee' ? 'qt' : u.abbr
          const locationAbbr =
            u.type === 'employee'
              ? [u.abbr, l.name].filter(Boolean).join('-')
              : l.name
          const locationId = companyAbbr + '--' + locationAbbr
          locationIdToReportedIp[locationId] = u.ip
        })
      }
    })
  }
  getLocationIdsToIp()
  console.log('Location Id -> Reported Ip')
  console.log(locationIdToReportedIp)
  console.log()

  function checkIpChanged(ipPermissions, direction) {
    const changes = []
    console.log(direction + '\n===\n')
    ipPermissions.map(ipp => {
      ipp.IpRanges.map(range => {
        const {CidrIp, Description} = range
        // Match descriptions to user/office/customer alias.
        const locationId = Description
        const ruleNetmask = new Netmask(CidrIp)
        const ruleBase = ruleNetmask.base
        const latestReportedIp = locationIdToReportedIp[locationId]
        console.log(locationId, `${ruleBase} -> ${latestReportedIp}`)
        if (!latestReportedIp) {
          console.log('no reported ip found - skipping')
          console.log()
          return
        }
        if (ruleBase !== latestReportedIp) {
          console.log(c.green('IP has changed!'))
          changes.push({old: range, groupId: GroupId, newIp: latestReportedIp})
        } else {
          console.log('IP has NOT changed')
        }
        console.log()
      })
    })
    return changes
  }
  let changes = []
  changes.push(...checkIpChanged(IpPermissions || [], 'incoming'))
  changes.push(...checkIpChanged(IpPermissionsEgress || [], 'outgoing'))

  console.log('Changes to make')
  console.log(changes)
  console.log()

  if (changes.length) {
    await update(changes, dryRun)
  }
}

async function update(changes, dryRun) {
  for (const change of changes) {
    const {old, groupId: GroupId, newIp} = change
    const DryRun = dryRun
    const params = {
      // TODO(vjpr): Need to support netmasks. Some customer's IPs change within a defined range - like XXX.
      CidrIp: newIp + '/32',
      DryRun,
      FromPort: old.port,
      GroupId,
      IpProtocol: 'TCP',
      ToPort: old.port,
    }
  }
  console.log({params})

  // TODO(vjpr)
  //ec2.revokeSecurityGroupIngress(params)
  //ec2.revokeSecurityGroupEgress(params)

  //ec2.authorizeSecurityGroupIngress()
  //ec2.authorizeSecurityGroupEgress()
}

async function getAllUsersIps(users) {
  await pMap(users, async user => {
    const ip = await domainToIp(user.ddns + '.ddns.net')
    // TODO(vjpr): Change `user.email` to `user.id`.
    if (!ip) console.warn(`IP for user ${user.email} not reporting`)
    user.ip = ip
    return ip
  })
}

async function getAllGroups(ec2, useFixtures) {
  //const params = {GroupIds: ['sg-640bd00f']}
  // Get all security groups.
  const fixturePath = 'fixtures/groups.json'
  let groups
  if (useFixtures) {
    groups = fs.ensureFileSync(fixturePath)
    groups = fs.readJsonSync(fixturePath, {throws: false})
  } else {
    const res = await ec2.describeSecurityGroups({}).promise()
    groups = res.SecurityGroups
    fs.writeJsonSync(fixturePath, groups, {spaces: 2})
  }
  return groups
}

async function domainToIp(domain) {
  const dns = require('dns')
  const dnsLookup = promisify(dns.lookup)
  const [e, res] = await eres(dnsLookup(domain))
  if (e && e.code === 'ENOTFOUND') {
    return null
  }
  if (e) throw e
  const {address, family} = res
  return address
}
