import {promisify} from 'util'
import eres from 'eres'
import pify from 'pify'

// TODO(vjpr): Sync with our other watchman package.

export default async function watchDirWithWatchman({cwd, dryRun, imlFile}) {
  const watchman = require('fb-watchman')
  let client = new watchman.Client()
  client = pify(client)

  let e, res

  ;[e, res] = await eres(
    client.capabilityCheck({optional: [], required: ['relative_root']}),
  )
  if (e) {
    console.log(e)
    client.end()
    return
  }

  // Initiate the watch
  ;[e, res] = await eres(client.command(['watch-project', cwd]))
  if (e) {
    console.error('Error initiating watch:', e)
    return
  }

  // It is considered to be best practice to show any 'warning' or
  // 'error' information to the user, as it may suggest steps
  // for remediation
  if ('warning' in res) {
    console.log('warning: ', res.warning)
  }

  // `watch-project` can consolidate the watch for your
  // dir_of_interest with another watch at a higher level in the
  // tree, so it is very important to record the `relative_path`
  // returned in resp
  console.log(
    'watch established on ',
    res.watch,
    ' relative_path',
    res.relative_path,
  )

  const {watch, relative_path: relativePath} = res
  await makeSubscription(client, watch, relativePath)
}

// `watch` is obtained from `resp.watch` in the `watch-project` response.
// `relative_path` is obtained from `resp.relative_path` in the
// `watch-project` response.
async function makeSubscription(client, watch, relativePath) {
  const sub = {
    // Match any `.js` file in the dir_of_interest
    expression: ['allof', ['match', '*.js']],
    // Which fields we're interested in
    fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
  }
  if (relativePath) {
    sub.relative_root = relativePath
  }

  let e, res
  ;[e, res] = await eres(client.command(['subscribe', watch, 'mysubscription', sub]))

  if (e) {
    // Probably an error in the subscription criteria
    console.error('failed to subscribe: ', e)
    return
  }
  console.log('subscription ' + res.subscribe + ' established')

  // Subscription results are emitted via the subscription event.
  // Note that this emits for all subscriptions.  If you have
  // subscriptions with different `fields` you will need to check
  // the subscription name and handle the differing data accordingly.
  // `resp`  looks like this in practice:
  //
  // { root: '/private/tmp/foo',
  //   subscription: 'mysubscription',
  //   files: [ { name: 'node_modules/fb-watchman/index.js',
  //       size: 4768,
  //       exists: true,
  //       type: 'f' } ] }
  client.on('subscription', function(resp) {
    if (resp.subscription !== 'mysubscription') return

    resp.files.forEach(function(file) {
      // convert Int64 instance to javascript integer
      const mtime_ms = +file.mtime_ms

      console.log('file changed: ' + file.name, mtime_ms)
    })
  })
}
