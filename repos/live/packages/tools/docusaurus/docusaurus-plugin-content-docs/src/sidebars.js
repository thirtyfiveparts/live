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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.createSidebarsUtils = exports.collectSidebarsDocIds = exports.transformSidebarItems = exports.collectSidebarLinks = exports.collectSidebarCategories = exports.collectSidebarDocItems = exports.loadSidebars = void 0;
var lodash_flatmap_1 = require("lodash.flatmap");
var fs_extra_1 = require("fs-extra");
var import_fresh_1 = require("import-fresh");
var lodash_1 = require("lodash");
var utils_1 = require("@docusaurus/utils");
function isCategoryShorthand(item) {
    return typeof item !== 'string' && !item.type;
}
// categories are collapsed by default, unless user set collapsed = false
var defaultCategoryCollapsedValue = true;
/**
 * Convert {category1: [item1,item2]} shorthand syntax to long-form syntax
 */
function normalizeCategoryShorthand(sidebar) {
    return Object.entries(sidebar).map(function (_a) {
        var label = _a[0], items = _a[1];
        return ({
            type: 'category',
            collapsed: defaultCategoryCollapsedValue,
            label: label,
            items: items
        });
    });
}
/**
 * Check that item contains only allowed keys.
 */
function assertItem(item, keys) {
    var unknownKeys = Object.keys(item).filter(
    // @ts-expect-error: key is always string
    function (key) { return !keys.includes(key) && key !== 'type'; });
    if (unknownKeys.length) {
        throw new Error("Unknown sidebar item keys: " + unknownKeys + ". Item: " + JSON.stringify(item));
    }
}
function assertIsCategory(item) {
    assertItem(item, ['items', 'label', 'collapsed', 'customProps']);
    if (typeof item.label !== 'string') {
        throw new Error("Error loading " + JSON.stringify(item) + ". \"label\" must be a string.");
    }
    if (!Array.isArray(item.items)) {
        throw new Error("Error loading " + JSON.stringify(item) + ". \"items\" must be an array.");
    }
    // "collapsed" is an optional property
    if (item.hasOwnProperty('collapsed') && typeof item.collapsed !== 'boolean') {
        throw new Error("Error loading " + JSON.stringify(item) + ". \"collapsed\" must be a boolean.");
    }
}
function assertIsDoc(item) {
    assertItem(item, ['id', 'customProps']);
    if (typeof item.id !== 'string') {
        throw new Error("Error loading " + JSON.stringify(item) + ". \"id\" must be a string.");
    }
}
function assertIsLink(item) {
    assertItem(item, ['href', 'label', 'customProps']);
    if (typeof item.href !== 'string') {
        throw new Error("Error loading " + JSON.stringify(item) + ". \"href\" must be a string.");
    }
    if (typeof item.label !== 'string') {
        throw new Error("Error loading " + JSON.stringify(item) + ". \"label\" must be a string.");
    }
}
/**
 * Normalizes recursively item and all its children. Ensures that at the end
 * each item will be an object with the corresponding type.
 */
function normalizeItem(item) {
    if (typeof item === 'string') {
        return [
            {
                type: 'doc',
                id: item
            },
        ];
    }
    if (isCategoryShorthand(item)) {
        return lodash_flatmap_1["default"](normalizeCategoryShorthand(item), normalizeItem);
    }
    switch (item.type) {
        case 'category':
            assertIsCategory(item);
            return [
                __assign(__assign({ collapsed: defaultCategoryCollapsedValue }, item), { items: lodash_flatmap_1["default"](item.items, normalizeItem) }),
            ];
        case 'link':
            assertIsLink(item);
            return [item];
        case 'ref':
        case 'doc':
            assertIsDoc(item);
            return [item];
        default: {
            var extraMigrationError = item.type === 'subcategory'
                ? "Docusaurus v2: 'subcategory' has been renamed as 'category'"
                : '';
            throw new Error("Unknown sidebar item type [" + item.type + "]. Sidebar item=" + JSON.stringify(item) + " " + extraMigrationError);
        }
    }
}
function normalizeSidebar(sidebar) {
    var normalizedSidebar = Array.isArray(sidebar)
        ? sidebar
        : normalizeCategoryShorthand(sidebar);
    return lodash_flatmap_1["default"](normalizedSidebar, normalizeItem);
}
function normalizeSidebars(sidebars) {
    return lodash_1.mapValues(sidebars, normalizeSidebar);
}
// TODO refactor: make async
function loadSidebars(sidebarFilePath) {
    if (!sidebarFilePath) {
        throw new Error("sidebarFilePath not provided: " + sidebarFilePath);
    }
    // sidebars file is optional, some users use docs without sidebars!
    // See https://github.com/facebook/docusaurus/issues/3366
    if (!fs_extra_1["default"].existsSync(sidebarFilePath)) {
        // throw new Error(`No sidebar file exist at path: ${sidebarFilePath}`);
        return {};
    }
    // We don't want sidebars to be cached because of hot reloading.
    var sidebarJson = import_fresh_1["default"](sidebarFilePath);
    return normalizeSidebars(sidebarJson);
}
exports.loadSidebars = loadSidebars;
function collectSidebarItemsOfType(type, sidebar) {
    function collectRecursive(item) {
        var currentItemsCollected = item.type === type ? [item] : [];
        var childItemsCollected = item.type === 'category' ? lodash_1.flatten(item.items.map(collectRecursive)) : [];
        return __spreadArrays(currentItemsCollected, childItemsCollected);
    }
    return lodash_1.flatten(sidebar.map(collectRecursive));
}
function collectSidebarDocItems(sidebar) {
    return collectSidebarItemsOfType('doc', sidebar);
}
exports.collectSidebarDocItems = collectSidebarDocItems;
function collectSidebarCategories(sidebar) {
    return collectSidebarItemsOfType('category', sidebar);
}
exports.collectSidebarCategories = collectSidebarCategories;
function collectSidebarLinks(sidebar) {
    return collectSidebarItemsOfType('link', sidebar);
}
exports.collectSidebarLinks = collectSidebarLinks;
function transformSidebarItems(sidebar, updateFn) {
    function transformRecursive(item) {
        if (item.type === 'category') {
            return updateFn(__assign(__assign({}, item), { items: item.items.map(transformRecursive) }));
        }
        return updateFn(item);
    }
    return sidebar.map(transformRecursive);
}
exports.transformSidebarItems = transformSidebarItems;
function collectSidebarsDocIds(sidebars) {
    return lodash_1.mapValues(sidebars, function (sidebar) {
        return collectSidebarDocItems(sidebar).map(function (docItem) { return docItem.id; });
    });
}
exports.collectSidebarsDocIds = collectSidebarsDocIds;
function createSidebarsUtils(sidebars) {
    var sidebarNameToDocIds = collectSidebarsDocIds(sidebars);
    function getFirstDocIdOfFirstSidebar() {
        var _a;
        return (_a = Object.values(sidebarNameToDocIds)[0]) === null || _a === void 0 ? void 0 : _a[0];
    }
    function getSidebarNameByDocId(docId) {
        // TODO lookup speed can be optimized
        var entry = Object.entries(sidebarNameToDocIds).find(function (_a) {
            var _sidebarName = _a[0], docIds = _a[1];
            return docIds.includes(docId);
        });
        return entry === null || entry === void 0 ? void 0 : entry[0];
    }
    function getDocNavigation(docId) {
        var sidebarName = getSidebarNameByDocId(docId);
        if (sidebarName) {
            var docIds = sidebarNameToDocIds[sidebarName];
            var currentIndex = docIds.indexOf(docId);
            var _a = utils_1.getElementsAround(docIds, currentIndex), previous = _a.previous, next = _a.next;
            return {
                sidebarName: sidebarName,
                previousId: previous,
                nextId: next
            };
        }
        else {
            return {
                sidebarName: undefined,
                previousId: undefined,
                nextId: undefined
            };
        }
    }
    function checkSidebarsDocIds(validDocIds) {
        var allSidebarDocIds = lodash_1.flatten(Object.values(sidebarNameToDocIds));
        var invalidSidebarDocIds = lodash_1.difference(allSidebarDocIds, validDocIds);
        if (invalidSidebarDocIds.length > 0) {
            throw new Error("Bad sidebars file.\nThese sidebar document ids do not exist:\n- " + invalidSidebarDocIds.sort().join('\n- ') + ",\n\nAvailable document ids=\n- " + validDocIds.sort().join('\n- '));
        }
    }
    return {
        getFirstDocIdOfFirstSidebar: getFirstDocIdOfFirstSidebar,
        getSidebarNameByDocId: getSidebarNameByDocId,
        getDocNavigation: getDocNavigation,
        checkSidebarsDocIds: checkSidebarsDocIds
    };
}
exports.createSidebarsUtils = createSidebarsUtils;
