export default class CliTestHelper {

  // Run a generator from cli string.
  static async runByCliString(argString, opts = {}) {

    // Split the string to match the process.argv format.
    let argv = argString.split(' ')
    argv = ['', ''].concat(argv)

    const files = await require('./replant').cli(argv, opts)
    return files

  }

}
