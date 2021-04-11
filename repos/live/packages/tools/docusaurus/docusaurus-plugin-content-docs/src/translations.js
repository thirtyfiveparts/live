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
exports.translateLoadedContent = exports.getLoadedContentTranslationFiles = void 0;
var lodash_1 = require("lodash");
var sidebars_1 = require("./sidebars");
var utils_1 = require("@docusaurus/utils");
var constants_1 = require("./constants");
function getVersionFileName(versionName) {
    if (versionName === constants_1.CURRENT_VERSION_NAME) {
        return versionName;
    }
    else {
        // I don't like this "version-" prefix,
        // but it's for consistency with site/versioned_docs
        return "version-" + versionName;
    }
}
// TODO legacy, the sidebar name is like "version-2.0.0-alpha.66/docs"
// input: "version-2.0.0-alpha.66/docs"
// output: "docs"
function getNormalizedSidebarName(_a) {
    var versionName = _a.versionName, sidebarName = _a.sidebarName;
    if (versionName === constants_1.CURRENT_VERSION_NAME || !sidebarName.includes('/')) {
        return sidebarName;
    }
    var _b = sidebarName.split('/'), rest = _b.slice(1);
    return rest.join('/');
}
/*
// Do we need to translate doc metadatas?
// It seems translating frontmatter labels is good enough
function getDocTranslations(doc: DocMetadata): TranslationFileContent {
  return {
    [`${doc.unversionedId}.title`]: {
      message: doc.title,
      description: `The title for doc with id=${doc.unversionedId}`,
    },
    ...(doc.sidebar_label
      ? {
          [`${doc.unversionedId}.sidebar_label`]: {
            message: doc.sidebar_label,
            description: `The sidebar label for doc with id=${doc.unversionedId}`,
          },
        }
      : undefined),
  };
}
function translateDoc(
  doc: DocMetadata,
  docsTranslations: TranslationFileContent,
): DocMetadata {
  return {
    ...doc,
    title: docsTranslations[`${doc.unversionedId}.title`]?.message ?? doc.title,
    sidebar_label:
      docsTranslations[`${doc.unversionedId}.sidebar_label`]?.message ??
      doc.sidebar_label,
  };
}

function getDocsTranslations(version: LoadedVersion): TranslationFileContent {
  return mergeTranslations(version.docs.map(getDocTranslations));
}
function translateDocs(
  docs: DocMetadata[],
  docsTranslations: TranslationFileContent,
): DocMetadata[] {
  return docs.map((doc) => translateDoc(doc, docsTranslations));
}
 */
function getSidebarTranslationFileContent(sidebar, sidebarName) {
    var categories = sidebars_1.collectSidebarCategories(sidebar);
    var categoryContent = lodash_1.chain(categories)
        .keyBy(function (category) { return "sidebar." + sidebarName + ".category." + category.label; })
        .mapValues(function (category) { return ({
        message: category.label,
        description: "The label for category " + category.label + " in sidebar " + sidebarName
    }); })
        .value();
    var links = sidebars_1.collectSidebarLinks(sidebar);
    var linksContent = lodash_1.chain(links)
        .keyBy(function (link) { return "sidebar." + sidebarName + ".link." + link.label; })
        .mapValues(function (link) { return ({
        message: link.label,
        description: "The label for link " + link.label + " in sidebar " + sidebarName + ", linking to " + link.href
    }); })
        .value();
    return utils_1.mergeTranslations([categoryContent, linksContent]);
}
function translateSidebar(_a) {
    var sidebar = _a.sidebar, sidebarName = _a.sidebarName, sidebarsTranslations = _a.sidebarsTranslations;
    return sidebars_1.transformSidebarItems(sidebar, function (item) {
        var _a, _b, _c, _d;
        if (item.type === 'category') {
            return __assign(__assign({}, item), { label: (_b = (_a = sidebarsTranslations["sidebar." + sidebarName + ".category." + item.label]) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : item.label });
        }
        if (item.type === 'link') {
            return __assign(__assign({}, item), { label: (_d = (_c = sidebarsTranslations["sidebar." + sidebarName + ".link." + item.label]) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : item.label });
        }
        return item;
    });
}
function getSidebarsTranslations(version) {
    return utils_1.mergeTranslations(Object.entries(version.sidebars).map(function (_a) {
        var sidebarName = _a[0], sidebar = _a[1];
        var normalizedSidebarName = getNormalizedSidebarName({
            sidebarName: sidebarName,
            versionName: version.versionName
        });
        return getSidebarTranslationFileContent(sidebar, normalizedSidebarName);
    }));
}
function translateSidebars(version, sidebarsTranslations) {
    return lodash_1.mapValues(version.sidebars, function (sidebar, sidebarName) {
        return translateSidebar({
            sidebar: sidebar,
            sidebarName: getNormalizedSidebarName({
                sidebarName: sidebarName,
                versionName: version.versionName
            }),
            sidebarsTranslations: sidebarsTranslations
        });
    });
}
function getVersionTranslationFiles(version) {
    var versionTranslations = {
        'version.label': {
            message: version.versionLabel,
            description: "The label for version " + version.versionName
        }
    };
    var sidebarsTranslations = getSidebarsTranslations(version);
    // const docsTranslations: TranslationFileContent = getDocsTranslations(version);
    return [
        {
            path: getVersionFileName(version.versionName),
            content: utils_1.mergeTranslations([
                versionTranslations,
                sidebarsTranslations,
            ])
        },
    ];
}
function translateVersion(version, translationFiles) {
    var _a;
    var versionTranslations = translationFiles[getVersionFileName(version.versionName)].content;
    return __assign(__assign({}, version), { versionLabel: (_a = versionTranslations['version.label']) === null || _a === void 0 ? void 0 : _a.message, sidebars: translateSidebars(version, versionTranslations) });
}
function getVersionsTranslationFiles(versions) {
    return lodash_1.flatten(versions.map(getVersionTranslationFiles));
}
function translateVersions(versions, translationFiles) {
    return versions.map(function (version) { return translateVersion(version, translationFiles); });
}
function getLoadedContentTranslationFiles(loadedContent) {
    return getVersionsTranslationFiles(loadedContent.loadedVersions);
}
exports.getLoadedContentTranslationFiles = getLoadedContentTranslationFiles;
function translateLoadedContent(loadedContent, translationFiles) {
    var translationFilesMap = lodash_1.keyBy(translationFiles, function (f) { return f.path; });
    return {
        loadedVersions: translateVersions(loadedContent.loadedVersions, translationFilesMap)
    };
}
exports.translateLoadedContent = translateLoadedContent;
