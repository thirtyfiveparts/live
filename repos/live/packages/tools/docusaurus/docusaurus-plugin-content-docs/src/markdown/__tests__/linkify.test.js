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
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var linkify_1 = require("../linkify");
var constants_1 = require("../../constants");
function createFakeVersion(_a) {
    var versionName = _a.versionName, docsDirPath = _a.docsDirPath, docsDirPathLocalized = _a.docsDirPathLocalized;
    return {
        versionName: versionName,
        versionLabel: 'Any',
        versionPath: 'any',
        docsDirPath: docsDirPath,
        docsDirPathLocalized: docsDirPathLocalized,
        sidebarFilePath: 'any',
        routePriority: undefined,
        isLast: false
    };
}
var siteDir = path_1["default"].join(__dirname, '__fixtures__');
var versionCurrent = createFakeVersion({
    versionName: constants_1.CURRENT_VERSION_NAME,
    docsDirPath: path_1["default"].join(siteDir, 'docs'),
    docsDirPathLocalized: path_1["default"].join(siteDir, 'i18n', 'fr', 'docusaurus-plugin-content-docs', constants_1.CURRENT_VERSION_NAME)
});
var version100 = createFakeVersion({
    versionName: '1.0.0',
    docsDirPath: path_1["default"].join(siteDir, constants_1.VERSIONED_DOCS_DIR, 'version-1.0.0'),
    docsDirPathLocalized: path_1["default"].join(siteDir, 'i18n', 'fr', 'docusaurus-plugin-content-docs', 'version-1.0.0')
});
var sourceToPermalink = {
    '@site/docs/doc1.md': '/docs/doc1',
    '@site/docs/doc2.md': '/docs/doc2',
    '@site/docs/subdir/doc3.md': '/docs/subdir/doc3',
    '@site/docs/doc4.md': '/docs/doc4',
    '@site/versioned_docs/version-1.0.0/doc2.md': '/docs/1.0.0/doc2',
    '@site/versioned_docs/version-1.0.0/subdir/doc1.md': '/docs/1.0.0/subdir/doc1',
    '@site/i18n/fr/docusaurus-plugin-content-docs/current/doc-localized.md': '/fr/doc-localized',
    '@site/docs/doc-localized': '/doc-localized'
};
function createMarkdownOptions(options) {
    return __assign({ sourceToPermalink: sourceToPermalink, onBrokenMarkdownLink: function () { }, versionsMetadata: [versionCurrent, version100], siteDir: siteDir }, options);
}
var transform = function (filepath, options) {
    var markdownOptions = createMarkdownOptions(options);
    var content = fs_extra_1["default"].readFileSync(filepath, 'utf-8');
    var transformedContent = linkify_1.linkify(content, filepath, markdownOptions);
    return [content, transformedContent];
};
test('transform nothing', function () {
    var doc1 = path_1["default"].join(versionCurrent.docsDirPath, 'doc1.md');
    var _a = transform(doc1), content = _a[0], transformedContent = _a[1];
    expect(transformedContent).toMatchSnapshot();
    expect(content).toEqual(transformedContent);
});
test('transform to correct links', function () {
    var doc2 = path_1["default"].join(versionCurrent.docsDirPath, 'doc2.md');
    var _a = transform(doc2), content = _a[0], transformedContent = _a[1];
    expect(transformedContent).toMatchSnapshot();
    expect(transformedContent).toContain('](/docs/doc1');
    expect(transformedContent).toContain('](/docs/doc2');
    expect(transformedContent).toContain('](/docs/subdir/doc3');
    expect(transformedContent).toContain('](/fr/doc-localized');
    expect(transformedContent).not.toContain('](doc1.md)');
    expect(transformedContent).not.toContain('](./doc2.md)');
    expect(transformedContent).not.toContain('](subdir/doc3.md)');
    expect(transformedContent).not.toContain('](/doc-localized');
    expect(content).not.toEqual(transformedContent);
});
test('transform relative links', function () {
    var doc3 = path_1["default"].join(versionCurrent.docsDirPath, 'subdir', 'doc3.md');
    var _a = transform(doc3), content = _a[0], transformedContent = _a[1];
    expect(transformedContent).toMatchSnapshot();
    expect(transformedContent).toContain('](/docs/doc2');
    expect(transformedContent).not.toContain('](../doc2.md)');
    expect(content).not.toEqual(transformedContent);
});
test('transforms reference links', function () {
    var doc4 = path_1["default"].join(versionCurrent.docsDirPath, 'doc4.md');
    var _a = transform(doc4), content = _a[0], transformedContent = _a[1];
    expect(transformedContent).toMatchSnapshot();
    expect(transformedContent).toContain('[doc1]: /docs/doc1');
    expect(transformedContent).toContain('[doc2]: /docs/doc2');
    expect(transformedContent).not.toContain('[doc1]: doc1.md');
    expect(transformedContent).not.toContain('[doc2]: ./doc2.md');
    expect(content).not.toEqual(transformedContent);
});
test('report broken markdown links', function () {
    var doc5 = path_1["default"].join(versionCurrent.docsDirPath, 'doc5.md');
    var onBrokenMarkdownLink = jest.fn();
    var _a = transform(doc5, {
        onBrokenMarkdownLink: onBrokenMarkdownLink
    }), content = _a[0], transformedContent = _a[1];
    expect(transformedContent).toEqual(content);
    expect(onBrokenMarkdownLink).toHaveBeenCalledTimes(4);
    expect(onBrokenMarkdownLink).toHaveBeenNthCalledWith(1, {
        filePath: doc5,
        link: 'docNotExist1.md',
        version: versionCurrent
    });
    expect(onBrokenMarkdownLink).toHaveBeenNthCalledWith(2, {
        filePath: doc5,
        link: './docNotExist2.mdx',
        version: versionCurrent
    });
    expect(onBrokenMarkdownLink).toHaveBeenNthCalledWith(3, {
        filePath: doc5,
        link: '../docNotExist3.mdx',
        version: versionCurrent
    });
    expect(onBrokenMarkdownLink).toHaveBeenNthCalledWith(4, {
        filePath: doc5,
        link: './subdir/docNotExist4.md',
        version: versionCurrent
    });
});
test('transforms absolute links in versioned docs', function () {
    var doc2 = path_1["default"].join(version100.docsDirPath, 'doc2.md');
    var _a = transform(doc2), content = _a[0], transformedContent = _a[1];
    expect(transformedContent).toMatchSnapshot();
    expect(transformedContent).toContain('](/docs/1.0.0/subdir/doc1');
    expect(transformedContent).toContain('](/docs/1.0.0/doc2#existing-docs');
    expect(transformedContent).not.toContain('](subdir/doc1.md)');
    expect(transformedContent).not.toContain('](doc2.md#existing-docs)');
    expect(content).not.toEqual(transformedContent);
});
test('transforms relative links in versioned docs', function () {
    var doc1 = path_1["default"].join(version100.docsDirPath, 'subdir', 'doc1.md');
    var _a = transform(doc1), content = _a[0], transformedContent = _a[1];
    expect(transformedContent).toMatchSnapshot();
    expect(transformedContent).toContain('](/docs/1.0.0/doc2');
    expect(transformedContent).not.toContain('](../doc2.md)');
    expect(content).not.toEqual(transformedContent);
});
