import Yargs from 'yargs'
import {prompt} from 'enquirer'
import {exec, spawn, fork, execFile} from 'promisify-child-process'

const checks = [checkPnpmLockfileUpToDate, checkPnpmAudit, format, eslint]

export default async function () {
  const repoRoot = process.cwd()
  console.log('hello world!')

  for (const check of checks) {
    check(fix)
  }
}

function task(obj: {name: string}) {
  return (fn) => {
    fn.name = obj.name
    return fn
  }
}

function checkPnpmLockfileUpToDate() {
  'pnpm install'
}

function checkPnpmAudit() {
  const cmd = 'pnpm audit'
}

// If CI, fix = false.

class Tasks {

  @task({name: 'Format with Prettier'})
  format(fix = false, jsFiles) {
    const cmd = 'prettier'
    const args = fix ? '--write' : '--check'
    const files = '"**/*.{ts,tsx,js,jsx,md}"'
    return `${cmd} ${args} ${files}`
  }

  @task({name: 'Lint with ESLint'})
  eslint(fix = false) {
    const cmd = 'eslint'
    const args = {
      resolvePluginsRelativeTo: 'config/tools/eslint',
      ext: ['.jsx', '.tsx', '.js', '.ts'],
      fix: undefined,
    }
    if (fix) args.fix = true
    const files = '.'
    return `${cmd} ${args} ${files}`
  }

  @task({name: 'Type-check with TypeScript (tsc)'})
  ts(fix = false) {
    const cmd = 'ts'
    const args = {
      project: 'tsconfig.json',
      noEmit: true,
    }
    const files = '.'
    return `${cmd} ${args} ${files}`
  }

  @task({name: 'Lint Markdown with markdownlint'})
  markdownLint(fix = false) {
    // markdownlint-cli
    const cmd = 'markdownlint'
    const args = {ignore: 'node_modules'}
    const files = '**/*.md'
    return `${cmd} ${args} ${files}`
  }

  // TODO(vjpr): Should be covered by eslint.
  //   Check shipmate.
  extraenousDeps() {

  }

}

/*

Files:
 - all files
 - changed files since last push (by you?)
 - staged files (what about IntelliJ changesets?)

 */
