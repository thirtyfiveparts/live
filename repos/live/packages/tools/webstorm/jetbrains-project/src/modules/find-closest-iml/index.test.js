import test from 'ava'
import fse from 'fs-extra'
import path, {join} from 'path'
import flatten from 'flat'
import mockFsWithMemfs, {vol} from '@src/modules/mock-fs-with-memfs'

function mockFs() {
  vol.reset()
  const dirs = flatten(
    {
      '/app': {
        '.idea': {
          // NOTE: .xml added to avoid IntelliJ finding it which might slow down the IDE.
          'app.iml': fse.readFileSync(join(__dirname, 'fixture.iml.xml')),
        },
        src: {'.keep': ''},
        lib: {'.keep': ''},
      },
    },
    {delimiter: '/'},
  )
  vol.fromJSON(dirs)
  //console.log('/app', vol.toJSON())
}

test('find-closest-iml-spec', async function(t) {
  mockFs()
  const findClosestIml = require('./index').default
  const {imlFile, imlPath} = await findClosestIml({cwd: '/app'})
  t.is(imlFile, '/app/.idea/app.iml')
  vol.reset()
})
