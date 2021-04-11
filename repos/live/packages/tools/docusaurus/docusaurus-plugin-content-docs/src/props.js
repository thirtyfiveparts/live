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
exports.toVersionMetadataProp = exports.toSidebarsProp = void 0;
var lodash_1 = require("lodash");
function toSidebarsProp(loadedVersion) {
    var docsById = lodash_1.keyBy(loadedVersion.docs, function (doc) { return doc.id; });
    var convertDocLink = function (item) {
        var docId = item.id;
        var docMetadata = docsById[docId];
        if (!docMetadata) {
            throw new Error("Bad sidebars file. The document id '" + docId + "' was used in the sidebar, but no document with this id could be found.\nAvailable document ids=\n- " + Object.keys(docsById).sort().join('\n- '));
        }
        var title = docMetadata.title, permalink = docMetadata.permalink, sidebar_label = docMetadata.sidebar_label;
        return {
            type: 'link',
            label: sidebar_label || title,
            href: permalink,
            customProps: item.customProps
        };
    };
    var normalizeItem = function (item) {
        switch (item.type) {
            case 'category':
                return __assign(__assign({}, item), { items: item.items.map(normalizeItem) });
            case 'ref':
            case 'doc':
                return convertDocLink(item);
            case 'link':
            default:
                return item;
        }
    };
    // Transform the sidebar so that all sidebar item will be in the
    // form of 'link' or 'category' only.
    // This is what will be passed as props to the UI component.
    return lodash_1.mapValues(loadedVersion.sidebars, function (items) { return items.map(normalizeItem); });
}
exports.toSidebarsProp = toSidebarsProp;
function toVersionMetadataProp(pluginId, loadedVersion) {
    return {
        pluginId: pluginId,
        version: loadedVersion.versionName,
        label: loadedVersion.versionLabel,
        isLast: loadedVersion.isLast,
        docsSidebars: toSidebarsProp(loadedVersion),
        permalinkToSidebar: loadedVersion.permalinkToSidebar
    };
}
exports.toVersionMetadataProp = toVersionMetadataProp;
