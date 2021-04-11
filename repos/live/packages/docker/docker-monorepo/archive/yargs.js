// Removed this because it gets in the way.

////////////////////////////////////////////////////////////////////////////////


// Yargs

//export default async function() {
//  let args
//  if (!args) args = process.argv.slice(2)
//  const bin = 'docker-monorepo'
//  const yargs = Yargs
//    .scriptName(bin)
//    //.usage(`Usage: ${bin} <command> [options]`)
//    .command(sync)
//    .demandCommand()
//    .help()
//    .fail((msg, err, yargs) => {
//      //if (err) { console.error(err) }
//      //console.log(msg)
//    })
//
//  const argv = yargs.parse(args)
//
//  //if (argv._.length <= 2) {
//  //  yargs.showHelp()
//  //}
//
//}

////////////////////////////////////////////////////////////////////////////////

//export default {
//  command: 'sync <pkg>',
//  describe: 'Copy filtered tree to .docker-trees',
//  builder: yargs => yargs.positional('pkg', {describe: 'package name'}),
//  handler: argv => handler(argv).then()
//}

//export async function handler(argv) {
//
//  const pkgName = argv.pkg
//  //const pkgName = '@xxx/xxx'
//
//  if (!pkgName) throw new Error('You must provide a package name')
//
//  const dryRun = argv.dryRun
//  const shouldPrint = argv.shouldPrint || true
//
//  await main(pkgName, {dryRun, shouldPrint})
//
//}

////////////////////////////////////////////////////////////////////////////////
