"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
exports.__esModule = true;
var docsClientUtils_1 = require("../docsClientUtils");
var lodash_1 = require("lodash");
describe('docsClientUtils', function () {
    test('getActivePlugin', function () {
        var data = {
            pluginIosId: {
                path: '/ios',
                versions: []
            },
            pluginAndroidId: {
                path: '/android',
                versions: []
            }
        };
        expect(docsClientUtils_1.getActivePlugin(data, '/')).toEqual(undefined);
        expect(docsClientUtils_1.getActivePlugin(data, '/xyz')).toEqual(undefined);
        expect(function () {
            return docsClientUtils_1.getActivePlugin(data, '/', { failfast: true });
        }).toThrowErrorMatchingInlineSnapshot("\"Can't find active docs plugin for pathname=/, while it was expected to be found. Maybe you tried to use a docs feature that can only be used on a docs-related page? Existing docs plugin paths are: /ios, /android\"");
        expect(function () {
            return docsClientUtils_1.getActivePlugin(data, '/xyz', { failfast: true });
        }).toThrowErrorMatchingInlineSnapshot("\"Can't find active docs plugin for pathname=/xyz, while it was expected to be found. Maybe you tried to use a docs feature that can only be used on a docs-related page? Existing docs plugin paths are: /ios, /android\"");
        var activePluginIos = {
            pluginId: 'pluginIosId',
            pluginData: data.pluginIosId
        };
        expect(docsClientUtils_1.getActivePlugin(data, '/ios')).toEqual(activePluginIos);
        expect(docsClientUtils_1.getActivePlugin(data, '/ios/')).toEqual(activePluginIos);
        expect(docsClientUtils_1.getActivePlugin(data, '/ios/abc/def')).toEqual(activePluginIos);
        var activePluginAndroid = {
            pluginId: 'pluginAndroidId',
            pluginData: data.pluginAndroidId
        };
        expect(docsClientUtils_1.getActivePlugin(data, '/android')).toEqual(activePluginAndroid);
        expect(docsClientUtils_1.getActivePlugin(data, '/android/')).toEqual(activePluginAndroid);
        expect(docsClientUtils_1.getActivePlugin(data, '/android/ijk')).toEqual(activePluginAndroid);
    });
    test('getLatestVersion', function () {
        var versions = [
            {
                name: 'version1',
                label: 'version1',
                path: '/???',
                isLast: false,
                docs: [],
                mainDocId: '???'
            },
            {
                name: 'version2',
                label: 'version2',
                path: '/???',
                isLast: true,
                docs: [],
                mainDocId: '???'
            },
            {
                name: 'version3',
                label: 'version3',
                path: '/???',
                isLast: false,
                docs: [],
                mainDocId: '???'
            },
        ];
        expect(docsClientUtils_1.getLatestVersion({
            path: '???',
            versions: versions
        })).toEqual(versions[1]);
    });
    test('getActiveVersion', function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var data = {
            path: 'docs',
            versions: [
                {
                    name: 'next',
                    label: 'next',
                    isLast: false,
                    path: '/docs/next',
                    docs: [],
                    mainDocId: '???'
                },
                {
                    name: 'version2',
                    label: 'version2',
                    isLast: true,
                    path: '/docs',
                    docs: [],
                    mainDocId: '???'
                },
                {
                    name: 'version1',
                    label: 'version1',
                    isLast: false,
                    path: '/docs/version1',
                    docs: [],
                    mainDocId: '???'
                },
            ]
        };
        expect(docsClientUtils_1.getActiveVersion(data, '/someUnknownPath')).toEqual(undefined);
        expect((_a = docsClientUtils_1.getActiveVersion(data, '/docs/next')) === null || _a === void 0 ? void 0 : _a.name).toEqual('next');
        expect((_b = docsClientUtils_1.getActiveVersion(data, '/docs/next/')) === null || _b === void 0 ? void 0 : _b.name).toEqual('next');
        expect((_c = docsClientUtils_1.getActiveVersion(data, '/docs/next/someDoc')) === null || _c === void 0 ? void 0 : _c.name).toEqual('next');
        expect((_d = docsClientUtils_1.getActiveVersion(data, '/docs')) === null || _d === void 0 ? void 0 : _d.name).toEqual('version2');
        expect((_e = docsClientUtils_1.getActiveVersion(data, '/docs/')) === null || _e === void 0 ? void 0 : _e.name).toEqual('version2');
        expect((_f = docsClientUtils_1.getActiveVersion(data, '/docs/someDoc')) === null || _f === void 0 ? void 0 : _f.name).toEqual('version2');
        expect((_g = docsClientUtils_1.getActiveVersion(data, '/docs/version1')) === null || _g === void 0 ? void 0 : _g.name).toEqual('version1');
        expect((_h = docsClientUtils_1.getActiveVersion(data, '/docs/version1')) === null || _h === void 0 ? void 0 : _h.name).toEqual('version1');
        expect((_j = docsClientUtils_1.getActiveVersion(data, '/docs/version1/someDoc')) === null || _j === void 0 ? void 0 : _j.name).toEqual('version1');
    });
    test('getActiveDocContext', function () {
        var versionNext = {
            name: 'next',
            label: 'next',
            path: '/docs/next',
            isLast: false,
            mainDocId: 'doc1',
            docs: [
                {
                    id: 'doc1',
                    path: '/docs/next/'
                },
                {
                    id: 'doc2',
                    path: '/docs/next/doc2'
                },
            ]
        };
        var version2 = {
            name: 'version2',
            label: 'version2',
            isLast: true,
            path: '/docs',
            mainDocId: 'doc1',
            docs: [
                {
                    id: 'doc1',
                    path: '/docs/'
                },
                {
                    id: 'doc2',
                    path: '/docs/doc2'
                },
            ]
        };
        var version1 = {
            name: 'version1',
            label: 'version1',
            path: '/docs/version1',
            isLast: false,
            mainDocId: 'doc1',
            docs: [
                {
                    id: 'doc1',
                    path: '/docs/version1/'
                },
            ]
        };
        // shuffle, because order shouldn't matter
        var versions = lodash_1.shuffle([
            versionNext,
            version2,
            version1,
        ]);
        var data = {
            path: 'docs',
            versions: versions
        };
        expect(docsClientUtils_1.getActiveDocContext(data, '/doesNotExist')).toEqual({
            activeVersion: undefined,
            activeDoc: undefined,
            alternateDocVersions: {}
        });
        expect(docsClientUtils_1.getActiveDocContext(data, '/docs/next/doesNotExist')).toEqual({
            activeVersion: versionNext,
            activeDoc: undefined,
            alternateDocVersions: {}
        });
        expect(docsClientUtils_1.getActiveDocContext(data, '/docs/next')).toEqual({
            activeVersion: versionNext,
            activeDoc: versionNext.docs[0],
            alternateDocVersions: {
                next: versionNext.docs[0],
                version2: version2.docs[0],
                version1: version1.docs[0]
            }
        });
        expect(docsClientUtils_1.getActiveDocContext(data, '/docs/next/doc2')).toEqual({
            activeVersion: versionNext,
            activeDoc: versionNext.docs[1],
            alternateDocVersions: {
                next: versionNext.docs[1],
                version2: version2.docs[1],
                version1: undefined
            }
        });
        expect(docsClientUtils_1.getActiveDocContext(data, '/docs/')).toEqual({
            activeVersion: version2,
            activeDoc: version2.docs[0],
            alternateDocVersions: {
                next: versionNext.docs[0],
                version2: version2.docs[0],
                version1: version1.docs[0]
            }
        });
        expect(docsClientUtils_1.getActiveDocContext(data, '/docs/doc2')).toEqual({
            activeVersion: version2,
            activeDoc: version2.docs[1],
            alternateDocVersions: {
                next: versionNext.docs[1],
                version2: version2.docs[1],
                version1: undefined
            }
        });
        expect(docsClientUtils_1.getActiveDocContext(data, '/docs/version1')).toEqual({
            activeVersion: version1,
            activeDoc: version1.docs[0],
            alternateDocVersions: {
                next: versionNext.docs[0],
                version2: version2.docs[0],
                version1: version1.docs[0]
            }
        });
        expect(docsClientUtils_1.getActiveDocContext(data, '/docs/version1/doc2')).toEqual({
            activeVersion: version1,
            activeDoc: undefined,
            alternateDocVersions: {}
        });
    });
    test('getDocVersionSuggestions', function () {
        var versionNext = {
            name: 'next',
            label: 'next',
            isLast: false,
            path: '/docs/next',
            mainDocId: 'doc1',
            docs: [
                {
                    id: 'doc1',
                    path: '/docs/next/'
                },
                {
                    id: 'doc2',
                    path: '/docs/next/doc2'
                },
            ]
        };
        var version2 = {
            name: 'version2',
            label: 'version2',
            path: '/docs',
            isLast: true,
            mainDocId: 'doc1',
            docs: [
                {
                    id: 'doc1',
                    path: '/docs/'
                },
                {
                    id: 'doc2',
                    path: '/docs/doc2'
                },
            ]
        };
        var version1 = {
            name: 'version1',
            label: 'version1',
            isLast: false,
            path: '/docs/version1',
            mainDocId: 'doc1',
            docs: [
                {
                    id: 'doc1',
                    path: '/docs/version1/'
                },
            ]
        };
        // shuffle, because order shouldn't matter
        var versions = lodash_1.shuffle([
            versionNext,
            version2,
            version1,
        ]);
        var data = {
            path: 'docs',
            versions: versions
        };
        expect(docsClientUtils_1.getDocVersionSuggestions(data, '/doesNotExist')).toEqual({
            latestDocSuggestion: undefined,
            latestVersionSuggestion: version2
        });
        expect(docsClientUtils_1.getDocVersionSuggestions(data, '/docs/next')).toEqual({
            latestDocSuggestion: version2.docs[0],
            latestVersionSuggestion: version2
        });
        expect(docsClientUtils_1.getDocVersionSuggestions(data, '/docs/next/doc2')).toEqual({
            latestDocSuggestion: version2.docs[1],
            latestVersionSuggestion: version2
        });
        // nothing to suggest, we are already on latest version
        expect(docsClientUtils_1.getDocVersionSuggestions(data, '/docs/')).toEqual({
            latestDocSuggestion: undefined,
            latestVersionSuggestion: undefined
        });
        expect(docsClientUtils_1.getDocVersionSuggestions(data, '/docs/doc2')).toEqual({
            latestDocSuggestion: undefined,
            latestVersionSuggestion: undefined
        });
        expect(docsClientUtils_1.getDocVersionSuggestions(data, '/docs/version1/')).toEqual({
            latestDocSuggestion: version2.docs[0],
            latestVersionSuggestion: version2
        });
        expect(docsClientUtils_1.getDocVersionSuggestions(data, '/docs/version1/doc2')).toEqual({
            latestDocSuggestion: undefined,
            latestVersionSuggestion: version2
        });
    });
});
