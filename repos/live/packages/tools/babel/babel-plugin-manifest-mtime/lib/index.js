"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _debug = _interopRequireDefault(require("debug"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireWildcard(require("path"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var debug = (0, _debug["default"])('babel-plugin-example'); //let root = null

var cache = {};

function _default(_ref) {
  var t = _ref.types;
  var visitor = {
    Program: function Program(path, state) {//const isProd = process.env.NODE_ENV === 'production'
      //state.opts.foo = state.opts.foo || !isProd
    }
  };
  return {
    visitor: visitor,
    post: function post(state) {
      if (isRunningBabelRegister(state)) return;
      var root = state.opts.root;
      var filename = state.opts.filename; // TODO(vjpr): filename is untranspiled source file - we need transpiled location!

      var mTime = _fs["default"].statSync(filename).mtimeMs;

      var manifestFile = getManifestPath(root); // TODO(vjpr): This must be synced with `transpile-checker`.

      var rootRelFilename = _path["default"].relative(root, filename); //const manifestRelFilename = path.relative(path.dirname(manifestFile), filename)
      //const rootRelOutputPath = join(root, 'lib'...


      var manifestKey = rootRelFilename;
      cache[manifestKey] = mTime;
      writeManifest(manifestFile);
    }
  };
} // NOTE: Doesn't work.
//process.on('exit', () => {
//  writeManifest()
//})
// TODO(vjpr): Sync with `transpile-checker`.


function getManifestPath(root) {
  var manifestPath = 'lib/babel-manifest.json';
  var manifestFile = (0, _path.join)(root, manifestPath);
  return manifestFile;
}

function writeManifest(manifestFile) {
  _fs["default"].writeFileSync(manifestFile, JSON.stringify(cache, null, 2)); //console.log('Writing to', manifestFile)
  //console.log({cache})

} // Test using `BABEL_DISABLE_CACHE=1 a-cli-tool`.
// We don't want this to run when using @babel/register.
//   When using babel/register, babel-core and presets will already be loaded defeating the purpose of precompiling.


function isRunningBabelRegister(state) {
  return state.opts.caller && state.opts.caller.name === '@babel/register';
}
//# sourceMappingURL=index.js.map