"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.getDocVersionSuggestions = exports.getActiveDocContext = exports.getActiveVersion = exports.getLatestVersion = exports.getActivePlugin = void 0;
var router_1 = require("@docusaurus/router");
function getActivePlugin(allPluginDatas, pathname, options) {
    if (options === void 0) { options = {}; }
    var activeEntry = Object.entries(allPluginDatas).find(function (_a) {
        var _id = _a[0], pluginData = _a[1];
        return !!router_1.matchPath(pathname, {
            path: pluginData.path,
            exact: false,
            strict: false
        });
    });
    var activePlugin = activeEntry
        ? { pluginId: activeEntry[0], pluginData: activeEntry[1] }
        : undefined;
    if (!activePlugin && options.failfast) {
        throw new Error("Can't find active docs plugin for pathname=" + pathname + ", while it was expected to be found. Maybe you tried to use a docs feature that can only be used on a docs-related page? Existing docs plugin paths are: " + Object.values(allPluginDatas)
            .map(function (plugin) { return plugin.path; })
            .join(', '));
    }
    return activePlugin;
}
exports.getActivePlugin = getActivePlugin;
exports.getLatestVersion = function (data) {
    return data.versions.find(function (version) { return version.isLast; });
};
// Note: return undefined on doc-unrelated pages,
// because there's no version currently considered as active
exports.getActiveVersion = function (data, pathname) {
    var lastVersion = exports.getLatestVersion(data);
    // Last version is a route like /docs/*,
    // we need to try to match it last or it would match /docs/version-1.0/* as well
    var orderedVersionsMetadata = __spreadArrays(data.versions.filter(function (version) { return version !== lastVersion; }), [
        lastVersion,
    ]);
    return orderedVersionsMetadata.find(function (version) {
        return !!router_1.matchPath(pathname, {
            path: version.path,
            exact: false,
            strict: false
        });
    });
};
exports.getActiveDocContext = function (data, pathname) {
    var activeVersion = exports.getActiveVersion(data, pathname);
    var activeDoc = activeVersion === null || activeVersion === void 0 ? void 0 : activeVersion.docs.find(function (doc) {
        return !!router_1.matchPath(pathname, {
            path: doc.path,
            exact: true,
            strict: false
        });
    });
    function getAlternateVersionDocs(docId) {
        var result = {};
        data.versions.forEach(function (version) {
            version.docs.forEach(function (doc) {
                if (doc.id === docId) {
                    result[version.name] = doc;
                }
            });
        });
        return result;
    }
    var alternateVersionDocs = activeDoc
        ? getAlternateVersionDocs(activeDoc.id)
        : {};
    return {
        activeVersion: activeVersion,
        activeDoc: activeDoc,
        alternateDocVersions: alternateVersionDocs
    };
};
exports.getDocVersionSuggestions = function (data, pathname) {
    var latestVersion = exports.getLatestVersion(data);
    var activeDocContext = exports.getActiveDocContext(data, pathname);
    // We only suggest another doc/version if user is not using the latest version
    var isNotOnLatestVersion = activeDocContext.activeVersion !== latestVersion;
    var latestDocSuggestion = isNotOnLatestVersion
        ? activeDocContext === null || activeDocContext === void 0 ? void 0 : activeDocContext.alternateDocVersions[latestVersion.name] : undefined;
    var latestVersionSuggestion = isNotOnLatestVersion
        ? latestVersion
        : undefined;
    return { latestDocSuggestion: latestDocSuggestion, latestVersionSuggestion: latestVersionSuggestion };
};
