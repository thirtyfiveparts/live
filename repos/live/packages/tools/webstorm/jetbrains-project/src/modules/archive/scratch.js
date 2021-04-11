//import {vol} from 'memfs';
//import {patchFs} from 'fs-monkey';
//
//vol.fromJSON({'/dir/foo': 'bar'});
//patchFs(vol);
//console.log(require('fs').readdirSync('/'));

//import {vol} from 'memfs'
//import {patchFs} from 'fs-monkey'
//import {ufs} from 'unionfs'
//import * as fs from 'fs'
//
//vol.fromJSON({'/foo/bar.js': 'console.log("obi trice");'})
//ufs.use(vol).use(fs)
//patchFs(ufs)
//
//fs.readdirSync('/foo/') //?

// WORKING!
//import watchDirWithWatchman from '@src/modules/watchman-watcher'
//
//const cwd = process.cwd()
//const dryRun = true
//const imlFile = 'foo'
//
//watchDirWithWatchman({cwd, dryRun, imlFile})

const cwd = '/Users/Vaughan/dev-live'

import glob from 'globby'

console.log(glob.sync('**/*', {cwd, ignore: '**/node_modules/**'}))

import anymatch from 'anymatch'
import minimatch from 'minimatch'
import micromatch from 'micromatch'

anymatch('node_modules', 'node_modules1'); //? true
anymatch('node_modules', 'node_modules/somelib/index.js'); //? false
anymatch('node_modules/**', 'node_modules/somelib/index.js'); //? true
anymatch('node_modules/**', 'bar/node_modules/somelib/index.js'); //? true

anymatch('node_modules/**', 'bar/node_modules');//? true
minimatch('node_modules/**', 'bar/node_modules'); //? true

anymatch('node_modules/**', '/absolute/path/to/node_modules/somelib/index.js'); //? false
anymatch('**/node_modules/**', '/absolute/path/to/node_modules/somelib/index.js'); //? true
anymatch('**/node_modules/**', '/absolute/path/to/node_modules'); //? true

anymatch('**/node_modules/**', 'path/to/node_modules'); //?
anymatch('**/node_modules/**', 'path/to/node_modules/foo'); //?

minimatch('path/to/node_modules', '**/node_modules/**/*', ); //?
minimatch('path/to/node_modules/foo', '**/node_modules/**/*', ); //?

micromatch(['path/to/node_modules'], '**/node_modules/**/*', ) //?
micromatch(['path/to/node_modules/foo'], '**/node_modules/**/*', ) //?
