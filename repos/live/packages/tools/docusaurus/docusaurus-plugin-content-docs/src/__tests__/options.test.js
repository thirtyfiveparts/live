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
var options_1 = require("../options");
var utils_validation_1 = require("@docusaurus/utils-validation");
// the type of remark/rehype plugins is function
var markdownPluginsFunctionStub = function () { };
var markdownPluginsObjectStub = {};
describe('normalizeDocsPluginOptions', function () {
    test('should return default options for undefined user options', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, value, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, options_1.OptionsSchema.validate({})];
                case 1:
                    _a = _b.sent(), value = _a.value, error = _a.error;
                    expect(value).toEqual(options_1.DEFAULT_OPTIONS);
                    expect(error).toBe(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    test('should accept correctly defined user options', function () { return __awaiter(void 0, void 0, void 0, function () {
        var userOptions, _a, value, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userOptions = {
                        path: 'my-docs',
                        routeBasePath: 'my-docs',
                        homePageId: 'home',
                        include: ['**/*.{md,mdx}'],
                        sidebarPath: 'my-sidebar',
                        docLayoutComponent: '@theme/DocPage',
                        docItemComponent: '@theme/DocItem',
                        remarkPlugins: [markdownPluginsObjectStub],
                        rehypePlugins: [markdownPluginsFunctionStub],
                        beforeDefaultRehypePlugins: [],
                        beforeDefaultRemarkPlugins: [],
                        showLastUpdateTime: true,
                        showLastUpdateAuthor: true,
                        admonitions: {},
                        excludeNextVersionDocs: true,
                        includeCurrentVersion: false,
                        disableVersioning: true,
                        versions: {
                            current: {
                                path: 'next',
                                label: 'next'
                            },
                            version1: {
                                path: 'hello',
                                label: 'world'
                            }
                        }
                    };
                    return [4 /*yield*/, options_1.OptionsSchema.validate(userOptions)];
                case 1:
                    _a = _b.sent(), value = _a.value, error = _a.error;
                    expect(value).toEqual(userOptions);
                    expect(error).toBe(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    test('should accept correctly defined remark and rehype plugin options', function () { return __awaiter(void 0, void 0, void 0, function () {
        var userOptions, _a, value, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userOptions = __assign(__assign({}, options_1.DEFAULT_OPTIONS), { beforeDefaultRemarkPlugins: [], beforeDefaultRehypePlugins: [markdownPluginsFunctionStub], remarkPlugins: [[markdownPluginsFunctionStub, { option1: '42' }]], rehypePlugins: [
                            markdownPluginsObjectStub,
                            [markdownPluginsFunctionStub, { option1: '42' }],
                        ] });
                    return [4 /*yield*/, options_1.OptionsSchema.validate(userOptions)];
                case 1:
                    _a = _b.sent(), value = _a.value, error = _a.error;
                    expect(value).toEqual(userOptions);
                    expect(error).toBe(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    test('should reject invalid remark plugin options', function () {
        expect(function () {
            utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                remarkPlugins: [[{ option1: '42' }, markdownPluginsFunctionStub]]
            });
        }).toThrowErrorMatchingInlineSnapshot("\"\\\"remarkPlugins[0]\\\" does not match any of the allowed types\"");
    });
    test('should reject invalid rehype plugin options', function () {
        expect(function () {
            utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                rehypePlugins: [
                    [
                        markdownPluginsFunctionStub,
                        { option1: '42' },
                        markdownPluginsFunctionStub,
                    ],
                ]
            });
        }).toThrowErrorMatchingInlineSnapshot("\"\\\"rehypePlugins[0]\\\" does not match any of the allowed types\"");
    });
    test('should reject bad path inputs', function () {
        expect(function () {
            utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                path: 2
            });
        }).toThrowErrorMatchingInlineSnapshot("\"\\\"path\\\" must be a string\"");
    });
    test('should reject bad include inputs', function () {
        expect(function () {
            utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                include: '**/*.{md,mdx}'
            });
        }).toThrowErrorMatchingInlineSnapshot("\"\\\"include\\\" must be an array\"");
    });
    test('should reject bad showLastUpdateTime inputs', function () {
        expect(function () {
            utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                showLastUpdateTime: 'true'
            });
        }).toThrowErrorMatchingInlineSnapshot("\"\\\"showLastUpdateTime\\\" must be a boolean\"");
    });
    test('should reject bad remarkPlugins input', function () {
        expect(function () {
            utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                remarkPlugins: 'remark-math'
            });
        }).toThrowErrorMatchingInlineSnapshot("\"\\\"remarkPlugins\\\" must be an array\"");
    });
    test('should reject bad lastVersion', function () {
        expect(function () {
            utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                lastVersion: false
            });
        }).toThrowErrorMatchingInlineSnapshot("\"\\\"lastVersion\\\" must be a string\"");
    });
    test('should reject bad versions', function () {
        expect(function () {
            utils_validation_1.normalizePluginOptions(options_1.OptionsSchema, {
                versions: {
                    current: {
                        hey: 3
                    },
                    version1: {
                        path: 'hello',
                        label: 'world'
                    }
                }
            });
        }).toThrowErrorMatchingInlineSnapshot("\"\\\"versions.current.hey\\\" is not allowed\"");
    });
});
