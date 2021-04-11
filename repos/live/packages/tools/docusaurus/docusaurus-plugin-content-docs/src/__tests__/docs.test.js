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
var index_1 = require("@docusaurus/core/src/server/index");
var docs_1 = require("../docs");
var versions_1 = require("../versions");
var constants_1 = require("@docusaurus/core/lib/constants");
var options_1 = require("../options");
var fixtureDir = path_1["default"].join(__dirname, '__fixtures__');
var createFakeDocFile = function (_a) {
    var source = _a.source, _b = _a.frontmatter, frontmatter = _b === void 0 ? {} : _b, _c = _a.markdown, markdown = _c === void 0 ? 'some markdown content' : _c;
    var content = "---\n" + Object.entries(frontmatter)
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return key + ": " + value;
    })
        .join('\n') + "\n---\n" + markdown + "\n";
    return {
        source: source,
        content: content,
        lastUpdate: {},
        filePath: source
    };
};
function createTestUtils(_a) {
    var siteDir = _a.siteDir, context = _a.context, versionMetadata = _a.versionMetadata, options = _a.options;
    function readDoc(docFileSource) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, docs_1.readDocFile(versionMetadata, docFileSource, options)];
            });
        });
    }
    function processDocFile(docFile) {
        return docs_1.processDocMetadata({
            docFile: docFile,
            versionMetadata: versionMetadata,
            options: options,
            context: context
        });
    }
    function testMeta(docFileSource, expectedMetadata) {
        return __awaiter(this, void 0, void 0, function () {
            var docFile, metadata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, readDoc(docFileSource)];
                    case 1:
                        docFile = _a.sent();
                        return [4 /*yield*/, docs_1.processDocMetadata({
                                docFile: docFile,
                                versionMetadata: versionMetadata,
                                context: context,
                                options: options
                            })];
                    case 2:
                        metadata = _a.sent();
                        expect(metadata).toEqual(__assign({ lastUpdatedBy: undefined, lastUpdatedAt: undefined, sidebar_label: undefined, editUrl: undefined, source: path_1["default"].join('@site', path_1["default"].relative(siteDir, versionMetadata.docsDirPath), docFileSource) }, expectedMetadata));
                        return [2 /*return*/];
                }
            });
        });
    }
    function testSlug(docFileSource, expectedPermalink) {
        return __awaiter(this, void 0, void 0, function () {
            var docFile, metadata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, readDoc(docFileSource)];
                    case 1:
                        docFile = _a.sent();
                        return [4 /*yield*/, docs_1.processDocMetadata({
                                docFile: docFile,
                                versionMetadata: versionMetadata,
                                context: context,
                                options: options
                            })];
                    case 2:
                        metadata = _a.sent();
                        expect(metadata.permalink).toEqual(expectedPermalink);
                        return [2 /*return*/];
                }
            });
        });
    }
    return { processDocFile: processDocFile, testMeta: testMeta, testSlug: testSlug };
}
describe('simple site', function () {
    function loadSite() {
        return __awaiter(this, void 0, void 0, function () {
            var siteDir, context, options, versionsMetadata, currentVersion, defaultTestUtils;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        siteDir = path_1["default"].join(fixtureDir, 'simple-site');
                        return [4 /*yield*/, index_1.loadContext(siteDir)];
                    case 1:
                        context = _a.sent();
                        options = __assign({ id: constants_1.DEFAULT_PLUGIN_ID }, options_1.DEFAULT_OPTIONS);
                        versionsMetadata = versions_1.readVersionsMetadata({
                            context: context,
                            options: __assign({ id: constants_1.DEFAULT_PLUGIN_ID }, options_1.DEFAULT_OPTIONS)
                        });
                        expect(versionsMetadata.length).toEqual(1);
                        currentVersion = versionsMetadata[0];
                        defaultTestUtils = createTestUtils({
                            siteDir: siteDir,
                            context: context,
                            options: options,
                            versionMetadata: currentVersion
                        });
                        return [2 /*return*/, {
                                siteDir: siteDir,
                                context: context,
                                options: options,
                                versionsMetadata: versionsMetadata,
                                defaultTestUtils: defaultTestUtils,
                                currentVersion: currentVersion
                            }];
                }
            });
        });
    }
    test('readVersionDocs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, options, currentVersion, docs;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), options = _a.options, currentVersion = _a.currentVersion;
                    return [4 /*yield*/, docs_1.readVersionDocs(currentVersion, options)];
                case 2:
                    docs = _b.sent();
                    expect(docs.map(function (doc) { return doc.source; }).sort()).toEqual([
                        'hello.md',
                        'ipsum.md',
                        'lorem.md',
                        'rootAbsoluteSlug.md',
                        'rootRelativeSlug.md',
                        'rootResolvedSlug.md',
                        'rootTryToEscapeSlug.md',
                        'foo/bar.md',
                        'foo/baz.md',
                        'slugs/absoluteSlug.md',
                        'slugs/relativeSlug.md',
                        'slugs/resolvedSlug.md',
                        'slugs/tryToEscapeSlug.md',
                    ].sort());
                    return [2 /*return*/];
            }
        });
    }); });
    test('normal docs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var defaultTestUtils;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    defaultTestUtils = (_a.sent()).defaultTestUtils;
                    return [4 /*yield*/, defaultTestUtils.testMeta(path_1["default"].join('foo', 'bar.md'), {
                            version: 'current',
                            id: 'foo/bar',
                            unversionedId: 'foo/bar',
                            isDocsHomePage: false,
                            permalink: '/docs/foo/bar',
                            slug: '/foo/bar',
                            title: 'Bar',
                            description: 'This is custom description'
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, defaultTestUtils.testMeta(path_1["default"].join('hello.md'), {
                            version: 'current',
                            id: 'hello',
                            unversionedId: 'hello',
                            isDocsHomePage: false,
                            permalink: '/docs/hello',
                            slug: '/hello',
                            title: 'Hello, World !',
                            description: "Hi, Endilie here :)"
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('homePageId doc', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, context, options, currentVersion, testUtilsLocal;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, context = _a.context, options = _a.options, currentVersion = _a.currentVersion;
                    testUtilsLocal = createTestUtils({
                        siteDir: siteDir,
                        context: context,
                        options: __assign(__assign({}, options), { homePageId: 'hello' }),
                        versionMetadata: currentVersion
                    });
                    return [4 /*yield*/, testUtilsLocal.testMeta(path_1["default"].join('hello.md'), {
                            version: 'current',
                            id: 'hello',
                            unversionedId: 'hello',
                            isDocsHomePage: true,
                            permalink: '/docs/',
                            slug: '/',
                            title: 'Hello, World !',
                            description: "Hi, Endilie here :)"
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('homePageId doc nested', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, context, options, currentVersion, testUtilsLocal;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, context = _a.context, options = _a.options, currentVersion = _a.currentVersion;
                    testUtilsLocal = createTestUtils({
                        siteDir: siteDir,
                        context: context,
                        options: __assign(__assign({}, options), { homePageId: 'foo/bar' }),
                        versionMetadata: currentVersion
                    });
                    return [4 /*yield*/, testUtilsLocal.testMeta(path_1["default"].join('foo', 'bar.md'), {
                            version: 'current',
                            id: 'foo/bar',
                            unversionedId: 'foo/bar',
                            isDocsHomePage: true,
                            permalink: '/docs/',
                            slug: '/',
                            title: 'Bar',
                            description: 'This is custom description'
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('docs with editUrl', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, context, options, currentVersion, testUtilsLocal;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, context = _a.context, options = _a.options, currentVersion = _a.currentVersion;
                    testUtilsLocal = createTestUtils({
                        siteDir: siteDir,
                        context: context,
                        options: __assign(__assign({}, options), { editUrl: 'https://github.com/facebook/docusaurus/edit/master/website' }),
                        versionMetadata: currentVersion
                    });
                    return [4 /*yield*/, testUtilsLocal.testMeta(path_1["default"].join('foo', 'baz.md'), {
                            version: 'current',
                            id: 'foo/baz',
                            unversionedId: 'foo/baz',
                            isDocsHomePage: false,
                            permalink: '/docs/foo/bazSlug.html',
                            slug: '/foo/bazSlug.html',
                            title: 'baz',
                            editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/docs/foo/baz.md',
                            description: 'Images'
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('docs with custom editUrl & unrelated frontmatter', function () { return __awaiter(void 0, void 0, void 0, function () {
        var defaultTestUtils;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    defaultTestUtils = (_a.sent()).defaultTestUtils;
                    return [4 /*yield*/, defaultTestUtils.testMeta('lorem.md', {
                            version: 'current',
                            id: 'lorem',
                            unversionedId: 'lorem',
                            isDocsHomePage: false,
                            permalink: '/docs/lorem',
                            slug: '/lorem',
                            title: 'lorem',
                            editUrl: 'https://github.com/customUrl/docs/lorem.md',
                            description: 'Lorem ipsum.'
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('docs with last update time and author', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, context, options, currentVersion, testUtilsLocal;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, context = _a.context, options = _a.options, currentVersion = _a.currentVersion;
                    testUtilsLocal = createTestUtils({
                        siteDir: siteDir,
                        context: context,
                        options: __assign(__assign({}, options), { showLastUpdateAuthor: true, showLastUpdateTime: true }),
                        versionMetadata: currentVersion
                    });
                    return [4 /*yield*/, testUtilsLocal.testMeta('lorem.md', {
                            version: 'current',
                            id: 'lorem',
                            unversionedId: 'lorem',
                            isDocsHomePage: false,
                            permalink: '/docs/lorem',
                            slug: '/lorem',
                            title: 'lorem',
                            editUrl: 'https://github.com/customUrl/docs/lorem.md',
                            description: 'Lorem ipsum.',
                            lastUpdatedAt: 1539502055,
                            lastUpdatedBy: 'Author'
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('docs with slugs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var defaultTestUtils;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    defaultTestUtils = (_a.sent()).defaultTestUtils;
                    return [4 /*yield*/, defaultTestUtils.testSlug(path_1["default"].join('rootRelativeSlug.md'), '/docs/rootRelativeSlug')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, defaultTestUtils.testSlug(path_1["default"].join('rootAbsoluteSlug.md'), '/docs/rootAbsoluteSlug')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, defaultTestUtils.testSlug(path_1["default"].join('rootResolvedSlug.md'), '/docs/hey/rootResolvedSlug')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, defaultTestUtils.testSlug(path_1["default"].join('rootTryToEscapeSlug.md'), '/docs/rootTryToEscapeSlug')];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, defaultTestUtils.testSlug(path_1["default"].join('slugs', 'absoluteSlug.md'), '/docs/absoluteSlug')];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, defaultTestUtils.testSlug(path_1["default"].join('slugs', 'relativeSlug.md'), '/docs/slugs/relativeSlug')];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, defaultTestUtils.testSlug(path_1["default"].join('slugs', 'resolvedSlug.md'), '/docs/slugs/hey/resolvedSlug')];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, defaultTestUtils.testSlug(path_1["default"].join('slugs', 'tryToEscapeSlug.md'), '/docs/tryToEscapeSlug')];
                case 9:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('docs with invalid id', function () { return __awaiter(void 0, void 0, void 0, function () {
        var defaultTestUtils;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    defaultTestUtils = (_a.sent()).defaultTestUtils;
                    expect(function () {
                        defaultTestUtils.processDocFile(createFakeDocFile({
                            source: 'some/fake/path',
                            frontmatter: {
                                id: 'Hello/world'
                            }
                        }));
                    }).toThrowErrorMatchingInlineSnapshot("\"Document id [Hello/world] cannot include \\\"/\\\".\"");
                    return [2 /*return*/];
            }
        });
    }); });
    test('docs with slug on doc home', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, context, options, currentVersion, testUtilsLocal;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, context = _a.context, options = _a.options, currentVersion = _a.currentVersion;
                    testUtilsLocal = createTestUtils({
                        siteDir: siteDir,
                        context: context,
                        options: __assign(__assign({}, options), { homePageId: 'homePageId' }),
                        versionMetadata: currentVersion
                    });
                    expect(function () {
                        testUtilsLocal.processDocFile(createFakeDocFile({
                            source: 'homePageId',
                            frontmatter: {
                                slug: '/x/y'
                            }
                        }));
                    }).toThrowErrorMatchingInlineSnapshot("\"The docs homepage (homePageId=homePageId) is not allowed to have a frontmatter slug=/x/y => you have to choose either homePageId or slug, not both\"");
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('versioned site', function () {
    function loadSite() {
        return __awaiter(this, void 0, void 0, function () {
            var siteDir, context, options, versionsMetadata, currentVersion, version101, version100, versionWithSlugs, currentVersionTestUtils, version101TestUtils, version100TestUtils, versionWithSlugsTestUtils;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        siteDir = path_1["default"].join(fixtureDir, 'versioned-site');
                        return [4 /*yield*/, index_1.loadContext(siteDir)];
                    case 1:
                        context = _a.sent();
                        options = __assign({ id: constants_1.DEFAULT_PLUGIN_ID }, options_1.DEFAULT_OPTIONS);
                        versionsMetadata = versions_1.readVersionsMetadata({
                            context: context,
                            options: __assign({ id: constants_1.DEFAULT_PLUGIN_ID }, options_1.DEFAULT_OPTIONS)
                        });
                        expect(versionsMetadata.length).toEqual(4);
                        currentVersion = versionsMetadata[0], version101 = versionsMetadata[1], version100 = versionsMetadata[2], versionWithSlugs = versionsMetadata[3];
                        currentVersionTestUtils = createTestUtils({
                            siteDir: siteDir,
                            context: context,
                            options: options,
                            versionMetadata: currentVersion
                        });
                        version101TestUtils = createTestUtils({
                            siteDir: siteDir,
                            context: context,
                            options: options,
                            versionMetadata: version101
                        });
                        version100TestUtils = createTestUtils({
                            siteDir: siteDir,
                            context: context,
                            options: options,
                            versionMetadata: version100
                        });
                        versionWithSlugsTestUtils = createTestUtils({
                            siteDir: siteDir,
                            context: context,
                            options: options,
                            versionMetadata: versionWithSlugs
                        });
                        return [2 /*return*/, {
                                siteDir: siteDir,
                                context: context,
                                options: options,
                                versionsMetadata: versionsMetadata,
                                currentVersionTestUtils: currentVersionTestUtils,
                                version101TestUtils: version101TestUtils,
                                version100: version100,
                                version100TestUtils: version100TestUtils,
                                versionWithSlugsTestUtils: versionWithSlugsTestUtils
                            }];
                }
            });
        });
    }
    test('next docs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var currentVersionTestUtils;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    currentVersionTestUtils = (_a.sent()).currentVersionTestUtils;
                    return [4 /*yield*/, currentVersionTestUtils.testMeta(path_1["default"].join('foo', 'bar.md'), {
                            id: 'foo/bar',
                            unversionedId: 'foo/bar',
                            isDocsHomePage: false,
                            permalink: '/docs/next/foo/barSlug',
                            slug: '/foo/barSlug',
                            title: 'bar',
                            description: 'This is next version of bar.',
                            version: 'current'
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, currentVersionTestUtils.testMeta(path_1["default"].join('hello.md'), {
                            id: 'hello',
                            unversionedId: 'hello',
                            isDocsHomePage: false,
                            permalink: '/docs/next/hello',
                            slug: '/hello',
                            title: 'hello',
                            description: 'Hello next !',
                            version: 'current'
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('versioned docs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, version101TestUtils, version100TestUtils;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), version101TestUtils = _a.version101TestUtils, version100TestUtils = _a.version100TestUtils;
                    return [4 /*yield*/, version100TestUtils.testMeta(path_1["default"].join('foo', 'bar.md'), {
                            id: 'version-1.0.0/foo/bar',
                            unversionedId: 'foo/bar',
                            isDocsHomePage: false,
                            permalink: '/docs/1.0.0/foo/barSlug',
                            slug: '/foo/barSlug',
                            title: 'bar',
                            description: 'Bar 1.0.0 !',
                            version: '1.0.0'
                        })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, version100TestUtils.testMeta(path_1["default"].join('hello.md'), {
                            id: 'version-1.0.0/hello',
                            unversionedId: 'hello',
                            isDocsHomePage: false,
                            permalink: '/docs/1.0.0/hello',
                            slug: '/hello',
                            title: 'hello',
                            description: 'Hello 1.0.0 ! (translated)',
                            version: '1.0.0',
                            source: '@site/i18n/en/docusaurus-plugin-content-docs/version-1.0.0/hello.md'
                        })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, version101TestUtils.testMeta(path_1["default"].join('foo', 'bar.md'), {
                            id: 'version-1.0.1/foo/bar',
                            unversionedId: 'foo/bar',
                            isDocsHomePage: false,
                            permalink: '/docs/foo/bar',
                            slug: '/foo/bar',
                            title: 'bar',
                            description: 'Bar 1.0.1 !',
                            version: '1.0.1'
                        })];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, version101TestUtils.testMeta(path_1["default"].join('hello.md'), {
                            id: 'version-1.0.1/hello',
                            unversionedId: 'hello',
                            isDocsHomePage: false,
                            permalink: '/docs/hello',
                            slug: '/hello',
                            title: 'hello',
                            description: 'Hello 1.0.1 !',
                            version: '1.0.1'
                        })];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('next doc slugs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var currentVersionTestUtils;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    currentVersionTestUtils = (_a.sent()).currentVersionTestUtils;
                    return [4 /*yield*/, currentVersionTestUtils.testSlug(path_1["default"].join('slugs', 'absoluteSlug.md'), '/docs/next/absoluteSlug')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, currentVersionTestUtils.testSlug(path_1["default"].join('slugs', 'relativeSlug.md'), '/docs/next/slugs/relativeSlug')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, currentVersionTestUtils.testSlug(path_1["default"].join('slugs', 'resolvedSlug.md'), '/docs/next/slugs/hey/resolvedSlug')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, currentVersionTestUtils.testSlug(path_1["default"].join('slugs', 'tryToEscapeSlug.md'), '/docs/next/tryToEscapeSlug')];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('versioned doc slugs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var versionWithSlugsTestUtils;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    versionWithSlugsTestUtils = (_a.sent()).versionWithSlugsTestUtils;
                    return [4 /*yield*/, versionWithSlugsTestUtils.testSlug(path_1["default"].join('rootAbsoluteSlug.md'), '/docs/withSlugs/rootAbsoluteSlug')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, versionWithSlugsTestUtils.testSlug(path_1["default"].join('rootRelativeSlug.md'), '/docs/withSlugs/rootRelativeSlug')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, versionWithSlugsTestUtils.testSlug(path_1["default"].join('rootResolvedSlug.md'), '/docs/withSlugs/hey/rootResolvedSlug')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, versionWithSlugsTestUtils.testSlug(path_1["default"].join('rootTryToEscapeSlug.md'), '/docs/withSlugs/rootTryToEscapeSlug')];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, versionWithSlugsTestUtils.testSlug(path_1["default"].join('slugs', 'absoluteSlug.md'), '/docs/withSlugs/absoluteSlug')];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, versionWithSlugsTestUtils.testSlug(path_1["default"].join('slugs', 'relativeSlug.md'), '/docs/withSlugs/slugs/relativeSlug')];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, versionWithSlugsTestUtils.testSlug(path_1["default"].join('slugs', 'resolvedSlug.md'), '/docs/withSlugs/slugs/hey/resolvedSlug')];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, versionWithSlugsTestUtils.testSlug(path_1["default"].join('slugs', 'tryToEscapeSlug.md'), '/docs/withSlugs/tryToEscapeSlug')];
                case 9:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('translated doc with editUrl', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, siteDir, context, options, version100, testUtilsLocal;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadSite()];
                case 1:
                    _a = _b.sent(), siteDir = _a.siteDir, context = _a.context, options = _a.options, version100 = _a.version100;
                    testUtilsLocal = createTestUtils({
                        siteDir: siteDir,
                        context: context,
                        options: __assign(__assign({}, options), { editUrl: 'https://github.com/facebook/docusaurus/edit/master/website' }),
                        versionMetadata: version100
                    });
                    return [4 /*yield*/, testUtilsLocal.testMeta(path_1["default"].join('hello.md'), {
                            id: 'version-1.0.0/hello',
                            unversionedId: 'hello',
                            isDocsHomePage: false,
                            permalink: '/docs/1.0.0/hello',
                            slug: '/hello',
                            title: 'hello',
                            description: 'Hello 1.0.0 ! (translated)',
                            version: '1.0.0',
                            source: '@site/i18n/en/docusaurus-plugin-content-docs/version-1.0.0/hello.md',
                            editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/i18n/en/docusaurus-plugin-content-docs/version-1.0.0/hello.md'
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
