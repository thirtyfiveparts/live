"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var path_1 = require("path");
var picomatch_1 = require("picomatch");
var commander_1 = require("commander");
var lodash_1 = require("lodash");
var fs_extra_1 = require("fs-extra");
var index_1 = require("../index");
var index_2 = require("@docusaurus/core/src/server/index");
var utils_1 = require("@docusaurus/core/src/webpack/utils");
var utils_2 = require("@docusaurus/utils");
var plugins_1 = require("@docusaurus/core/src/server/plugins");
var constants_1 = require("@docusaurus/core/lib/constants");
var cliDocs = require("../cli");
var options_1 = require("../options");
var utils_validation_1 = require("@docusaurus/utils-validation");
var props_1 = require("../props");
// @ts-expect-error: TODO typedefs missing?
var webpack_1 = require("webpack");
function findDocById(version, unversionedId) {
    return version.docs.find(function (item) { return item.unversionedId === unversionedId; });
}
var defaultDocMetadata = {
    next: undefined,
    previous: undefined,
    editUrl: undefined,
    lastUpdatedAt: undefined,
    lastUpdatedBy: undefined,
    sidebar_label: undefined
};
var createFakeActions = function (contentDir) {
    var routeConfigs = [];
    var dataContainer = {};
    var globalDataContainer = {};
    var actions = {
        addRoute: function (config) {
            routeConfigs.push(config);
        },
        createData: function (name, content) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                dataContainer[name] = content;
                return [2 /*return*/, path_1["default"].join(contentDir, name)];
            });
        }); },
        setGlobalData: function (data) {
            globalDataContainer.pluginName = { pluginId: data };
        }
    };
    // query by prefix, because files have a hash at the end
    // so it's not convenient to query by full filename
    var getCreatedDataByPrefix = function (prefix) {
        var entry = Object.entries(dataContainer).find(function (_a) {
            var key = _a[0];
            return key.startsWith(prefix);
        });
        if (!entry) {
            throw new Error("No created entry found for prefix=[" + prefix + "]\nEntries created:\n- " + Object.keys(dataContainer).join('\n- ') + "\n        ");
        }
        return JSON.parse(entry[1]);
    };
    // Extra fns useful for tests!
    var utils = {
        getGlobalData: function () { return globalDataContainer; },
        getRouteConfigs: function () { return routeConfigs; },
        checkVersionMetadataPropCreated: function (version) {
            var versionMetadataProp = getCreatedDataByPrefix("version-" + lodash_1.kebabCase(version.versionName) + "-metadata-prop");
            expect(versionMetadataProp.docsSidebars).toEqual(props_1.toSidebarsProp(version));
            expect(versionMetadataProp.permalinkToSidebar).toEqual(version.permalinkToSidebar);
        },
        expectSnapshot: function () {
            // Sort the route config like in src/server/plugins/index.ts for consistent snapshot ordering
            plugins_1.sortConfig(routeConfigs);
            expect(routeConfigs).not.toEqual([]);
            expect(routeConfigs).toMatchSnapshot('route config');
            expect(dataContainer).toMatchSnapshot('data');
            expect(globalDataContainer).toMatchSnapshot('global data');
        }
    };
    return {
        actions: actions,
        utils: utils
    };
};
test('site with wrong sidebar file', function () { return __awaiter(void 0, void 0, void 0, function () {
    var siteDir, context, sidebarPath, plugin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                siteDir = path_1["default"].join(__dirname, '__fixtures__', 'simple-site');
                return [4 /*yield*/, index_2.loadContext(siteDir)];
            case 1:
                context = _a.sent();
                sidebarPath = path_1["default"].join(siteDir, 'wrong-sidebars.json');
                plugin = index_1["default"](context, utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                    sidebarPath: sidebarPath
                }));
                return [4 /*yield*/, expect(plugin.loadContent()).rejects.toThrowErrorMatchingSnapshot()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
describe('empty/no docs website', function () {
    var siteDir = path_1["default"].join(__dirname, '__fixtures__', 'empty-site');
    test('no files in docs folder', function () { return __awaiter(void 0, void 0, void 0, function () {
        var context, plugin;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, index_2.loadContext(siteDir)];
                case 1:
                    context = _a.sent();
                    return [4 /*yield*/, fs_extra_1["default"].ensureDir(path_1["default"].join(siteDir, 'docs'))];
                case 2:
                    _a.sent();
                    plugin = index_1["default"](context, utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {}));
                    return [4 /*yield*/, expect(plugin.loadContent()).rejects.toThrowErrorMatchingInlineSnapshot("\"Docs version current has no docs! At least one doc should exist at path=[docs]\"")];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('docs folder does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, index_2.loadContext(siteDir)];
                case 1:
                    context = _a.sent();
                    expect(function () {
                        return index_1["default"](context, utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                            path: '/path/does/not/exist/'
                        }));
                    }).toThrowErrorMatchingInlineSnapshot("\"The docs folder does not exist for version [current]. A docs folder is expected to be found at /path/does/not/exist\"");
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('simple website', function () {
    function loadSite() {
        return __awaiter(this, void 0, void 0, function () {
            var siteDir, context, sidebarPath, plugin, pluginContentDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        siteDir = path_1["default"].join(__dirname, '__fixtures__', 'simple-site');
                        return [4 /*yield*/, index_2.loadContext(siteDir)];
                    case 1:
                        context = _a.sent();
                        sidebarPath = path_1["default"].join(siteDir, 'sidebars.json');
                        plugin = index_1["default"](context, utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                            path: 'docs',
                            sidebarPath: sidebarPath,
                            homePageId: 'hello'
                        }));
                        pluginContentDir = path_1["default"].join(context.generatedFilesDir, plugin.name);
                        return [2 /*return*/, { siteDir: siteDir, context: context, sidebarPath: sidebarPath, plugin: plugin, pluginContentDir: pluginContentDir }];
                }
            });
        });
    }
    test('extendCli - docsVersion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, sidebarPath, plugin, mock, cli;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, sidebarPath = _a.sidebarPath, plugin = _a.plugin;
                    mock = jest
                        .spyOn(cliDocs, 'cliDocsVersionCommand')
                        .mockImplementation();
                    cli = new commander_1["default"].Command();
                    // @ts-expect-error: TODO annoying type incompatibility
                    plugin.extendCli(cli);
                    cli.parse(['node', 'test', 'docs:version', '1.0.0']);
                    expect(mock).toHaveBeenCalledTimes(1);
                    expect(mock).toHaveBeenCalledWith('1.0.0', siteDir, constants_1.DEFAULT_PLUGIN_ID, {
                        path: 'docs',
                        sidebarPath: sidebarPath
                    });
                    mock.mockRestore();
                    return [2 /*return*/];
            }
        });
    }); });
    test('getPathToWatch', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, plugin, pathToWatch, matchPattern;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, plugin = _a.plugin;
                    pathToWatch = plugin.getPathsToWatch();
                    matchPattern = pathToWatch.map(function (filepath) {
                        return utils_2.posixPath(path_1["default"].relative(siteDir, filepath));
                    });
                    expect(matchPattern).not.toEqual([]);
                    expect(matchPattern).toMatchInlineSnapshot("\n      Array [\n        \"sidebars.json\",\n        \"i18n/en/docusaurus-plugin-content-docs/current/**/*.{md,mdx}\",\n        \"docs/**/*.{md,mdx}\",\n      ]\n    ");
                    expect(picomatch_1.isMatch('docs/hello.md', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('docs/hello.mdx', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('docs/foo/bar.md', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('docs/hello.js', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('docs/super.mdl', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('docs/mdx', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('sidebars.json', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('versioned_docs/hello.md', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('hello.md', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('super/docs/hello.md', matchPattern)).toEqual(false);
                    return [2 /*return*/];
            }
        });
    }); });
    test('configureWebpack', function () { return __awaiter(void 0, void 0, void 0, function () {
        var plugin, config, errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    plugin = (_a.sent()).plugin;
                    config = utils_1.applyConfigureWebpack(plugin.configureWebpack, {
                        entry: './src/index.js',
                        output: {
                            filename: 'main.js',
                            path: path_1["default"].resolve(__dirname, 'dist')
                        }
                    }, false);
                    errors = webpack_1.validate(config);
                    expect(errors.length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    test('content', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, plugin, pluginContentDir, content, currentVersion, _b, actions, utils;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _c.sent(), siteDir = _a.siteDir, plugin = _a.plugin, pluginContentDir = _a.pluginContentDir;
                    return [4 /*yield*/, plugin.loadContent()];
                case 2:
                    content = _c.sent();
                    expect(content.loadedVersions.length).toEqual(1);
                    currentVersion = content.loadedVersions[0];
                    expect(findDocById(currentVersion, 'hello')).toEqual(__assign(__assign({}, defaultDocMetadata), { version: 'current', id: 'hello', unversionedId: 'hello', isDocsHomePage: true, permalink: '/docs/', slug: '/', previous: {
                            title: 'baz',
                            permalink: '/docs/foo/bazSlug.html'
                        }, sidebar: 'docs', source: path_1["default"].join('@site', path_1["default"].relative(siteDir, currentVersion.docsDirPath), 'hello.md'), title: 'Hello, World !', description: 'Hi, Endilie here :)' }));
                    expect(findDocById(currentVersion, 'foo/bar')).toEqual(__assign(__assign({}, defaultDocMetadata), { version: 'current', id: 'foo/bar', unversionedId: 'foo/bar', isDocsHomePage: false, next: {
                            title: 'baz',
                            permalink: '/docs/foo/bazSlug.html'
                        }, permalink: '/docs/foo/bar', slug: '/foo/bar', sidebar: 'docs', source: path_1["default"].join('@site', path_1["default"].relative(siteDir, currentVersion.docsDirPath), 'foo', 'bar.md'), title: 'Bar', description: 'This is custom description' }));
                    expect(currentVersion.sidebars).toMatchSnapshot();
                    _b = createFakeActions(pluginContentDir), actions = _b.actions, utils = _b.utils;
                    return [4 /*yield*/, plugin.contentLoaded({
                            content: content,
                            actions: actions,
                            allContent: {}
                        })];
                case 3:
                    _c.sent();
                    utils.checkVersionMetadataPropCreated(currentVersion);
                    utils.expectSnapshot();
                    expect(utils.getGlobalData()).toMatchSnapshot();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('versioned website', function () {
    function loadSite() {
        return __awaiter(this, void 0, void 0, function () {
            var siteDir, context, sidebarPath, routeBasePath, plugin, pluginContentDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        siteDir = path_1["default"].join(__dirname, '__fixtures__', 'versioned-site');
                        return [4 /*yield*/, index_2.loadContext(siteDir)];
                    case 1:
                        context = _a.sent();
                        sidebarPath = path_1["default"].join(siteDir, 'sidebars.json');
                        routeBasePath = 'docs';
                        plugin = index_1["default"](context, utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                            routeBasePath: routeBasePath,
                            sidebarPath: sidebarPath,
                            homePageId: 'hello'
                        }));
                        pluginContentDir = path_1["default"].join(context.generatedFilesDir, plugin.name);
                        return [2 /*return*/, {
                                siteDir: siteDir,
                                context: context,
                                routeBasePath: routeBasePath,
                                sidebarPath: sidebarPath,
                                plugin: plugin,
                                pluginContentDir: pluginContentDir
                            }];
                }
            });
        });
    }
    test('extendCli - docsVersion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, routeBasePath, sidebarPath, plugin, mock, cli;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, routeBasePath = _a.routeBasePath, sidebarPath = _a.sidebarPath, plugin = _a.plugin;
                    mock = jest
                        .spyOn(cliDocs, 'cliDocsVersionCommand')
                        .mockImplementation();
                    cli = new commander_1["default"].Command();
                    // @ts-expect-error: TODO annoying type incompatibility
                    plugin.extendCli(cli);
                    cli.parse(['node', 'test', 'docs:version', '2.0.0']);
                    expect(mock).toHaveBeenCalledTimes(1);
                    expect(mock).toHaveBeenCalledWith('2.0.0', siteDir, constants_1.DEFAULT_PLUGIN_ID, {
                        path: routeBasePath,
                        sidebarPath: sidebarPath
                    });
                    mock.mockRestore();
                    return [2 /*return*/];
            }
        });
    }); });
    test('getPathToWatch', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, plugin, pathToWatch, matchPattern;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, plugin = _a.plugin;
                    pathToWatch = plugin.getPathsToWatch();
                    matchPattern = pathToWatch.map(function (filepath) {
                        return utils_2.posixPath(path_1["default"].relative(siteDir, filepath));
                    });
                    expect(matchPattern).not.toEqual([]);
                    expect(matchPattern).toMatchInlineSnapshot("\n      Array [\n        \"sidebars.json\",\n        \"i18n/en/docusaurus-plugin-content-docs/current/**/*.{md,mdx}\",\n        \"docs/**/*.{md,mdx}\",\n        \"versioned_sidebars/version-1.0.1-sidebars.json\",\n        \"i18n/en/docusaurus-plugin-content-docs/version-1.0.1/**/*.{md,mdx}\",\n        \"versioned_docs/version-1.0.1/**/*.{md,mdx}\",\n        \"versioned_sidebars/version-1.0.0-sidebars.json\",\n        \"i18n/en/docusaurus-plugin-content-docs/version-1.0.0/**/*.{md,mdx}\",\n        \"versioned_docs/version-1.0.0/**/*.{md,mdx}\",\n        \"versioned_sidebars/version-withSlugs-sidebars.json\",\n        \"i18n/en/docusaurus-plugin-content-docs/version-withSlugs/**/*.{md,mdx}\",\n        \"versioned_docs/version-withSlugs/**/*.{md,mdx}\",\n      ]\n    ");
                    expect(picomatch_1.isMatch('docs/hello.md', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('docs/hello.mdx', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('docs/foo/bar.md', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('sidebars.json', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('versioned_docs/version-1.0.0/hello.md', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('versioned_docs/version-1.0.0/foo/bar.md', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('versioned_sidebars/version-1.0.0-sidebars.json', matchPattern)).toEqual(true);
                    // Non existing version
                    expect(picomatch_1.isMatch('versioned_docs/version-2.0.0/foo/bar.md', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('versioned_docs/version-2.0.0/hello.md', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('versioned_sidebars/version-2.0.0-sidebars.json', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('docs/hello.js', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('docs/super.mdl', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('docs/mdx', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('hello.md', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('super/docs/hello.md', matchPattern)).toEqual(false);
                    return [2 /*return*/];
            }
        });
    }); });
    test('content', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, plugin, pluginContentDir, content, _b, currentVersion, version101, version100, versionWithSlugs, _c, actions, utils;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _d.sent(), siteDir = _a.siteDir, plugin = _a.plugin, pluginContentDir = _a.pluginContentDir;
                    return [4 /*yield*/, plugin.loadContent()];
                case 2:
                    content = _d.sent();
                    expect(content.loadedVersions.length).toEqual(4);
                    _b = content.loadedVersions, currentVersion = _b[0], version101 = _b[1], version100 = _b[2], versionWithSlugs = _b[3];
                    // foo/baz.md only exists in version -1.0.0
                    expect(findDocById(currentVersion, 'foo/baz')).toBeUndefined();
                    expect(findDocById(version101, 'foo/baz')).toBeUndefined();
                    expect(findDocById(versionWithSlugs, 'foo/baz')).toBeUndefined();
                    expect(findDocById(currentVersion, 'foo/bar')).toEqual(__assign(__assign({}, defaultDocMetadata), { id: 'foo/bar', unversionedId: 'foo/bar', isDocsHomePage: false, permalink: '/docs/next/foo/barSlug', slug: '/foo/barSlug', source: path_1["default"].join('@site', path_1["default"].relative(siteDir, currentVersion.docsDirPath), 'foo', 'bar.md'), title: 'bar', description: 'This is next version of bar.', version: 'current', sidebar: 'docs', next: {
                            title: 'hello',
                            permalink: '/docs/next/'
                        } }));
                    expect(findDocById(currentVersion, 'hello')).toEqual(__assign(__assign({}, defaultDocMetadata), { id: 'hello', unversionedId: 'hello', isDocsHomePage: true, permalink: '/docs/next/', slug: '/', source: path_1["default"].join('@site', path_1["default"].relative(siteDir, currentVersion.docsDirPath), 'hello.md'), title: 'hello', description: 'Hello next !', version: 'current', sidebar: 'docs', previous: {
                            title: 'bar',
                            permalink: '/docs/next/foo/barSlug'
                        } }));
                    expect(findDocById(version101, 'hello')).toEqual(__assign(__assign({}, defaultDocMetadata), { id: 'version-1.0.1/hello', unversionedId: 'hello', isDocsHomePage: true, permalink: '/docs/', slug: '/', source: path_1["default"].join('@site', path_1["default"].relative(siteDir, version101.docsDirPath), 'hello.md'), title: 'hello', description: 'Hello 1.0.1 !', version: '1.0.1', sidebar: 'version-1.0.1/docs', previous: {
                            title: 'bar',
                            permalink: '/docs/foo/bar'
                        } }));
                    expect(findDocById(version100, 'foo/baz')).toEqual(__assign(__assign({}, defaultDocMetadata), { id: 'version-1.0.0/foo/baz', unversionedId: 'foo/baz', isDocsHomePage: false, permalink: '/docs/1.0.0/foo/baz', slug: '/foo/baz', source: path_1["default"].join('@site', path_1["default"].relative(siteDir, version100.docsDirPath), 'foo', 'baz.md'), title: 'baz', description: 'Baz 1.0.0 ! This will be deleted in next subsequent versions.', version: '1.0.0', sidebar: 'version-1.0.0/docs', next: {
                            title: 'hello',
                            permalink: '/docs/1.0.0/'
                        }, previous: {
                            title: 'bar',
                            permalink: '/docs/1.0.0/foo/barSlug'
                        } }));
                    expect(currentVersion.sidebars).toMatchSnapshot('current version sidebars');
                    expect(version101.sidebars).toMatchSnapshot('101 version sidebars');
                    expect(version100.sidebars).toMatchSnapshot('100 version sidebars');
                    expect(versionWithSlugs.sidebars).toMatchSnapshot('withSlugs version sidebars');
                    _c = createFakeActions(pluginContentDir), actions = _c.actions, utils = _c.utils;
                    return [4 /*yield*/, plugin.contentLoaded({
                            content: content,
                            actions: actions,
                            allContent: {}
                        })];
                case 3:
                    _d.sent();
                    utils.checkVersionMetadataPropCreated(currentVersion);
                    utils.checkVersionMetadataPropCreated(version101);
                    utils.checkVersionMetadataPropCreated(version100);
                    utils.checkVersionMetadataPropCreated(versionWithSlugs);
                    utils.expectSnapshot();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('versioned website (community)', function () {
    function loadSite() {
        return __awaiter(this, void 0, void 0, function () {
            var siteDir, context, sidebarPath, routeBasePath, pluginId, plugin, pluginContentDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        siteDir = path_1["default"].join(__dirname, '__fixtures__', 'versioned-site');
                        return [4 /*yield*/, index_2.loadContext(siteDir)];
                    case 1:
                        context = _a.sent();
                        sidebarPath = path_1["default"].join(siteDir, 'community_sidebars.json');
                        routeBasePath = 'community';
                        pluginId = 'community';
                        plugin = index_1["default"](context, utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                            id: 'community',
                            path: 'community',
                            routeBasePath: routeBasePath,
                            sidebarPath: sidebarPath
                        }));
                        pluginContentDir = path_1["default"].join(context.generatedFilesDir, plugin.name);
                        return [2 /*return*/, {
                                siteDir: siteDir,
                                context: context,
                                routeBasePath: routeBasePath,
                                sidebarPath: sidebarPath,
                                pluginId: pluginId,
                                plugin: plugin,
                                pluginContentDir: pluginContentDir
                            }];
                }
            });
        });
    }
    test('extendCli - docsVersion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, routeBasePath, sidebarPath, pluginId, plugin, mock, cli;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, routeBasePath = _a.routeBasePath, sidebarPath = _a.sidebarPath, pluginId = _a.pluginId, plugin = _a.plugin;
                    mock = jest
                        .spyOn(cliDocs, 'cliDocsVersionCommand')
                        .mockImplementation();
                    cli = new commander_1["default"].Command();
                    // @ts-expect-error: TODO annoying type incompatibility
                    plugin.extendCli(cli);
                    cli.parse(['node', 'test', "docs:version:" + pluginId, '2.0.0']);
                    expect(mock).toHaveBeenCalledTimes(1);
                    expect(mock).toHaveBeenCalledWith('2.0.0', siteDir, pluginId, {
                        path: routeBasePath,
                        sidebarPath: sidebarPath
                    });
                    mock.mockRestore();
                    return [2 /*return*/];
            }
        });
    }); });
    test('getPathToWatch', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, plugin, pathToWatch, matchPattern;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, plugin = _a.plugin;
                    pathToWatch = plugin.getPathsToWatch();
                    matchPattern = pathToWatch.map(function (filepath) {
                        return utils_2.posixPath(path_1["default"].relative(siteDir, filepath));
                    });
                    expect(matchPattern).not.toEqual([]);
                    expect(matchPattern).toMatchInlineSnapshot("\n      Array [\n        \"community_sidebars.json\",\n        \"i18n/en/docusaurus-plugin-content-docs-community/current/**/*.{md,mdx}\",\n        \"community/**/*.{md,mdx}\",\n        \"community_versioned_sidebars/version-1.0.0-sidebars.json\",\n        \"i18n/en/docusaurus-plugin-content-docs-community/version-1.0.0/**/*.{md,mdx}\",\n        \"community_versioned_docs/version-1.0.0/**/*.{md,mdx}\",\n      ]\n    ");
                    expect(picomatch_1.isMatch('community/team.md', matchPattern)).toEqual(true);
                    expect(picomatch_1.isMatch('community_versioned_docs/version-1.0.0/team.md', matchPattern)).toEqual(true);
                    // Non existing version
                    expect(picomatch_1.isMatch('community_versioned_docs/version-2.0.0/team.md', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('community_versioned_sidebars/version-2.0.0-sidebars.json', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('community/team.js', matchPattern)).toEqual(false);
                    expect(picomatch_1.isMatch('community_versioned_docs/version-1.0.0/team.js', matchPattern)).toEqual(false);
                    return [2 /*return*/];
            }
        });
    }); });
    test('content', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, plugin, pluginContentDir, content, _b, currentVersion, version100, _c, actions, utils;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _d.sent(), siteDir = _a.siteDir, plugin = _a.plugin, pluginContentDir = _a.pluginContentDir;
                    return [4 /*yield*/, plugin.loadContent()];
                case 2:
                    content = _d.sent();
                    expect(content.loadedVersions.length).toEqual(2);
                    _b = content.loadedVersions, currentVersion = _b[0], version100 = _b[1];
                    expect(findDocById(currentVersion, 'team')).toEqual(__assign(__assign({}, defaultDocMetadata), { id: 'team', unversionedId: 'team', isDocsHomePage: false, permalink: '/community/next/team', slug: '/team', 
                        /*
                        source: path.join(
                          '@site',
                          path.relative(siteDir, currentVersion.docsDirPath),
                          'team.md',
                        ),
                         */
                        source: '@site/i18n/en/docusaurus-plugin-content-docs-community/current/team.md', title: 'Team title translated', description: 'Team current version (translated)', version: 'current', sidebar: 'community' }));
                    expect(findDocById(version100, 'team')).toEqual(__assign(__assign({}, defaultDocMetadata), { id: 'version-1.0.0/team', unversionedId: 'team', isDocsHomePage: false, permalink: '/community/team', slug: '/team', source: path_1["default"].join('@site', path_1["default"].relative(siteDir, version100.docsDirPath), 'team.md'), title: 'team', description: 'Team 1.0.0', version: '1.0.0', sidebar: 'version-1.0.0/community' }));
                    expect(currentVersion.sidebars).toMatchSnapshot('current version sidebars');
                    expect(version100.sidebars).toMatchSnapshot('100 version sidebars');
                    _c = createFakeActions(pluginContentDir), actions = _c.actions, utils = _c.utils;
                    return [4 /*yield*/, plugin.contentLoaded({
                            content: content,
                            actions: actions,
                            allContent: {}
                        })];
                case 3:
                    _d.sent();
                    utils.checkVersionMetadataPropCreated(currentVersion);
                    utils.checkVersionMetadataPropCreated(version100);
                    utils.expectSnapshot();
                    return [2 /*return*/];
            }
        });
    }); });
});
