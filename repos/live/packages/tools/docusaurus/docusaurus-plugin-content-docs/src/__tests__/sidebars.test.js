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
var path_1 = require("path");
var sidebars_1 = require("../sidebars");
/* eslint-disable global-require, import/no-dynamic-require */
describe('loadSidebars', function () {
    var fixtureDir = path_1["default"].join(__dirname, '__fixtures__', 'sidebars');
    test('sidebars with known sidebar item type', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath, result;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars.json');
            result = sidebars_1.loadSidebars(sidebarPath);
            expect(result).toMatchSnapshot();
            return [2 /*return*/];
        });
    }); });
    test('sidebars with deep level of category', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath, result;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-category.js');
            result = sidebars_1.loadSidebars(sidebarPath);
            expect(result).toMatchSnapshot();
            return [2 /*return*/];
        });
    }); });
    test('sidebars shorthand and longform lead to exact same sidebar', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath1, sidebarPath2, sidebar1, sidebar2;
        return __generator(this, function (_a) {
            sidebarPath1 = path_1["default"].join(fixtureDir, 'sidebars-category.js');
            sidebarPath2 = path_1["default"].join(fixtureDir, 'sidebars-category-shorthand.js');
            sidebar1 = sidebars_1.loadSidebars(sidebarPath1);
            sidebar2 = sidebars_1.loadSidebars(sidebarPath2);
            expect(sidebar1).toEqual(sidebar2);
            return [2 /*return*/];
        });
    }); });
    test('sidebars with category but category.items is not an array', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-category-wrong-items.json');
            expect(function () { return sidebars_1.loadSidebars(sidebarPath); }).toThrowErrorMatchingInlineSnapshot("\"Error loading {\\\"type\\\":\\\"category\\\",\\\"label\\\":\\\"Category Label\\\",\\\"items\\\":\\\"doc1\\\"}. \\\"items\\\" must be an array.\"");
            return [2 /*return*/];
        });
    }); });
    test('sidebars with category but category label is not a string', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-category-wrong-label.json');
            expect(function () { return sidebars_1.loadSidebars(sidebarPath); }).toThrowErrorMatchingInlineSnapshot("\"Error loading {\\\"type\\\":\\\"category\\\",\\\"label\\\":true,\\\"items\\\":[\\\"doc1\\\"]}. \\\"label\\\" must be a string.\"");
            return [2 /*return*/];
        });
    }); });
    test('sidebars item doc but id is not a string', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-doc-id-not-string.json');
            expect(function () { return sidebars_1.loadSidebars(sidebarPath); }).toThrowErrorMatchingInlineSnapshot("\"Error loading {\\\"type\\\":\\\"doc\\\",\\\"id\\\":[\\\"doc1\\\"]}. \\\"id\\\" must be a string.\"");
            return [2 /*return*/];
        });
    }); });
    test('sidebars with first level not a category', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath, result;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-first-level-not-category.js');
            result = sidebars_1.loadSidebars(sidebarPath);
            expect(result).toMatchSnapshot();
            return [2 /*return*/];
        });
    }); });
    test('sidebars link', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath, result;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-link.json');
            result = sidebars_1.loadSidebars(sidebarPath);
            expect(result).toMatchSnapshot();
            return [2 /*return*/];
        });
    }); });
    test('sidebars link wrong label', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-link-wrong-label.json');
            expect(function () { return sidebars_1.loadSidebars(sidebarPath); }).toThrowErrorMatchingInlineSnapshot("\"Error loading {\\\"type\\\":\\\"link\\\",\\\"label\\\":false,\\\"href\\\":\\\"https://github.com\\\"}. \\\"label\\\" must be a string.\"");
            return [2 /*return*/];
        });
    }); });
    test('sidebars link wrong href', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-link-wrong-href.json');
            expect(function () { return sidebars_1.loadSidebars(sidebarPath); }).toThrowErrorMatchingInlineSnapshot("\"Error loading {\\\"type\\\":\\\"link\\\",\\\"label\\\":\\\"GitHub\\\",\\\"href\\\":[\\\"example.com\\\"]}. \\\"href\\\" must be a string.\"");
            return [2 /*return*/];
        });
    }); });
    test('sidebars with unknown sidebar item type', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-unknown-type.json');
            expect(function () { return sidebars_1.loadSidebars(sidebarPath); }).toThrowErrorMatchingInlineSnapshot("\"Unknown sidebar item type [superman]. Sidebar item={\\\"type\\\":\\\"superman\\\"} \"");
            return [2 /*return*/];
        });
    }); });
    test('sidebars with known sidebar item type but wrong field', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-wrong-field.json');
            expect(function () { return sidebars_1.loadSidebars(sidebarPath); }).toThrowErrorMatchingInlineSnapshot("\"Unknown sidebar item keys: href. Item: {\\\"type\\\":\\\"category\\\",\\\"label\\\":\\\"category\\\",\\\"href\\\":\\\"https://github.com\\\"}\"");
            return [2 /*return*/];
        });
    }); });
    test('unexisting path', function () {
        /*
        expect(() => loadSidebars('badpath')).toThrowErrorMatchingInlineSnapshot(
          `"No sidebar file exist at path: badpath"`,
        );
         */
        // See https://github.com/facebook/docusaurus/issues/3366
        expect(sidebars_1.loadSidebars('badpath')).toEqual({});
    });
    test('undefined path', function () {
        expect(function () {
            return sidebars_1.loadSidebars(
            // @ts-expect-error: bad arg
            undefined);
        }).toThrowErrorMatchingInlineSnapshot("\"sidebarFilePath not provided: undefined\"");
    });
    test('null path', function () {
        expect(function () {
            return sidebars_1.loadSidebars(
            // @ts-expect-error: bad arg
            null);
        }).toThrowErrorMatchingInlineSnapshot("\"sidebarFilePath not provided: null\"");
    });
    test('sidebars with category.collapsed property', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath, result;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-collapsed.json');
            result = sidebars_1.loadSidebars(sidebarPath);
            expect(result).toMatchSnapshot();
            return [2 /*return*/];
        });
    }); });
    test('sidebars with category.collapsed property at first level', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebarPath, result;
        return __generator(this, function (_a) {
            sidebarPath = path_1["default"].join(fixtureDir, 'sidebars-collapsed-first-level.json');
            result = sidebars_1.loadSidebars(sidebarPath);
            expect(result).toMatchSnapshot();
            return [2 /*return*/];
        });
    }); });
});
describe('collectSidebarDocItems', function () {
    test('can collect docs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebar;
        return __generator(this, function (_a) {
            sidebar = [
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Category1',
                    items: [
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'Subcategory 1',
                            items: [{ type: 'doc', id: 'doc1' }]
                        },
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'Subcategory 2',
                            items: [
                                { type: 'doc', id: 'doc2' },
                                {
                                    type: 'category',
                                    collapsed: false,
                                    label: 'Sub sub category 1',
                                    items: [{ type: 'doc', id: 'doc3' }]
                                },
                            ]
                        },
                    ]
                },
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Category2',
                    items: [
                        { type: 'doc', id: 'doc4' },
                        { type: 'doc', id: 'doc5' },
                    ]
                },
            ];
            expect(sidebars_1.collectSidebarDocItems(sidebar).map(function (doc) { return doc.id; })).toEqual([
                'doc1',
                'doc2',
                'doc3',
                'doc4',
                'doc5',
            ]);
            return [2 /*return*/];
        });
    }); });
});
describe('collectSidebarCategories', function () {
    test('can collect categories', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebar;
        return __generator(this, function (_a) {
            sidebar = [
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Category1',
                    items: [
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'Subcategory 1',
                            items: [{ type: 'doc', id: 'doc1' }]
                        },
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'Subcategory 2',
                            items: [
                                { type: 'doc', id: 'doc2' },
                                {
                                    type: 'category',
                                    collapsed: false,
                                    label: 'Sub sub category 1',
                                    items: [{ type: 'doc', id: 'doc3' }]
                                },
                            ]
                        },
                    ]
                },
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Category2',
                    items: [
                        { type: 'doc', id: 'doc4' },
                        { type: 'doc', id: 'doc5' },
                    ]
                },
            ];
            expect(sidebars_1.collectSidebarCategories(sidebar).map(function (category) { return category.label; })).toEqual([
                'Category1',
                'Subcategory 1',
                'Subcategory 2',
                'Sub sub category 1',
                'Category2',
            ]);
            return [2 /*return*/];
        });
    }); });
});
describe('collectSidebarLinks', function () {
    test('can collect links', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebar;
        return __generator(this, function (_a) {
            sidebar = [
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Category1',
                    items: [
                        {
                            type: 'link',
                            href: 'https://google.com',
                            label: 'Google'
                        },
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'Subcategory 2',
                            items: [
                                {
                                    type: 'link',
                                    href: 'https://facebook.com',
                                    label: 'Facebook'
                                },
                            ]
                        },
                    ]
                },
            ];
            expect(sidebars_1.collectSidebarLinks(sidebar).map(function (link) { return link.href; })).toEqual([
                'https://google.com',
                'https://facebook.com',
            ]);
            return [2 /*return*/];
        });
    }); });
});
describe('collectSidebarsDocIds', function () {
    test('can collect sidebars doc items', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebar1, sidebar2, sidebar3;
        return __generator(this, function (_a) {
            sidebar1 = [
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Category1',
                    items: [
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'Subcategory 1',
                            items: [{ type: 'doc', id: 'doc1' }]
                        },
                        { type: 'doc', id: 'doc2' },
                    ]
                },
            ];
            sidebar2 = [
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Category2',
                    items: [
                        { type: 'doc', id: 'doc3' },
                        { type: 'doc', id: 'doc4' },
                    ]
                },
            ];
            sidebar3 = [
                { type: 'doc', id: 'doc5' },
                { type: 'doc', id: 'doc6' },
            ];
            expect(sidebars_1.collectSidebarsDocIds({ sidebar1: sidebar1, sidebar2: sidebar2, sidebar3: sidebar3 })).toEqual({
                sidebar1: ['doc1', 'doc2'],
                sidebar2: ['doc3', 'doc4'],
                sidebar3: ['doc5', 'doc6']
            });
            return [2 /*return*/];
        });
    }); });
});
describe('transformSidebarItems', function () {
    test('can transform sidebar items', function () { return __awaiter(void 0, void 0, void 0, function () {
        var sidebar;
        return __generator(this, function (_a) {
            sidebar = [
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Category1',
                    items: [
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'Subcategory 1',
                            items: [{ type: 'doc', id: 'doc1' }],
                            customProps: { fakeProp: false }
                        },
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'Subcategory 2',
                            items: [
                                { type: 'doc', id: 'doc2' },
                                {
                                    type: 'category',
                                    collapsed: false,
                                    label: 'Sub sub category 1',
                                    items: [
                                        { type: 'doc', id: 'doc3', customProps: { lorem: 'ipsum' } },
                                    ]
                                },
                            ]
                        },
                    ]
                },
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Category2',
                    items: [
                        { type: 'doc', id: 'doc4' },
                        { type: 'doc', id: 'doc5' },
                    ]
                },
            ];
            expect(sidebars_1.transformSidebarItems(sidebar, function (item) {
                if (item.type === 'category') {
                    return __assign(__assign({}, item), { label: "MODIFIED LABEL: " + item.label });
                }
                return item;
            })).toEqual([
                {
                    type: 'category',
                    collapsed: false,
                    label: 'MODIFIED LABEL: Category1',
                    items: [
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'MODIFIED LABEL: Subcategory 1',
                            items: [{ type: 'doc', id: 'doc1' }],
                            customProps: { fakeProp: false }
                        },
                        {
                            type: 'category',
                            collapsed: false,
                            label: 'MODIFIED LABEL: Subcategory 2',
                            items: [
                                { type: 'doc', id: 'doc2' },
                                {
                                    type: 'category',
                                    collapsed: false,
                                    label: 'MODIFIED LABEL: Sub sub category 1',
                                    items: [
                                        { type: 'doc', id: 'doc3', customProps: { lorem: 'ipsum' } },
                                    ]
                                },
                            ]
                        },
                    ]
                },
                {
                    type: 'category',
                    collapsed: false,
                    label: 'MODIFIED LABEL: Category2',
                    items: [
                        { type: 'doc', id: 'doc4' },
                        { type: 'doc', id: 'doc5' },
                    ]
                },
            ]);
            return [2 /*return*/];
        });
    }); });
});
describe('createSidebarsUtils', function () {
    var sidebar1 = [
        {
            type: 'category',
            collapsed: false,
            label: 'Category1',
            items: [
                {
                    type: 'category',
                    collapsed: false,
                    label: 'Subcategory 1',
                    items: [{ type: 'doc', id: 'doc1' }]
                },
                { type: 'doc', id: 'doc2' },
            ]
        },
    ];
    var sidebar2 = [
        {
            type: 'category',
            collapsed: false,
            label: 'Category2',
            items: [
                { type: 'doc', id: 'doc3' },
                { type: 'doc', id: 'doc4' },
            ]
        },
    ];
    var sidebars = { sidebar1: sidebar1, sidebar2: sidebar2 };
    var _a = sidebars_1.createSidebarsUtils(sidebars), getFirstDocIdOfFirstSidebar = _a.getFirstDocIdOfFirstSidebar, getSidebarNameByDocId = _a.getSidebarNameByDocId, getDocNavigation = _a.getDocNavigation;
    test('getSidebarNameByDocId', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            expect(getFirstDocIdOfFirstSidebar()).toEqual('doc1');
            return [2 /*return*/];
        });
    }); });
    test('getSidebarNameByDocId', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            expect(getSidebarNameByDocId('doc1')).toEqual('sidebar1');
            expect(getSidebarNameByDocId('doc2')).toEqual('sidebar1');
            expect(getSidebarNameByDocId('doc3')).toEqual('sidebar2');
            expect(getSidebarNameByDocId('doc4')).toEqual('sidebar2');
            expect(getSidebarNameByDocId('doc5')).toEqual(undefined);
            expect(getSidebarNameByDocId('doc6')).toEqual(undefined);
            return [2 /*return*/];
        });
    }); });
    test('getDocNavigation', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            expect(getDocNavigation('doc1')).toEqual({
                sidebarName: 'sidebar1',
                previousId: undefined,
                nextId: 'doc2'
            });
            expect(getDocNavigation('doc2')).toEqual({
                sidebarName: 'sidebar1',
                previousId: 'doc1',
                nextId: undefined
            });
            expect(getDocNavigation('doc3')).toEqual({
                sidebarName: 'sidebar2',
                previousId: undefined,
                nextId: 'doc4'
            });
            expect(getDocNavigation('doc4')).toEqual({
                sidebarName: 'sidebar2',
                previousId: 'doc3',
                nextId: undefined
            });
            return [2 /*return*/];
        });
    }); });
});
