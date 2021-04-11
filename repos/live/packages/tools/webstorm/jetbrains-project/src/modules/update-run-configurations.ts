import path, {join} from 'path'
import fse from 'fs-extra'
import cheerio from 'cheerio'

const workspaceFileName = 'workspace.xml'

export default async function updateRunConfigurations({cwd, ideaPath, dryRun}) {
  console.log('updating run configurations')

  const workspaceFile = join(ideaPath, workspaceFileName)
  const imlContents = fse.readFileSync(workspaceFile, {encoding: 'utf8'})
  const $ = cheerio.load(imlContents, {xmlMode: true})

  const changeListManagerEl = $('project > component[name=ChangeListManager]')
  // list > change

  const namedScopeManagerEl = $('project > component[name=NamedScopeManager]')
  // order > scope

  const runConfigComponentEl = $('project > component[name=RunManager]')
  const configs = runConfigComponentEl.children('configuration')

  console.log('Run configs:')
  configs.toArray().map(v => {
    const {name, default: _default, type, factoryName} = v.attribs
    console.log(v.attribs)
    //v.attribs.name = v.attribs.name + '1'
    console.log('--------------------')
  })

  console.log('Run configuration list:')
  const list = runConfigComponentEl.children('list')
  list.children('item').toArray(node => {
    console.log(node.attribs.itemvalue)
  })
}

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Ignore `temporary="true"` - these are created from code. Like in the gutter of the package.json file.

const configTypeToHandler = [
  ['JavaScriptTestRunnerJest'],
  ['JavascriptDebugType', uri => ({attribs: {uri}})],
  [
    'NodeJSConfigurationType',
    ({jsFile, workingDir}) => ({
      attribs: {
        default: 'false',
        pathToJsFile: jsFile,
        workingDir,
        applicationParameters: '',
      },
      children: `
        <EXTENSION ID="com.jetbrains.nodejs.run.NodeJSProfilingRunConfigurationExtension">
          <profiling do-profile="true" />
        </EXTENSION>
      `,
    }),
  ],
  [
    'js.build_tools.npm',
    ({pkgDir}) => ({
      attribs: {
        folderName: pkgDir,
      },
      children: `
      <package-json value="$PROJECT_DIR$/package.json" />
      <command value="run" />
      <scripts>
        <script value="docs" />
      </scripts>
      <node-interpreter value="project" />
      <envs />
      <method v="2" />
      `,
    }),
  ],
  [
    'ChromiumRemoteDebugType',
    () => ({
      attribs: {factoryName: 'Chromium Remote', default: 'false', port: 9229},
    }),
  ][
    ('wallaby',
    ({}) => ({
      attribs: {
        factoryName: 'Wallaby.js',
        configType: 'Configuration File',
        config: '$PROJECT_DIR$/wallaby.ava.js',
        wsl: 'No',
      },
      children: `<method v="2">
      <option name="NpmBeforeRunTask" enabled="true">
        <package-json value="$PROJECT_DIR$/package.json" />
        <command value="run" />
        <scripts>
          <script value="wallaby:write-env" />
        </scripts>
        <arguments value="repos/xxx/js/packages/yyy" />
        <node-interpreter value="project" />
        <envs />
      </option>
    </method>`,
    }))
  ],
]

function jest() {
  const children = `
  <node-interpreter value="project" />
  <node-options value="" />
  <jest-package value="$PROJECT_DIR$/node_modules/jest" />
  <working-dir value="$PROJECT_DIR$/repos/live" />
  <envs />
  <scope-kind value="TEST" />
  <test-file value="$PROJECT_DIR$/repos/live/packages/docker/pnpm-filter-workspace-packages/src/index.test.ts" />
  <test-names>
    <test-name value="test" />
  </test-names>
  <method v="2" />
  `
}
