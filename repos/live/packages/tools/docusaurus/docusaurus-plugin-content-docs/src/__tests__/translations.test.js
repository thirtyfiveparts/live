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
var constants_1 = require("../constants");
var translations_1 = require("../translations");
var utils_1 = require("@docusaurus/utils");
function createSampleDoc(doc) {
    return __assign({ editUrl: 'any', isDocsHomePage: false, lastUpdatedAt: 0, lastUpdatedBy: 'any', next: undefined, previous: undefined, permalink: 'any', slug: 'any', source: 'any', unversionedId: 'any', version: 'any', title: doc.id + " title", sidebar_label: doc.id + " title", description: doc.id + " description" }, doc);
}
function createSampleVersion(version) {
    return __assign({ versionLabel: version.versionName + " label", versionPath: '/docs/', mainDocId: '', permalinkToSidebar: {}, routePriority: undefined, sidebarFilePath: 'any', isLast: true, docsDirPath: 'any', docsDirPathLocalized: 'any', docs: [
            createSampleDoc({
                id: 'doc1'
            }),
            createSampleDoc({
                id: 'doc2'
            }),
            createSampleDoc({
                id: 'doc3'
            }),
            createSampleDoc({
                id: 'doc4'
            }),
            createSampleDoc({
                id: 'doc5'
            }),
        ], sidebars: {
            docs: [
                {
                    type: 'category',
                    label: 'Getting started',
                    collapsed: false,
                    items: [
                        {
                            type: 'doc',
                            id: 'doc1'
                        },
                        {
                            type: 'doc',
                            id: 'doc2'
                        },
                        {
                            type: 'link',
                            label: 'Link label',
                            href: 'https://facebook.com'
                        },
                        {
                            type: 'ref',
                            id: 'doc1'
                        },
                    ]
                },
                {
                    type: 'doc',
                    id: 'doc3'
                },
            ],
            otherSidebar: [
                {
                    type: 'doc',
                    id: 'doc4'
                },
                {
                    type: 'doc',
                    id: 'doc5'
                },
            ]
        } }, version);
}
var SampleLoadedContent = {
    loadedVersions: [
        createSampleVersion({
            versionName: constants_1.CURRENT_VERSION_NAME
        }),
        createSampleVersion({
            versionName: '2.0.0'
        }),
        createSampleVersion({
            versionName: '1.0.0'
        }),
    ]
};
function getSampleTranslationFiles() {
    return translations_1.getLoadedContentTranslationFiles(SampleLoadedContent);
}
function getSampleTranslationFilesTranslated() {
    var translationFiles = getSampleTranslationFiles();
    return translationFiles.map(function (translationFile) {
        return utils_1.updateTranslationFileMessages(translationFile, function (message) { return message + " (translated)"; });
    });
}
describe('getLoadedContentTranslationFiles', function () {
    test('should return translation files matching snapshot', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            expect(getSampleTranslationFiles()).toMatchSnapshot();
            return [2 /*return*/];
        });
    }); });
});
describe('translateLoadedContent', function () {
    test('should not translate anything if translation files are untranslated', function () {
        var translationFiles = getSampleTranslationFiles();
        expect(translations_1.translateLoadedContent(SampleLoadedContent, translationFiles)).toEqual(SampleLoadedContent);
    });
    test('should return translated loaded content matching snapshot', function () {
        var translationFiles = getSampleTranslationFilesTranslated();
        expect(translations_1.translateLoadedContent(SampleLoadedContent, translationFiles)).toMatchSnapshot();
    });
});
