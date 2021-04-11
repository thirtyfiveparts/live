"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
exports.__esModule = true;
exports.linkify = void 0;
var path_1 = require("path");
var url_1 = require("url");
var versions_1 = require("../versions");
function getVersion(filePath, options) {
    var versionFound = options.versionsMetadata.find(function (version) {
        return versions_1.getDocsDirPaths(version).some(function (docsDirPath) {
            return filePath.startsWith(docsDirPath);
        });
    });
    if (!versionFound) {
        throw new Error("Unexpected, markdown file does not belong to any docs version! file=" + filePath);
    }
    return versionFound;
}
function replaceMarkdownLinks(fileString, filePath, version, options) {
    var siteDir = options.siteDir, sourceToPermalink = options.sourceToPermalink, onBrokenMarkdownLink = options.onBrokenMarkdownLink;
    var docsDirPath = version.docsDirPath, docsDirPathLocalized = version.docsDirPathLocalized;
    // Replace internal markdown linking (except in fenced blocks).
    var fencedBlock = false;
    var lines = fileString.split('\n').map(function (line) {
        if (line.trim().startsWith('```')) {
            fencedBlock = !fencedBlock;
        }
        if (fencedBlock) {
            return line;
        }
        var modifiedLine = line;
        // Replace inline-style links or reference-style links e.g:
        // This is [Document 1](doc1.md) -> we replace this doc1.md with correct link
        // [doc1]: doc1.md -> we replace this doc1.md with correct link
        var mdRegex = /(?:(?:\]\()|(?:\]:\s?))(?!https)([^'")\]\s>]+\.mdx?)/g;
        var mdMatch = mdRegex.exec(modifiedLine);
        while (mdMatch !== null) {
            // Replace it to correct html link.
            var mdLink = mdMatch[1];
            var aliasedSource = function (source) {
                return "@site/" + path_1["default"].relative(siteDir, source);
            };
            var permalink = sourceToPermalink[aliasedSource(url_1.resolve(filePath, mdLink))] ||
                sourceToPermalink[aliasedSource(docsDirPathLocalized + "/" + mdLink)] ||
                sourceToPermalink[aliasedSource(docsDirPath + "/" + mdLink)];
            if (permalink) {
                modifiedLine = modifiedLine.replace(mdLink, permalink);
            }
            else {
                var brokenMarkdownLink = {
                    version: version,
                    filePath: filePath,
                    link: mdLink
                };
                onBrokenMarkdownLink(brokenMarkdownLink);
            }
            mdMatch = mdRegex.exec(modifiedLine);
        }
        return modifiedLine;
    });
    return lines.join('\n');
}
function linkify(fileString, filePath, options) {
    var version = getVersion(filePath, options);
    return replaceMarkdownLinks(fileString, filePath, version, options);
}
exports.linkify = linkify;
