"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
exports.processDocMetadata = exports.readVersionDocs = exports.readDocFile = void 0;
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
var utils_1 = require("@docusaurus/utils");
var lastUpdate_1 = require("./lastUpdate");
var slug_1 = require("./slug");
var constants_1 = require("./constants");
var globby_1 = require("globby");
var versions_1 = require("./versions");
function readLastUpdateData(filePath, options) {
    return __awaiter(this, void 0, void 0, function () {
        var showLastUpdateAuthor, showLastUpdateTime, fileLastUpdateData, _a, author, timestamp;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    showLastUpdateAuthor = options.showLastUpdateAuthor, showLastUpdateTime = options.showLastUpdateTime;
                    if (!(showLastUpdateAuthor || showLastUpdateTime)) return [3 /*break*/, 4];
                    if (!(process.env.NODE_ENV === 'production')) return [3 /*break*/, 2];
                    return [4 /*yield*/, lastUpdate_1.getFileLastUpdate(filePath)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = {
                        author: 'Author',
                        timestamp: 1539502055
                    };
                    _b.label = 3;
                case 3:
                    fileLastUpdateData = _a;
                    if (fileLastUpdateData) {
                        author = fileLastUpdateData.author, timestamp = fileLastUpdateData.timestamp;
                        return [2 /*return*/, {
                                lastUpdatedAt: showLastUpdateTime ? timestamp : undefined,
                                lastUpdatedBy: showLastUpdateAuthor ? author : undefined
                            }];
                    }
                    _b.label = 4;
                case 4: return [2 /*return*/, {}];
            }
        });
    });
}
function readDocFile(versionMetadata, source, options) {
    return __awaiter(this, void 0, void 0, function () {
        var folderPath, filePath, _a, content, lastUpdate;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, utils_1.getFolderContainingFile(versions_1.getDocsDirPaths(versionMetadata), source)];
                case 1:
                    folderPath = _b.sent();
                    filePath = path_1["default"].join(folderPath, source);
                    return [4 /*yield*/, Promise.all([
                            fs_extra_1["default"].readFile(filePath, 'utf-8'),
                            readLastUpdateData(filePath, options),
                        ])];
                case 2:
                    _a = _b.sent(), content = _a[0], lastUpdate = _a[1];
                    return [2 /*return*/, { source: source, content: content, lastUpdate: lastUpdate, filePath: filePath }];
            }
        });
    });
}
exports.readDocFile = readDocFile;
function readVersionDocs(versionMetadata, options) {
    return __awaiter(this, void 0, void 0, function () {
        var sources;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, globby_1["default"](options.include, {
                        cwd: versionMetadata.docsDirPath
                    })];
                case 1:
                    sources = _a.sent();
                    return [2 /*return*/, Promise.all(sources.map(function (source) { return readDocFile(versionMetadata, source, options); }))];
            }
        });
    });
}
exports.readVersionDocs = readVersionDocs;
function processDocMetadata(_a) {
    var docFile = _a.docFile, versionMetadata = _a.versionMetadata, context = _a.context, options = _a.options;
    var source = docFile.source, content = docFile.content, lastUpdate = docFile.lastUpdate, filePath = docFile.filePath;
    var editUrl = options.editUrl, homePageId = options.homePageId;
    var siteDir = context.siteDir;
    // ex: api/myDoc -> api
    // ex: myDoc -> .
    var docsFileDirName = path_1["default"].dirname(source);
    var docsEditUrl = utils_1.getEditUrl(path_1["default"].relative(siteDir, filePath), editUrl);
    var _b = utils_1.parseMarkdownString(content), _c = _b.frontMatter, frontMatter = _c === void 0 ? {} : _c, excerpt = _b.excerpt;
    var sidebar_label = frontMatter.sidebar_label, custom_edit_url = frontMatter.custom_edit_url;
    var baseID = frontMatter.id || path_1["default"].basename(source, path_1["default"].extname(source));
    if (baseID.includes('/')) {
        throw new Error("Document id [" + baseID + "] cannot include \"/\".");
    }
    // TODO legacy retrocompatibility
    // The same doc in 2 distinct version could keep the same id,
    // we just need to namespace the data by version
    var versionIdPart = versionMetadata.versionName === constants_1.CURRENT_VERSION_NAME
        ? ''
        : "version-" + versionMetadata.versionName + "/";
    // TODO legacy retrocompatibility
    // I think it's bad to affect the frontmatter id with the dirname
    var dirNameIdPart = docsFileDirName === '.' ? '' : docsFileDirName + "/";
    // TODO legacy composite id, requires a breaking change to modify this
    var id = "" + versionIdPart + dirNameIdPart + baseID;
    var unversionedId = "" + dirNameIdPart + baseID;
    // TODO remove soon, deprecated homePageId
    var isDocsHomePage = unversionedId === (homePageId !== null && homePageId !== void 0 ? homePageId : '_index');
    if (frontMatter.slug && isDocsHomePage) {
        throw new Error("The docs homepage (homePageId=" + homePageId + ") is not allowed to have a frontmatter slug=" + frontMatter.slug + " => you have to choose either homePageId or slug, not both");
    }
    var docSlug = isDocsHomePage
        ? '/'
        : slug_1["default"]({
            baseID: baseID,
            dirName: docsFileDirName,
            frontmatterSlug: frontMatter.slug
        });
    // Default title is the id.
    var title = frontMatter.title || baseID;
    var description = frontMatter.description || excerpt;
    var permalink = utils_1.normalizeUrl([versionMetadata.versionPath, docSlug]);
    // Assign all of object properties during instantiation (if possible) for
    // NodeJS optimization.
    // Adding properties to object after instantiation will cause hidden
    // class transitions.
    return {
        unversionedId: unversionedId,
        id: id,
        isDocsHomePage: isDocsHomePage,
        title: title,
        description: description,
        source: utils_1.aliasedSitePath(filePath, siteDir),
        slug: docSlug,
        permalink: permalink,
        editUrl: custom_edit_url !== undefined ? custom_edit_url : docsEditUrl,
        version: versionMetadata.versionName,
        lastUpdatedBy: lastUpdate.lastUpdatedBy,
        lastUpdatedAt: lastUpdate.lastUpdatedAt,
        sidebar_label: sidebar_label
    };
}
exports.processDocMetadata = processDocMetadata;
