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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var path_1 = require("path");
var constants_1 = require("@docusaurus/core/lib/constants");
var utils_1 = require("@docusaurus/utils");
var sidebars_1 = require("./sidebars");
var docs_1 = require("./docs");
var versions_1 = require("./versions");
var cli_1 = require("./cli");
var constants_2 = require("./constants");
var lodash_1 = require("lodash");
var globalData_1 = require("./globalData");
var props_1 = require("./props");
var translations_1 = require("./translations");
function pluginContentDocs(context, options) {
    var _a;
    var siteDir = context.siteDir, generatedFilesDir = context.generatedFilesDir, baseUrl = context.baseUrl, siteConfig = context.siteConfig;
    var versionsMetadata = versions_1.readVersionsMetadata({ context: context, options: options });
    var sourceToPermalink = {};
    var pluginId = (_a = options.id) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_PLUGIN_ID;
    var pluginDataDirRoot = path_1["default"].join(generatedFilesDir, 'docusaurus-plugin-content-docs');
    var dataDir = path_1["default"].join(pluginDataDirRoot, pluginId);
    var aliasedSource = function (source) {
        return "~docs/" + path_1["default"].relative(pluginDataDirRoot, source);
    };
    return {
        name: 'docusaurus-plugin-content-docs',
        getThemePath: function () {
            return path_1["default"].resolve(__dirname, './theme');
        },
        getTypeScriptThemePath: function () {
            return path_1["default"].resolve(__dirname, '..', 'src', 'theme');
        },
        extendCli: function (cli) {
            var isDefaultPluginId = pluginId === constants_1.DEFAULT_PLUGIN_ID;
            // Need to create one distinct command per plugin instance
            // otherwise 2 instances would try to execute the command!
            var command = isDefaultPluginId
                ? 'docs:version'
                : "docs:version:" + pluginId;
            var commandDescription = isDefaultPluginId
                ? 'Tag a new docs version'
                : "Tag a new docs version (" + pluginId + ")";
            cli
                .command(command)
                .arguments('<version>')
                .description(commandDescription)
                .action(function (version) {
                cli_1.cliDocsVersionCommand(version, siteDir, pluginId, {
                    path: options.path,
                    sidebarPath: options.sidebarPath
                });
            });
        },
        getTranslationFiles: function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = translations_1.getLoadedContentTranslationFiles;
                            return [4 /*yield*/, this.loadContent()];
                        case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        },
        getClientModules: function () {
            var modules = [];
            if (options.admonitions) {
                modules.push(require.resolve('remark-admonitions/styles/infima.css'));
            }
            return modules;
        },
        getPathsToWatch: function () {
            function getVersionPathsToWatch(version) {
                return __spreadArrays([
                    version.sidebarFilePath
                ], lodash_1.flatten(options.include.map(function (pattern) {
                    return versions_1.getDocsDirPaths(version).map(function (docsDirPath) { return docsDirPath + "/" + pattern; });
                })));
            }
            return lodash_1.flatten(versionsMetadata.map(getVersionPathsToWatch));
        },
        loadContent: function () {
            return __awaiter(this, void 0, void 0, function () {
                function loadVersionDocsBase(versionMetadata) {
                    return __awaiter(this, void 0, void 0, function () {
                        function processVersionDoc(docFile) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, docs_1.processDocMetadata({
                                            docFile: docFile,
                                            versionMetadata: versionMetadata,
                                            context: context,
                                            options: options
                                        })];
                                });
                            });
                        }
                        var docFiles;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, docs_1.readVersionDocs(versionMetadata, options)];
                                case 1:
                                    docFiles = _a.sent();
                                    if (docFiles.length === 0) {
                                        throw new Error("Docs version " + versionMetadata.versionName + " has no docs! At least one doc should exist at path=[" + path_1["default"].relative(siteDir, versionMetadata.docsDirPath) + "]");
                                    }
                                    return [2 /*return*/, Promise.all(docFiles.map(processVersionDoc))];
                            }
                        });
                    });
                }
                function loadVersion(versionMetadata) {
                    return __awaiter(this, void 0, void 0, function () {
                        // Add sidebar/next/previous to the docs
                        function addNavData(doc) {
                            var _a = sidebarsUtils.getDocNavigation(doc.id), sidebarName = _a.sidebarName, previousId = _a.previousId, nextId = _a.nextId;
                            var toDocNavLink = function (navDocId) { return ({
                                title: docsBaseById[navDocId].title,
                                permalink: docsBaseById[navDocId].permalink
                            }); };
                            return __assign(__assign({}, doc), { sidebar: sidebarName, previous: previousId ? toDocNavLink(previousId) : undefined, next: nextId ? toDocNavLink(nextId) : undefined });
                        }
                        // The "main doc" is the "version entry point"
                        // We browse this doc by clicking on a version:
                        // - the "home" doc (at '/docs/')
                        // - the first doc of the first sidebar
                        // - a random doc (if no docs are in any sidebar... edge case)
                        function getMainDoc() {
                            var versionHomeDoc = docs.find(function (doc) {
                                return doc.unversionedId === options.homePageId || doc.slug === '/';
                            });
                            var firstDocIdOfFirstSidebar = sidebarsUtils.getFirstDocIdOfFirstSidebar();
                            if (versionHomeDoc) {
                                return versionHomeDoc;
                            }
                            else if (firstDocIdOfFirstSidebar) {
                                return docs.find(function (doc) { return doc.id === firstDocIdOfFirstSidebar; });
                            }
                            else {
                                return docs[0];
                            }
                        }
                        var sidebars, sidebarsUtils, docsBase, docsBaseById, validDocIds, docs, permalinkToSidebar;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    sidebars = sidebars_1.loadSidebars(versionMetadata.sidebarFilePath);
                                    sidebarsUtils = sidebars_1.createSidebarsUtils(sidebars);
                                    return [4 /*yield*/, loadVersionDocsBase(versionMetadata)];
                                case 1:
                                    docsBase = _a.sent();
                                    docsBaseById = lodash_1.keyBy(docsBase, function (doc) { return doc.id; });
                                    validDocIds = Object.keys(docsBaseById);
                                    sidebarsUtils.checkSidebarsDocIds(validDocIds);
                                    docs = docsBase.map(addNavData);
                                    // sort to ensure consistent output for tests
                                    docs.sort(function (a, b) { return a.id.localeCompare(b.id); });
                                    // TODO annoying side effect!
                                    Object.values(docs).forEach(function (loadedDoc) {
                                        var source = loadedDoc.source, permalink = loadedDoc.permalink;
                                        sourceToPermalink[source] = permalink;
                                    });
                                    permalinkToSidebar = {};
                                    Object.values(docs).forEach(function (doc) {
                                        if (doc.sidebar) {
                                            permalinkToSidebar[doc.permalink] = doc.sidebar;
                                        }
                                    });
                                    return [2 /*return*/, __assign(__assign({}, versionMetadata), { mainDocId: getMainDoc().unversionedId, sidebars: sidebars,
                                            permalinkToSidebar: permalinkToSidebar, docs: docs.map(addNavData) })];
                            }
                        });
                    });
                }
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = {};
                            return [4 /*yield*/, Promise.all(versionsMetadata.map(loadVersion))];
                        case 1: return [2 /*return*/, (_a.loadedVersions = _b.sent(),
                                _a)];
                    }
                });
            });
        },
        translateContent: function (_a) {
            var content = _a.content, translationFiles = _a.translationFiles;
            return translations_1.translateLoadedContent(content, translationFiles);
        },
        contentLoaded: function (_a) {
            var content = _a.content, actions = _a.actions;
            return __awaiter(this, void 0, void 0, function () {
                function handleVersion(loadedVersion) {
                    return __awaiter(this, void 0, void 0, function () {
                        var versionMetadataPropPath, _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, createData(utils_1.docuHash("version-" + loadedVersion.versionName + "-metadata-prop") + ".json", JSON.stringify(props_1.toVersionMetadataProp(pluginId, loadedVersion), null, 2))];
                                case 1:
                                    versionMetadataPropPath = _c.sent();
                                    _a = addRoute;
                                    _b = {
                                        path: loadedVersion.versionPath,
                                        // allow matching /docs/* as well
                                        exact: false,
                                        // main docs component (DocPage)
                                        component: docLayoutComponent
                                    };
                                    return [4 /*yield*/, createDocRoutes(loadedVersion.docs)];
                                case 2:
                                    _a.apply(void 0, [(
                                        // sub-routes for each doc
                                        _b.routes = _c.sent(),
                                            _b.modules = {
                                                versionMetadata: aliasedSource(versionMetadataPropPath)
                                            },
                                            _b.priority = loadedVersion.routePriority,
                                            _b)]);
                                    return [2 /*return*/];
                            }
                        });
                    });
                }
                var loadedVersions, docLayoutComponent, docItemComponent, addRoute, createData, setGlobalData, createDocRoutes;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            loadedVersions = content.loadedVersions;
                            docLayoutComponent = options.docLayoutComponent, docItemComponent = options.docItemComponent;
                            addRoute = actions.addRoute, createData = actions.createData, setGlobalData = actions.setGlobalData;
                            createDocRoutes = function (docs) { return __awaiter(_this, void 0, void 0, function () {
                                var routes;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.all(docs.map(function (metadataItem) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, createData(
                                                            // Note that this created data path must be in sync with
                                                            // metadataPath provided to mdx-loader.
                                                            utils_1.docuHash(metadataItem.source) + ".json", JSON.stringify(metadataItem, null, 2))];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/, {
                                                                    path: metadataItem.permalink,
                                                                    component: docItemComponent,
                                                                    exact: true,
                                                                    modules: {
                                                                        content: metadataItem.source
                                                                    }
                                                                }];
                                                    }
                                                });
                                            }); }))];
                                        case 1:
                                            routes = _a.sent();
                                            return [2 /*return*/, routes.sort(function (a, b) { return a.path.localeCompare(b.path); })];
                                    }
                                });
                            }); };
                            return [4 /*yield*/, Promise.all(loadedVersions.map(handleVersion))];
                        case 1:
                            _b.sent();
                            setGlobalData({
                                path: utils_1.normalizeUrl([baseUrl, options.routeBasePath]),
                                versions: loadedVersions.map(globalData_1.toGlobalDataVersion)
                            });
                            return [2 /*return*/];
                    }
                });
            });
        },
        configureWebpack: function (_config, isServer, utils) {
            var getBabelLoader = utils.getBabelLoader, getCacheLoader = utils.getCacheLoader;
            var rehypePlugins = options.rehypePlugins, remarkPlugins = options.remarkPlugins, beforeDefaultRehypePlugins = options.beforeDefaultRehypePlugins, beforeDefaultRemarkPlugins = options.beforeDefaultRemarkPlugins;
            var docsMarkdownOptions = {
                siteDir: siteDir,
                sourceToPermalink: sourceToPermalink,
                versionsMetadata: versionsMetadata,
                onBrokenMarkdownLink: function (brokenMarkdownLink) {
                    if (siteConfig.onBrokenMarkdownLinks === 'ignore') {
                        return;
                    }
                    utils_1.reportMessage("Docs markdown link couldn't be resolved: (" + brokenMarkdownLink.link + ") in " + brokenMarkdownLink.filePath + " for version " + brokenMarkdownLink.version.versionName, siteConfig.onBrokenMarkdownLinks);
                }
            };
            function createMDXLoaderRule() {
                return {
                    test: /(\.mdx?)$/,
                    include: lodash_1.flatten(versionsMetadata.map(versions_1.getDocsDirPaths)),
                    use: lodash_1.compact([
                        getCacheLoader(isServer),
                        getBabelLoader(isServer),
                        {
                            loader: require.resolve('@docusaurus/mdx-loader'),
                            options: {
                                remarkPlugins: remarkPlugins,
                                rehypePlugins: rehypePlugins,
                                beforeDefaultRehypePlugins: beforeDefaultRehypePlugins,
                                beforeDefaultRemarkPlugins: beforeDefaultRemarkPlugins,
                                staticDir: path_1["default"].join(siteDir, constants_1.STATIC_DIR_NAME),
                                metadataPath: function (mdxPath) {
                                    // Note that metadataPath must be the same/in-sync as
                                    // the path from createData for each MDX.
                                    var aliasedPath = utils_1.aliasedSitePath(mdxPath, siteDir);
                                    return path_1["default"].join(dataDir, utils_1.docuHash(aliasedPath) + ".json");
                                }
                            }
                        },
                        {
                            loader: path_1["default"].resolve(__dirname, './markdown/index.js'),
                            options: docsMarkdownOptions
                        },
                    ])
                };
            }
            // Suppress warnings about non-existing of versions file.
            var stats = {
                warningsFilter: [constants_2.VERSIONS_JSON_FILE]
            };
            return {
                stats: stats,
                devServer: {
                    stats: stats
                },
                resolve: {
                    alias: {
                        '~docs': pluginDataDirRoot
                    }
                },
                module: {
                    rules: [createMDXLoaderRule()]
                }
            };
        }
    };
}
exports["default"] = pluginContentDocs;
var options_1 = require("./options");
__createBinding(exports, options_1, "validateOptions");
