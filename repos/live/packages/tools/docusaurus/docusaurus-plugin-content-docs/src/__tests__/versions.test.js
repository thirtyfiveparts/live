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
var versions_1 = require("../versions");
var options_1 = require("../options");
var constants_1 = require("@docusaurus/core/lib/constants");
var DefaultI18N = {
    currentLocale: 'en',
    locales: ['en'],
    defaultLocale: 'en'
};
describe('version paths', function () {
    test('getVersionedDocsDirPath', function () {
        expect(versions_1.getVersionsFilePath('someSiteDir', constants_1.DEFAULT_PLUGIN_ID)).toBe('someSiteDir/versions.json');
        expect(versions_1.getVersionsFilePath('otherSite/dir', 'pluginId')).toBe('otherSite/dir/pluginId_versions.json');
    });
    test('getVersionedDocsDirPath', function () {
        expect(versions_1.getVersionedDocsDirPath('someSiteDir', constants_1.DEFAULT_PLUGIN_ID)).toBe('someSiteDir/versioned_docs');
        expect(versions_1.getVersionedDocsDirPath('otherSite/dir', 'pluginId')).toBe('otherSite/dir/pluginId_versioned_docs');
    });
    test('getVersionedSidebarsDirPath', function () {
        expect(versions_1.getVersionedSidebarsDirPath('someSiteDir', constants_1.DEFAULT_PLUGIN_ID)).toBe('someSiteDir/versioned_sidebars');
        expect(versions_1.getVersionedSidebarsDirPath('otherSite/dir', 'pluginId')).toBe('otherSite/dir/pluginId_versioned_sidebars');
    });
});
describe('simple site', function () {
    function loadSite() {
        return __awaiter(this, void 0, void 0, function () {
            var simpleSiteDir, defaultOptions, defaultContext, vCurrent;
            return __generator(this, function (_a) {
                simpleSiteDir = path_1["default"].resolve(path_1["default"].join(__dirname, '__fixtures__', 'simple-site'));
                defaultOptions = __assign({ id: constants_1.DEFAULT_PLUGIN_ID }, options_1.DEFAULT_OPTIONS);
                defaultContext = {
                    siteDir: simpleSiteDir,
                    baseUrl: '/',
                    i18n: DefaultI18N
                };
                vCurrent = {
                    docsDirPath: path_1["default"].join(simpleSiteDir, 'docs'),
                    docsDirPathLocalized: path_1["default"].join(simpleSiteDir, 'i18n/en/docusaurus-plugin-content-docs/current'),
                    isLast: true,
                    routePriority: -1,
                    sidebarFilePath: path_1["default"].join(simpleSiteDir, 'sidebars.json'),
                    versionLabel: 'Next',
                    versionName: 'current',
                    versionPath: '/docs'
                };
                return [2 /*return*/, { simpleSiteDir: simpleSiteDir, defaultOptions: defaultOptions, defaultContext: defaultContext, vCurrent: vCurrent }];
            });
        });
    }
    test('readVersionsMetadata simple site', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, vCurrent, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, vCurrent = _a.vCurrent;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: defaultOptions,
                        context: defaultContext
                    });
                    expect(versionsMetadata).toEqual([vCurrent]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata simple site with base url', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, vCurrent, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, vCurrent = _a.vCurrent;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: defaultOptions,
                        context: __assign(__assign({}, defaultContext), { baseUrl: '/myBaseUrl' })
                    });
                    expect(versionsMetadata).toEqual([
                        __assign(__assign({}, vCurrent), { versionPath: '/myBaseUrl/docs' }),
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata simple site with current version config', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, vCurrent, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, vCurrent = _a.vCurrent;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: __assign(__assign({}, defaultOptions), { versions: {
                                current: {
                                    label: 'current-label',
                                    path: 'current-path'
                                }
                            } }),
                        context: __assign(__assign({}, defaultContext), { baseUrl: '/myBaseUrl' })
                    });
                    expect(versionsMetadata).toEqual([
                        __assign(__assign({}, vCurrent), { versionPath: '/myBaseUrl/docs/current-path', versionLabel: 'current-label', routePriority: undefined }),
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata simple site with unknown lastVersion should throw', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    expect(function () {
                        return versions_1.readVersionsMetadata({
                            options: __assign(__assign({}, defaultOptions), { lastVersion: 'unknownVersionName' }),
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"Docs option lastVersion=unknownVersionName is invalid. Available version names are: current\"");
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata simple site with unknown version configurations should throw', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    expect(function () {
                        return versions_1.readVersionsMetadata({
                            options: __assign(__assign({}, defaultOptions), { versions: {
                                    current: { label: 'current' },
                                    unknownVersionName1: { label: 'unknownVersionName1' },
                                    unknownVersionName2: { label: 'unknownVersionName2' }
                                } }),
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"Bad docs options.versions: unknown versions found: unknownVersionName1,unknownVersionName2. Available version names are: current\"");
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata simple site with disableVersioning while single version should throw', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    expect(function () {
                        return versions_1.readVersionsMetadata({
                            options: __assign(__assign({}, defaultOptions), { disableVersioning: true }),
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"Docs: using disableVersioning=true option on a non-versioned site does not make sense\"");
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata simple site without including current version should throw', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    expect(function () {
                        return versions_1.readVersionsMetadata({
                            options: __assign(__assign({}, defaultOptions), { includeCurrentVersion: false }),
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"It is not possible to use docs without any version. Please check the configuration of these options: includeCurrentVersion=false disableVersioning=false\"");
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('versioned site, pluginId=default', function () {
    function loadSite() {
        return __awaiter(this, void 0, void 0, function () {
            var versionedSiteDir, defaultOptions, defaultContext, vCurrent, v101, v100, vwithSlugs;
            return __generator(this, function (_a) {
                versionedSiteDir = path_1["default"].resolve(path_1["default"].join(__dirname, '__fixtures__', 'versioned-site'));
                defaultOptions = __assign({ id: constants_1.DEFAULT_PLUGIN_ID }, options_1.DEFAULT_OPTIONS);
                defaultContext = {
                    siteDir: versionedSiteDir,
                    baseUrl: '/',
                    i18n: DefaultI18N
                };
                vCurrent = {
                    docsDirPath: path_1["default"].join(versionedSiteDir, 'docs'),
                    docsDirPathLocalized: path_1["default"].join(versionedSiteDir, 'i18n/en/docusaurus-plugin-content-docs/current'),
                    isLast: false,
                    routePriority: undefined,
                    sidebarFilePath: path_1["default"].join(versionedSiteDir, 'sidebars.json'),
                    versionLabel: 'Next',
                    versionName: 'current',
                    versionPath: '/docs/next'
                };
                v101 = {
                    docsDirPath: path_1["default"].join(versionedSiteDir, 'versioned_docs/version-1.0.1'),
                    docsDirPathLocalized: path_1["default"].join(versionedSiteDir, 'i18n/en/docusaurus-plugin-content-docs/version-1.0.1'),
                    isLast: true,
                    routePriority: -1,
                    sidebarFilePath: path_1["default"].join(versionedSiteDir, 'versioned_sidebars/version-1.0.1-sidebars.json'),
                    versionLabel: '1.0.1',
                    versionName: '1.0.1',
                    versionPath: '/docs'
                };
                v100 = {
                    docsDirPath: path_1["default"].join(versionedSiteDir, 'versioned_docs/version-1.0.0'),
                    docsDirPathLocalized: path_1["default"].join(versionedSiteDir, 'i18n/en/docusaurus-plugin-content-docs/version-1.0.0'),
                    isLast: false,
                    routePriority: undefined,
                    sidebarFilePath: path_1["default"].join(versionedSiteDir, 'versioned_sidebars/version-1.0.0-sidebars.json'),
                    versionLabel: '1.0.0',
                    versionName: '1.0.0',
                    versionPath: '/docs/1.0.0'
                };
                vwithSlugs = {
                    docsDirPath: path_1["default"].join(versionedSiteDir, 'versioned_docs/version-withSlugs'),
                    docsDirPathLocalized: path_1["default"].join(versionedSiteDir, 'i18n/en/docusaurus-plugin-content-docs/version-withSlugs'),
                    isLast: false,
                    routePriority: undefined,
                    sidebarFilePath: path_1["default"].join(versionedSiteDir, 'versioned_sidebars/version-withSlugs-sidebars.json'),
                    versionLabel: 'withSlugs',
                    versionName: 'withSlugs',
                    versionPath: '/docs/withSlugs'
                };
                return [2 /*return*/, {
                        versionedSiteDir: versionedSiteDir,
                        defaultOptions: defaultOptions,
                        defaultContext: defaultContext,
                        vCurrent: vCurrent,
                        v101: v101,
                        v100: v100,
                        vwithSlugs: vwithSlugs
                    }];
            });
        });
    }
    test('readVersionsMetadata versioned site', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, vCurrent, v101, v100, vwithSlugs, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, vCurrent = _a.vCurrent, v101 = _a.v101, v100 = _a.v100, vwithSlugs = _a.vwithSlugs;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: defaultOptions,
                        context: defaultContext
                    });
                    expect(versionsMetadata).toEqual([vCurrent, v101, v100, vwithSlugs]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site with includeCurrentVersion=false', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, v101, v100, vwithSlugs, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, v101 = _a.v101, v100 = _a.v100, vwithSlugs = _a.vwithSlugs;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: __assign(__assign({}, defaultOptions), { includeCurrentVersion: false }),
                        context: defaultContext
                    });
                    expect(versionsMetadata).toEqual([
                        // vCurrent removed
                        v101,
                        v100,
                        vwithSlugs,
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site with version options', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, vCurrent, v101, v100, vwithSlugs, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, vCurrent = _a.vCurrent, v101 = _a.v101, v100 = _a.v100, vwithSlugs = _a.vwithSlugs;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: __assign(__assign({}, defaultOptions), { lastVersion: '1.0.0', versions: {
                                current: {
                                    path: 'current-path'
                                },
                                '1.0.0': {
                                    label: '1.0.0-label'
                                }
                            } }),
                        context: defaultContext
                    });
                    expect(versionsMetadata).toEqual([
                        __assign(__assign({}, vCurrent), { versionPath: '/docs/current-path' }),
                        __assign(__assign({}, v101), { isLast: false, routePriority: undefined, versionPath: '/docs/1.0.1' }),
                        __assign(__assign({}, v100), { isLast: true, routePriority: -1, versionLabel: '1.0.0-label', versionPath: '/docs' }),
                        vwithSlugs,
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site with onlyIncludeVersions option', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, v101, vwithSlugs, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, v101 = _a.v101, vwithSlugs = _a.vwithSlugs;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: __assign(__assign({}, defaultOptions), { 
                            // Order reversed on purpose: should not have any impact
                            onlyIncludeVersions: [vwithSlugs.versionName, v101.versionName] }),
                        context: defaultContext
                    });
                    expect(versionsMetadata).toEqual([v101, vwithSlugs]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site with disableVersioning', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, vCurrent, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, vCurrent = _a.vCurrent;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: __assign(__assign({}, defaultOptions), { disableVersioning: true }),
                        context: defaultContext
                    });
                    expect(versionsMetadata).toEqual([
                        __assign(__assign({}, vCurrent), { isLast: true, routePriority: -1, versionPath: '/docs' }),
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site with all versions disabled', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    expect(function () {
                        return versions_1.readVersionsMetadata({
                            options: __assign(__assign({}, defaultOptions), { includeCurrentVersion: false, disableVersioning: true }),
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"It is not possible to use docs without any version. Please check the configuration of these options: includeCurrentVersion=false disableVersioning=true\"");
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site with empty onlyIncludeVersions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    expect(function () {
                        return versions_1.readVersionsMetadata({
                            options: __assign(__assign({}, defaultOptions), { onlyIncludeVersions: [] }),
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"Bad docs options.onlyIncludeVersions: an empty array is not allowed, at least one version is needed\"");
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site with unknown versions in onlyIncludeVersions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    expect(function () {
                        return versions_1.readVersionsMetadata({
                            options: __assign(__assign({}, defaultOptions), { onlyIncludeVersions: ['unknownVersion1', 'unknownVersion2'] }),
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"Bad docs options.onlyIncludeVersions: unknown versions found: unknownVersion1,unknownVersion2. Available version names are: current, 1.0.1, 1.0.0, withSlugs\"");
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site with lastVersion not in onlyIncludeVersions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    expect(function () {
                        return versions_1.readVersionsMetadata({
                            options: __assign(__assign({}, defaultOptions), { lastVersion: '1.0.1', onlyIncludeVersions: ['current', '1.0.0'] }),
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"Bad docs options.lastVersion: if you use both the onlyIncludeVersions and lastVersion options, then lastVersion must be present in the provided onlyIncludeVersions array\"");
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site with invalid versions.json file', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, mock;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    mock = jest.spyOn(JSON, 'parse').mockImplementationOnce(function () {
                        return {
                            invalid: 'json'
                        };
                    });
                    expect(function () {
                        versions_1.readVersionsMetadata({
                            options: defaultOptions,
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"The versions file should contain an array of versions! Found content={\\\"invalid\\\":\\\"json\\\"}\"");
                    mock.mockRestore();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('versioned site, pluginId=community', function () {
    function loadSite() {
        return __awaiter(this, void 0, void 0, function () {
            var versionedSiteDir, defaultOptions, defaultContext, vCurrent, v100;
            return __generator(this, function (_a) {
                versionedSiteDir = path_1["default"].resolve(path_1["default"].join(__dirname, '__fixtures__', 'versioned-site'));
                defaultOptions = __assign(__assign({}, options_1.DEFAULT_OPTIONS), { id: 'community', path: 'community', routeBasePath: 'communityBasePath' });
                defaultContext = {
                    siteDir: versionedSiteDir,
                    baseUrl: '/',
                    i18n: DefaultI18N
                };
                vCurrent = {
                    docsDirPath: path_1["default"].join(versionedSiteDir, 'community'),
                    docsDirPathLocalized: path_1["default"].join(versionedSiteDir, 'i18n/en/docusaurus-plugin-content-docs-community/current'),
                    isLast: false,
                    routePriority: undefined,
                    sidebarFilePath: path_1["default"].join(versionedSiteDir, 'sidebars.json'),
                    versionLabel: 'Next',
                    versionName: 'current',
                    versionPath: '/communityBasePath/next'
                };
                v100 = {
                    docsDirPath: path_1["default"].join(versionedSiteDir, 'community_versioned_docs/version-1.0.0'),
                    docsDirPathLocalized: path_1["default"].join(versionedSiteDir, 'i18n/en/docusaurus-plugin-content-docs-community/version-1.0.0'),
                    isLast: true,
                    routePriority: -1,
                    sidebarFilePath: path_1["default"].join(versionedSiteDir, 'community_versioned_sidebars/version-1.0.0-sidebars.json'),
                    versionLabel: '1.0.0',
                    versionName: '1.0.0',
                    versionPath: '/communityBasePath'
                };
                return [2 /*return*/, { versionedSiteDir: versionedSiteDir, defaultOptions: defaultOptions, defaultContext: defaultContext, vCurrent: vCurrent, v100: v100 }];
            });
        });
    }
    test('readVersionsMetadata versioned site (community)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, vCurrent, v100, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, vCurrent = _a.vCurrent, v100 = _a.v100;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: defaultOptions,
                        context: defaultContext
                    });
                    expect(versionsMetadata).toEqual([vCurrent, v100]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site (community) with includeCurrentVersion=false', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, v100, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, v100 = _a.v100;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: __assign(__assign({}, defaultOptions), { includeCurrentVersion: false }),
                        context: defaultContext
                    });
                    expect(versionsMetadata).toEqual([
                        // vCurrent removed
                        v100,
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site (community) with disableVersioning', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext, vCurrent, versionsMetadata;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext, vCurrent = _a.vCurrent;
                    versionsMetadata = versions_1.readVersionsMetadata({
                        options: __assign(__assign({}, defaultOptions), { disableVersioning: true }),
                        context: defaultContext
                    });
                    expect(versionsMetadata).toEqual([
                        __assign(__assign({}, vCurrent), { isLast: true, routePriority: -1, versionPath: '/communityBasePath' }),
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('readVersionsMetadata versioned site (community) with all versions disabled', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, defaultOptions, defaultContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), defaultOptions = _a.defaultOptions, defaultContext = _a.defaultContext;
                    expect(function () {
                        return versions_1.readVersionsMetadata({
                            options: __assign(__assign({}, defaultOptions), { includeCurrentVersion: false, disableVersioning: true }),
                            context: defaultContext
                        });
                    }).toThrowErrorMatchingInlineSnapshot("\"It is not possible to use docs without any version. Please check the configuration of these options: includeCurrentVersion=false disableVersioning=true\"");
                    return [2 /*return*/];
            }
        });
    }); });
});
