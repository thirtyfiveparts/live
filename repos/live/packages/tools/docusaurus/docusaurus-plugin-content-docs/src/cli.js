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
exports.__esModule = true;
exports.cliDocsVersionCommand = void 0;
var versions_1 = require("./versions");
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var sidebars_1 = require("./sidebars");
var constants_1 = require("@docusaurus/core/lib/constants");
// Tests depend on non-default export for mocking.
// eslint-disable-next-line import/prefer-default-export
function cliDocsVersionCommand(version, siteDir, pluginId, options) {
    // It wouldn't be very user-friendly to show a [default] log prefix,
    // so we use [docs] instead of [default]
    var pluginIdLogPrefix = pluginId === constants_1.DEFAULT_PLUGIN_ID ? '[docs] ' : "[" + pluginId + "] ";
    if (!version) {
        throw new Error(pluginIdLogPrefix + "No version tag specified!. Pass the version you wish to create as an argument. Ex: 1.0.0");
    }
    if (version.includes('/') || version.includes('\\')) {
        throw new Error(pluginIdLogPrefix + "Invalid version tag specified! Do not include slash (/) or (\\). Try something like: 1.0.0");
    }
    if (version.length > 32) {
        throw new Error(pluginIdLogPrefix + "Invalid version tag specified! Length must <= 32 characters. Try something like: 1.0.0");
    }
    // Since we are going to create `version-${version}` folder, we need to make
    // sure it's a valid pathname.
    if (/[<>:"\/\\|?*\x00-\x1F]/g.test(version)) {
        throw new Error(pluginIdLogPrefix + "Invalid version tag specified! Please ensure its a valid pathname too. Try something like: 1.0.0");
    }
    if (/^\.\.?$/.test(version)) {
        throw new Error(pluginIdLogPrefix + "Invalid version tag specified! Do not name your version \".\" or \"..\". Try something like: 1.0.0");
    }
    // Load existing versions.
    var versions = [];
    var versionsJSONFile = versions_1.getVersionsFilePath(siteDir, pluginId);
    if (fs_extra_1["default"].existsSync(versionsJSONFile)) {
        versions = JSON.parse(fs_extra_1["default"].readFileSync(versionsJSONFile, 'utf8'));
    }
    // Check if version already exists.
    if (versions.includes(version)) {
        throw new Error(pluginIdLogPrefix + "This version already exists!. Use a version tag that does not already exist.");
    }
    var docsPath = options.path, sidebarPath = options.sidebarPath;
    // Copy docs files.
    var docsDir = path_1["default"].join(siteDir, docsPath);
    if (fs_extra_1["default"].existsSync(docsDir) && fs_extra_1["default"].readdirSync(docsDir).length > 0) {
        var versionedDir = versions_1.getVersionedDocsDirPath(siteDir, pluginId);
        var newVersionDir = path_1["default"].join(versionedDir, "version-" + version);
        fs_extra_1["default"].copySync(docsDir, newVersionDir);
    }
    else {
        throw new Error(pluginIdLogPrefix + "There is no docs to version !");
    }
    // Load current sidebar and create a new versioned sidebars file.
    if (fs_extra_1["default"].existsSync(sidebarPath)) {
        var loadedSidebars = sidebars_1.loadSidebars(sidebarPath);
        // Transform id in original sidebar to versioned id.
        var normalizeItem_1 = function (item) {
            switch (item.type) {
                case 'category':
                    return __assign(__assign({}, item), { items: item.items.map(normalizeItem_1) });
                case 'ref':
                case 'doc':
                    return {
                        type: item.type,
                        id: "version-" + version + "/" + item.id
                    };
                default:
                    return item;
            }
        };
        var versionedSidebar = Object.entries(loadedSidebars).reduce(function (acc, _a) {
            var sidebarId = _a[0], sidebarItems = _a[1];
            var newVersionedSidebarId = "version-" + version + "/" + sidebarId;
            acc[newVersionedSidebarId] = sidebarItems.map(normalizeItem_1);
            return acc;
        }, {});
        var versionedSidebarsDir = versions_1.getVersionedSidebarsDirPath(siteDir, pluginId);
        var newSidebarFile = path_1["default"].join(versionedSidebarsDir, "version-" + version + "-sidebars.json");
        fs_extra_1["default"].ensureDirSync(path_1["default"].dirname(newSidebarFile));
        fs_extra_1["default"].writeFileSync(newSidebarFile, JSON.stringify(versionedSidebar, null, 2) + "\n", 'utf8');
    }
    // Update versions.json file.
    versions.unshift(version);
    fs_extra_1["default"].ensureDirSync(path_1["default"].dirname(versionsJSONFile));
    fs_extra_1["default"].writeFileSync(versionsJSONFile, JSON.stringify(versions, null, 2) + "\n");
    console.log(pluginIdLogPrefix + "Version " + version + " created!");
}
exports.cliDocsVersionCommand = cliDocsVersionCommand;
