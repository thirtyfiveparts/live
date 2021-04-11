export default async function() {

  // TODO(vjpr): Move into `<company>` folder.
  const entryPoints = [
    'packages/<company>/deploy-shared/pm2/pm2.config.js',
  ]

  console.log('Entry points:')
  console.log(entryPoints)

}
