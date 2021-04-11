"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
exports.__esModule = true;
exports.useDocVersionSuggestions = exports.useActiveDocContext = exports.useActiveVersion = exports.useLatestVersion = exports.useVersions = exports.useActivePluginAndVersion = exports.useActivePlugin = exports.useDocsData = exports.useAllDocsData = void 0;
var router_1 = require("@docusaurus/router");
var useGlobalData_1 = require("@docusaurus/useGlobalData");
var docsClientUtils_1 = require("../../client/docsClientUtils");
exports.useAllDocsData = function () {
    return useGlobalData_1.useAllPluginInstancesData('docusaurus-plugin-content-docs');
};
exports.useDocsData = function (pluginId) {
    return useGlobalData_1.usePluginData('docusaurus-plugin-content-docs', pluginId);
};
exports.useActivePlugin = function (options) {
    if (options === void 0) { options = {}; }
    var data = exports.useAllDocsData();
    var pathname = router_1.useLocation().pathname;
    return docsClientUtils_1.getActivePlugin(data, pathname, options);
};
exports.useActivePluginAndVersion = function (options) {
    if (options === void 0) { options = {}; }
    var activePlugin = exports.useActivePlugin(options);
    var pathname = router_1.useLocation().pathname;
    if (activePlugin) {
        var activeVersion = docsClientUtils_1.getActiveVersion(activePlugin.pluginData, pathname);
        return {
            activePlugin: activePlugin,
            activeVersion: activeVersion
        };
    }
    return undefined;
};
// versions are returned ordered (most recent first)
exports.useVersions = function (pluginId) {
    var data = exports.useDocsData(pluginId);
    return data.versions;
};
exports.useLatestVersion = function (pluginId) {
    var data = exports.useDocsData(pluginId);
    return docsClientUtils_1.getLatestVersion(data);
};
// Note: return undefined on doc-unrelated pages,
// because there's no version currently considered as active
exports.useActiveVersion = function (pluginId) {
    var data = exports.useDocsData(pluginId);
    var pathname = router_1.useLocation().pathname;
    return docsClientUtils_1.getActiveVersion(data, pathname);
};
exports.useActiveDocContext = function (pluginId) {
    var data = exports.useDocsData(pluginId);
    var pathname = router_1.useLocation().pathname;
    return docsClientUtils_1.getActiveDocContext(data, pathname);
};
// Useful to say "hey, you are not on the latest docs version, please switch"
exports.useDocVersionSuggestions = function (pluginId) {
    var data = exports.useDocsData(pluginId);
    var pathname = router_1.useLocation().pathname;
    return docsClientUtils_1.getDocVersionSuggestions(data, pathname);
};
