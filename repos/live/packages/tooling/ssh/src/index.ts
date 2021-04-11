import ssh2, {Client} from 'ssh2'
import SSH from 'node-ssh'
import untildify from 'untildify'
import sequest from 'sequest'
import fs from 'fs'
import sshPool from 'ssh-pool'

export default async function main() {

  await runSshPool()

}

main().then()

async function runSshPool() {

  const pool = new sshPool.ConnectionPool(['ubuntu@app.thirtyfive.dev'])
  const results = await pool.run('hostname')
  console.log({results})

}

////////////////////////////////////////////////////////////////////////////////

async function runSequest() {

  const seq = sequest.connect('ubuntu@app.thirtyfive.dev')
  console.log(seq)

}

async function nodeSsh() {
  //const conn = new Client
  //conn.on('ready', () => {
  //  console.log('ready')
  //})
  //conn.connect({host: 'localhost', port: 2222, username: 'ubuntu'})

  const opts = {
    host: 'localhost',
    username: 'ubuntu',
    port: 22,
    privateKey: untildify('~/.ssh/id_rsa'),
    //privateKey: fs.readFileSync(untildify('~/.ssh/id_rsa')),
  }
  console.log(opts)

  const ssh = new SSH()

  const res = await ssh.connect(opts)

  console.log({res})
}
