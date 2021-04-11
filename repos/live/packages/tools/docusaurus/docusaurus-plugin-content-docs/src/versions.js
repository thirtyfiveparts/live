"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
exports.__esModule = true;
exports.getDocsDirPaths = exports.readVersionsMetadata = exports.getVersionsFilePath = exports.getVersionedSidebarsDirPath = exports.getVersionedDocsDirPath = void 0;
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
var constants_1 = require("./constants");
var constants_2 = require("@docusaurus/core/lib/constants");
var utils_1 = require("@docusaurus/utils");
var lodash_1 = require("lodash");
var chalk_1 = require("chalk");
// retro-compatibility: no prefix for the default plugin id
function addPluginIdPrefix(fileOrDir, pluginId) {
    if (pluginId === constants_2.DEFAULT_PLUGIN_ID) {
        return fileOrDir;
    }
    else {
        return pluginId + "_" + fileOrDir;
    }
}
function getVersionedDocsDirPath(siteDir, pluginId) {
    return path_1["default"].join(siteDir, addPluginIdPrefix(constants_1.VERSIONED_DOCS_DIR, pluginId));
}
exports.getVersionedDocsDirPath = getVersionedDocsDirPath;
function getVersionedSidebarsDirPath(siteDir, pluginId) {
    return path_1["default"].join(siteDir, addPluginIdPrefix(constants_1.VERSIONED_SIDEBARS_DIR, pluginId));
}
exports.getVersionedSidebarsDirPath = getVersionedSidebarsDirPath;
function getVersionsFilePath(siteDir, pluginId) {
    return path_1["default"].join(siteDir, addPluginIdPrefix(constants_1.VERSIONS_JSON_FILE, pluginId));
}
exports.getVersionsFilePath = getVersionsFilePath;
function ensureValidVersionString(version) {
    if (typeof version !== 'string') {
        throw new Error("versions should be strings. Found type=[" + typeof version + "] for version=[" + version + "]");
    }
    // Should we forbid versions with special chars like / ?
    if (version.trim().length === 0) {
        throw new Error("Invalid version=[" + version + "]");
    }
}
function ensureValidVersionArray(versionArray) {
    if (!(versionArray instanceof Array)) {
        throw new Error("The versions file should contain an array of versions! Found content=" + JSON.stringify(versionArray));
    }
    versionArray.forEach(ensureValidVersionString);
}
// TODO not easy to make async due to many deps
function readVersionsFile(siteDir, pluginId) {
    var versionsFilePath = getVersionsFilePath(siteDir, pluginId);
    if (fs_extra_1["default"].existsSync(versionsFilePath)) {
        var content = JSON.parse(fs_extra_1["default"].readFileSync(versionsFilePath, 'utf8'));
        ensureValidVersionArray(content);
        return content;
    }
    else {
        return null;
    }
}
// TODO not easy to make async due to many deps
function readVersionNames(siteDir, options) {
    var versionFileContent = readVersionsFile(siteDir, options.id);
    if (!versionFileContent && options.disableVersioning) {
        throw new Error("Docs: using disableVersioning=" + options.disableVersioning + " option on a non-versioned site does not make sense");
    }
    var versions = options.disableVersioning ? [] : versionFileContent !== null && versionFileContent !== void 0 ? versionFileContent : [];
    // We add the current version at the beginning, unless
    // - user don't want to
    // - it's been explicitly added to versions.json
    if (options.includeCurrentVersion &&
        !versions.includes(constants_1.CURRENT_VERSION_NAME)) {
        versions.unshift(constants_1.CURRENT_VERSION_NAME);
    }
    if (versions.length === 0) {
        throw new Error("It is not possible to use docs without any version. Please check the configuration of these options: includeCurrentVersion=" + options.includeCurrentVersion + " disableVersioning=" + options.disableVersioning);
    }
    return versions;
}
function getVersionMetadataPaths(_a) {
    var versionName = _a.versionName, context = _a.context, options = _a.options;
    var isCurrentVersion = versionName === constants_1.CURRENT_VERSION_NAME;
    var docsDirPath = isCurrentVersion
        ? path_1["default"].resolve(context.siteDir, options.path)
        : path_1["default"].join(getVersionedDocsDirPath(context.siteDir, options.id), "version-" + versionName);
    var docsDirPathLocalized = utils_1.getPluginI18nPath({
        siteDir: context.siteDir,
        locale: context.i18n.currentLocale,
        pluginName: 'docusaurus-plugin-content-docs',
        pluginId: options.id,
        subPaths: [
            versionName === constants_1.CURRENT_VERSION_NAME
                ? constants_1.CURRENT_VERSION_NAME
                : "version-" + versionName,
        ]
    });
    var sidebarFilePath = isCurrentVersion
        ? path_1["default"].resolve(context.siteDir, options.sidebarPath)
        : path_1["default"].join(getVersionedSidebarsDirPath(context.siteDir, options.id), "version-" + versionName + "-sidebars.json");
    return { docsDirPath: docsDirPath, docsDirPathLocalized: docsDirPathLocalized, sidebarFilePath: sidebarFilePath };
}
function createVersionMetadata(_a) {
    var _b, _c, _d;
    var versionName = _a.versionName, isLast = _a.isLast, context = _a.context, options = _a.options;
    var _e = getVersionMetadataPaths({
        versionName: versionName,
        context: context,
        options: options
    }), sidebarFilePath = _e.sidebarFilePath, docsDirPath = _e.docsDirPath, docsDirPathLocalized = _e.docsDirPathLocalized;
    // retro-compatible values
    var defaultVersionLabel = versionName === constants_1.CURRENT_VERSION_NAME ? 'Next' : versionName;
    var defaultVersionPathPart = isLast
        ? ''
        : versionName === constants_1.CURRENT_VERSION_NAME
            ? 'next'
            : versionName;
    var versionOptions = (_b = options.versions[versionName]) !== null && _b !== void 0 ? _b : {};
    var versionLabel = (_c = versionOptions.label) !== null && _c !== void 0 ? _c : defaultVersionLabel;
    var versionPathPart = (_d = versionOptions.path) !== null && _d !== void 0 ? _d : defaultVersionPathPart;
    var versionPath = utils_1.normalizeUrl([
        context.baseUrl,
        options.routeBasePath,
        versionPathPart,
    ]);
    // Because /docs/:route` should always be after `/docs/versionName/:route`.
    var routePriority = versionPathPart === '' ? -1 : undefined;
    return {
        versionName: versionName,
        versionLabel: versionLabel,
        versionPath: versionPath,
        isLast: isLast,
        routePriority: routePriority,
        sidebarFilePath: sidebarFilePath,
        docsDirPath: docsDirPath,
        docsDirPathLocalized: docsDirPathLocalized
    };
}
function checkVersionMetadataPaths(_a) {
    var versionName = _a.versionName, docsDirPath = _a.docsDirPath, sidebarFilePath = _a.sidebarFilePath;
    if (!fs_extra_1["default"].existsSync(docsDirPath)) {
        throw new Error("The docs folder does not exist for version [" + versionName + "]. A docs folder is expected to be found at " + docsDirPath);
    }
    // See https://github.com/facebook/docusaurus/issues/3366
    if (!fs_extra_1["default"].existsSync(sidebarFilePath)) {
        console.log(chalk_1["default"].yellow("The sidebar file of docs version [" + versionName + "] does not exist. It is optional, but should rather be provided at " + sidebarFilePath));
    }
}
// TODO for retrocompatibility with existing behavior
// We should make this configurable
// "last version" is not a very good concept nor api surface
function getDefaultLastVersionName(versionNames) {
    if (versionNames.length === 1) {
        return versionNames[0];
    }
    else {
        return versionNames.filter(function (versionName) { return versionName !== constants_1.CURRENT_VERSION_NAME; })[0];
    }
}
function checkVersionsOptions(availableVersionNames, options) {
    var availableVersionNamesMsg = "Available version names are: " + availableVersionNames.join(', ');
    if (options.lastVersion &&
        !availableVersionNames.includes(options.lastVersion)) {
        throw new Error("Docs option lastVersion=" + options.lastVersion + " is invalid. " + availableVersionNamesMsg);
    }
    var unknownVersionConfigNames = lodash_1.difference(Object.keys(options.versions), availableVersionNames);
    if (unknownVersionConfigNames.length > 0) {
        throw new Error("Bad docs options.versions: unknown versions found: " + unknownVersionConfigNames.join(',') + ". " + availableVersionNamesMsg);
    }
    if (options.onlyIncludeVersions) {
        if (options.onlyIncludeVersions.length === 0) {
            throw new Error("Bad docs options.onlyIncludeVersions: an empty array is not allowed, at least one version is needed");
        }
        var unknownOnlyIncludeVersionNames = lodash_1.difference(options.onlyIncludeVersions, availableVersionNames);
        if (unknownOnlyIncludeVersionNames.length > 0) {
            throw new Error("Bad docs options.onlyIncludeVersions: unknown versions found: " + unknownOnlyIncludeVersionNames.join(',') + ". " + availableVersionNamesMsg);
        }
        if (options.lastVersion &&
            !options.onlyIncludeVersions.includes(options.lastVersion)) {
            throw new Error("Bad docs options.lastVersion: if you use both the onlyIncludeVersions and lastVersion options, then lastVersion must be present in the provided onlyIncludeVersions array");
        }
    }
}
// Filter versions according to provided options
// Note: we preserve the order in which versions are provided
// the order of the onlyIncludeVersions array does not matter
function filterVersions(versionNamesUnfiltered, options) {
    if (options.onlyIncludeVersions) {
        return versionNamesUnfiltered.filter(function (name) {
            return options.onlyIncludeVersions.includes(name);
        });
    }
    else {
        return versionNamesUnfiltered;
    }
}
function readVersionsMetadata(_a) {
    var _b;
    var context = _a.context, options = _a.options;
    var versionNamesUnfiltered = readVersionNames(context.siteDir, options);
    checkVersionsOptions(versionNamesUnfiltered, options);
    var versionNames = filterVersions(versionNamesUnfiltered, options);
    var lastVersionName = (_b = options.lastVersion) !== null && _b !== void 0 ? _b : getDefaultLastVersionName(versionNames);
    var versionsMetadata = versionNames.map(function (versionName) {
        return createVersionMetadata({
            versionName: versionName,
            isLast: versionName === lastVersionName,
            context: context,
            options: options
        });
    });
    versionsMetadata.forEach(checkVersionMetadataPaths);
    return versionsMetadata;
}
exports.readVersionsMetadata = readVersionsMetadata;
// order matter!
// Read in priority the localized path, then the unlocalized one
// We want the localized doc to "override" the unlocalized one
function getDocsDirPaths(versionMetadata) {
    return [versionMetadata.docsDirPathLocalized, versionMetadata.docsDirPath];
}
exports.getDocsDirPaths = getDocsDirPaths;
