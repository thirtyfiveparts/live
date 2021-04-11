"use strict";
exports.__esModule = true;
exports.validateOptions = exports.OptionsSchema = exports.DEFAULT_OPTIONS = void 0;
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Joi = require("joi");
var utils_validation_1 = require("@docusaurus/utils-validation");
var chalk_1 = require("chalk");
var remark_admonitions_1 = require("remark-admonitions");
exports.DEFAULT_OPTIONS = {
    path: 'docs',
    routeBasePath: 'docs',
    homePageId: undefined,
    include: ['**/*.{md,mdx}'],
    sidebarPath: 'sidebars.json',
    docLayoutComponent: '@theme/DocPage',
    docItemComponent: '@theme/DocItem',
    remarkPlugins: [],
    rehypePlugins: [],
    beforeDefaultRemarkPlugins: [],
    beforeDefaultRehypePlugins: [],
    showLastUpdateTime: false,
    showLastUpdateAuthor: false,
    admonitions: {},
    excludeNextVersionDocs: false,
    includeCurrentVersion: true,
    disableVersioning: false,
    lastVersion: undefined,
    versions: {}
};
var VersionOptionsSchema = Joi.object({
    path: Joi.string().allow('').optional(),
    label: Joi.string().optional()
});
var VersionsOptionsSchema = Joi.object()
    .pattern(Joi.string().required(), VersionOptionsSchema)["default"](exports.DEFAULT_OPTIONS.versions);
exports.OptionsSchema = Joi.object({
    path: Joi.string()["default"](exports.DEFAULT_OPTIONS.path),
    editUrl: utils_validation_1.URISchema,
    routeBasePath: Joi.string()["default"](exports.DEFAULT_OPTIONS.routeBasePath),
    homePageId: Joi.string().optional(),
    include: Joi.array().items(Joi.string())["default"](exports.DEFAULT_OPTIONS.include),
    sidebarPath: Joi.string().allow('')["default"](exports.DEFAULT_OPTIONS.sidebarPath),
    docLayoutComponent: Joi.string()["default"](exports.DEFAULT_OPTIONS.docLayoutComponent),
    docItemComponent: Joi.string()["default"](exports.DEFAULT_OPTIONS.docItemComponent),
    remarkPlugins: utils_validation_1.RemarkPluginsSchema["default"](exports.DEFAULT_OPTIONS.remarkPlugins),
    rehypePlugins: utils_validation_1.RehypePluginsSchema["default"](exports.DEFAULT_OPTIONS.rehypePlugins),
    beforeDefaultRemarkPlugins: utils_validation_1.RemarkPluginsSchema["default"](exports.DEFAULT_OPTIONS.beforeDefaultRemarkPlugins),
    beforeDefaultRehypePlugins: utils_validation_1.RehypePluginsSchema["default"](exports.DEFAULT_OPTIONS.beforeDefaultRehypePlugins),
    admonitions: utils_validation_1.AdmonitionsSchema["default"](exports.DEFAULT_OPTIONS.admonitions),
    showLastUpdateTime: Joi.bool()["default"](exports.DEFAULT_OPTIONS.showLastUpdateTime),
    showLastUpdateAuthor: Joi.bool()["default"](exports.DEFAULT_OPTIONS.showLastUpdateAuthor),
    excludeNextVersionDocs: Joi.bool()["default"](exports.DEFAULT_OPTIONS.excludeNextVersionDocs),
    includeCurrentVersion: Joi.bool()["default"](exports.DEFAULT_OPTIONS.includeCurrentVersion),
    onlyIncludeVersions: Joi.array().items(Joi.string().required()).optional(),
    disableVersioning: Joi.bool()["default"](exports.DEFAULT_OPTIONS.disableVersioning),
    lastVersion: Joi.string().optional(),
    versions: VersionsOptionsSchema
});
// TODO bad validation function types
function validateOptions(_a) {
    var validate = _a.validate, options = _a.options;
    // TODO remove homePageId before end of 2020
    // "slug: /" is better because the home doc can be different across versions
    if (options.homePageId) {
        console.log(chalk_1["default"].red("The docs plugin option homePageId=" + options.homePageId + " is deprecated. To make a doc the \"home\", prefer frontmatter: \"slug: /\""));
    }
    if (typeof options.excludeNextVersionDocs !== 'undefined') {
        console.log(chalk_1["default"].red("The docs plugin option excludeNextVersionDocs=" + options.excludeNextVersionDocs + " is deprecated. Use the includeCurrentVersion=" + !options.excludeNextVersionDocs + " option instead!\""));
        options.includeCurrentVersion = !options.excludeNextVersionDocs;
    }
    // @ts-expect-error: TODO bad OptionValidationContext, need refactor
    var normalizedOptions = validate(exports.OptionsSchema, options);
    if (normalizedOptions.admonitions) {
        normalizedOptions.remarkPlugins = normalizedOptions.remarkPlugins.concat([
            [remark_admonitions_1["default"], normalizedOptions.admonitions],
        ]);
    }
    // @ts-expect-error: TODO bad OptionValidationContext, need refactor
    return normalizedOptions;
}
exports.validateOptions = validateOptions;
