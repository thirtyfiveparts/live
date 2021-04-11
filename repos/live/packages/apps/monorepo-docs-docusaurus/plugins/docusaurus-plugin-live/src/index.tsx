import path, {join} from 'path'
import findPackages from 'find-packages'
import * as findUp from 'find-up'
import * as fs from 'fs'
import {DocsSidebar} from './types'

const repoRoot = path.dirname(findUp.sync('pnpm-workspace.yaml'))

export default function (context, options) {
  return {
    name: '@live/docusaurus-plugin-live',
    async loadContent() {
      const patterns = ['repos/**']
      // TODO(vjpr): Use `pnpm-workspace.yaml` - need to ignore some things.
      const pjsons = await findPackages(repoRoot, {
        ignore: ['**/node_modules/**'],
        patterns,
      })

      const out = pjsons.map((pjson) => {
        const readmePath = path.join(pjson.dir, 'readme.md')
        if (!fs.existsSync(readmePath)) return pjson
        const contents = fs.readFileSync(readmePath, 'utf8')
        // NOTE: Lets parse markdown in browser.
        //const html = remark().use(html).process(contents)
        // --
        const isRepoRoot = pjson.dir === repoRoot
        const escapedPkgName = encodeURIComponent(pjson.manifest.name)
        const out = {...pjson, contents, isRepoRoot, escapedPkgName}
        return out
      })

      const docsSidebars: DocsSidebar = out.map((d) => {
        return {
          type: 'link',
          href: 'http://foo.com',
          label: 'foo',
        }
      })

      return {
        //docsMetadata,
        //docsDir,
        docsSidebars,
        //permalinkToSidebar: objectWithKeySorted(permalinkToSidebar),
        //versionToSidebars,
      }
    },
    async contentLoaded({content, actions}) {
      const {addRoute, createData} = actions

      const data = {metadata: {sidebar: {}}}

      for (const sidebar of content.docsSidebars) {
        const dataPath = await createData(
          'foo.json',
          JSON.stringify(data, null, 2),
        )
        addRoute({
          path: '/foo',
          component: '@theme/DocPage',
          exact: true,
          routes: [],
          modules: {
            content: dataPath,
            docsMetadata: {
              isHomePage: true,
              permalinkToSidebar: [],
            },
          },
        })
      }
    },
  }
}
