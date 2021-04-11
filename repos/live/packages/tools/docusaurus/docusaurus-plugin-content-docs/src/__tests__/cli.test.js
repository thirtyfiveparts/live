"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
exports.__esModule = true;
var path_1 = require("path");
var cli_1 = require("../cli");
var fs_extra_1 = require("fs-extra");
var versions_1 = require("../versions");
var constants_1 = require("@docusaurus/core/lib/constants");
var fixtureDir = path_1["default"].join(__dirname, '__fixtures__');
describe('docsVersion', function () {
    var simpleSiteDir = path_1["default"].join(fixtureDir, 'simple-site');
    var versionedSiteDir = path_1["default"].join(fixtureDir, 'versioned-site');
    var DEFAULT_OPTIONS = {
        path: 'docs',
        sidebarPath: ''
    };
    test('no version tag provided', function () {
        expect(function () {
            return cli_1.cliDocsVersionCommand(null, simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] No version tag specified!. Pass the version you wish to create as an argument. Ex: 1.0.0\"");
        expect(function () {
            return cli_1.cliDocsVersionCommand(undefined, simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] No version tag specified!. Pass the version you wish to create as an argument. Ex: 1.0.0\"");
        expect(function () {
            return cli_1.cliDocsVersionCommand('', simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] No version tag specified!. Pass the version you wish to create as an argument. Ex: 1.0.0\"");
    });
    test('version tag should not have slash', function () {
        expect(function () {
            return cli_1.cliDocsVersionCommand('foo/bar', simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] Invalid version tag specified! Do not include slash (/) or (\\\\). Try something like: 1.0.0\"");
        expect(function () {
            return cli_1.cliDocsVersionCommand('foo\\bar', simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] Invalid version tag specified! Do not include slash (/) or (\\\\). Try something like: 1.0.0\"");
    });
    test('version tag should not be too long', function () {
        expect(function () {
            return cli_1.cliDocsVersionCommand('a'.repeat(255), simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] Invalid version tag specified! Length must <= 32 characters. Try something like: 1.0.0\"");
    });
    test('version tag should not be a dot or two dots', function () {
        expect(function () {
            return cli_1.cliDocsVersionCommand('..', simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] Invalid version tag specified! Do not name your version \\\".\\\" or \\\"..\\\". Try something like: 1.0.0\"");
        expect(function () {
            return cli_1.cliDocsVersionCommand('.', simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] Invalid version tag specified! Do not name your version \\\".\\\" or \\\"..\\\". Try something like: 1.0.0\"");
    });
    test('version tag should be a valid pathname', function () {
        expect(function () {
            return cli_1.cliDocsVersionCommand('<foo|bar>', simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] Invalid version tag specified! Please ensure its a valid pathname too. Try something like: 1.0.0\"");
        expect(function () {
            return cli_1.cliDocsVersionCommand('foo\x00bar', simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] Invalid version tag specified! Please ensure its a valid pathname too. Try something like: 1.0.0\"");
        expect(function () {
            return cli_1.cliDocsVersionCommand('foo:bar', simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] Invalid version tag specified! Please ensure its a valid pathname too. Try something like: 1.0.0\"");
    });
    test('version tag already exist', function () {
        expect(function () {
            return cli_1.cliDocsVersionCommand('1.0.0', versionedSiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] This version already exists!. Use a version tag that does not already exist.\"");
    });
    test('no docs file to version', function () {
        var emptySiteDir = path_1["default"].join(fixtureDir, 'empty-site');
        expect(function () {
            return cli_1.cliDocsVersionCommand('1.0.0', emptySiteDir, constants_1.DEFAULT_PLUGIN_ID, DEFAULT_OPTIONS);
        }).toThrowErrorMatchingInlineSnapshot("\"[docs] There is no docs to version !\"");
    });
    test('first time versioning', function () {
        var copyMock = jest.spyOn(fs_extra_1["default"], 'copySync').mockImplementation();
        var ensureMock = jest.spyOn(fs_extra_1["default"], 'ensureDirSync').mockImplementation();
        var writeMock = jest.spyOn(fs_extra_1["default"], 'writeFileSync');
        var versionedSidebar;
        var versionedSidebarPath;
        writeMock.mockImplementationOnce(function (filepath, content) {
            versionedSidebarPath = filepath;
            versionedSidebar = JSON.parse(content);
        });
        var versionsPath;
        var versions;
        writeMock.mockImplementationOnce(function (filepath, content) {
            versionsPath = filepath;
            versions = JSON.parse(content);
        });
        var consoleMock = jest.spyOn(console, 'log').mockImplementation();
        var options = {
            path: 'docs',
            sidebarPath: path_1["default"].join(simpleSiteDir, 'sidebars.json')
        };
        cli_1.cliDocsVersionCommand('1.0.0', simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID, options);
        expect(copyMock).toHaveBeenCalledWith(path_1["default"].join(simpleSiteDir, options.path), path_1["default"].join(versions_1.getVersionedDocsDirPath(simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID), 'version-1.0.0'));
        expect(versionedSidebar).toMatchSnapshot();
        expect(versionedSidebarPath).toEqual(path_1["default"].join(versions_1.getVersionedSidebarsDirPath(simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID), 'version-1.0.0-sidebars.json'));
        expect(versionsPath).toEqual(versions_1.getVersionsFilePath(simpleSiteDir, constants_1.DEFAULT_PLUGIN_ID));
        expect(versions).toEqual(['1.0.0']);
        expect(consoleMock).toHaveBeenCalledWith('[docs] Version 1.0.0 created!');
        copyMock.mockRestore();
        writeMock.mockRestore();
        consoleMock.mockRestore();
        ensureMock.mockRestore();
    });
    test('not the first time versioning', function () {
        var copyMock = jest.spyOn(fs_extra_1["default"], 'copySync').mockImplementation();
        var ensureMock = jest.spyOn(fs_extra_1["default"], 'ensureDirSync').mockImplementation();
        var writeMock = jest.spyOn(fs_extra_1["default"], 'writeFileSync');
        var versionedSidebar;
        var versionedSidebarPath;
        writeMock.mockImplementationOnce(function (filepath, content) {
            versionedSidebarPath = filepath;
            versionedSidebar = JSON.parse(content);
        });
        var versionsPath;
        var versions;
        writeMock.mockImplementationOnce(function (filepath, content) {
            versionsPath = filepath;
            versions = JSON.parse(content);
        });
        var consoleMock = jest.spyOn(console, 'log').mockImplementation();
        var options = {
            path: 'docs',
            sidebarPath: path_1["default"].join(versionedSiteDir, 'sidebars.json')
        };
        cli_1.cliDocsVersionCommand('2.0.0', versionedSiteDir, constants_1.DEFAULT_PLUGIN_ID, options);
        expect(copyMock).toHaveBeenCalledWith(path_1["default"].join(versionedSiteDir, options.path), path_1["default"].join(versions_1.getVersionedDocsDirPath(versionedSiteDir, constants_1.DEFAULT_PLUGIN_ID), 'version-2.0.0'));
        expect(versionedSidebar).toMatchSnapshot();
        expect(versionedSidebarPath).toEqual(path_1["default"].join(versions_1.getVersionedSidebarsDirPath(versionedSiteDir, constants_1.DEFAULT_PLUGIN_ID), 'version-2.0.0-sidebars.json'));
        expect(versionsPath).toEqual(versions_1.getVersionsFilePath(versionedSiteDir, constants_1.DEFAULT_PLUGIN_ID));
        expect(versions).toEqual(['2.0.0', '1.0.1', '1.0.0', 'withSlugs']);
        expect(consoleMock).toHaveBeenCalledWith('[docs] Version 2.0.0 created!');
        copyMock.mockRestore();
        writeMock.mockRestore();
        consoleMock.mockRestore();
        ensureMock.mockRestore();
    });
    test('second docs instance versioning', function () {
        var pluginId = 'community';
        var copyMock = jest.spyOn(fs_extra_1["default"], 'copySync').mockImplementation();
        var ensureMock = jest.spyOn(fs_extra_1["default"], 'ensureDirSync').mockImplementation();
        var writeMock = jest.spyOn(fs_extra_1["default"], 'writeFileSync');
        var versionedSidebar;
        var versionedSidebarPath;
        writeMock.mockImplementationOnce(function (filepath, content) {
            versionedSidebarPath = filepath;
            versionedSidebar = JSON.parse(content);
        });
        var versionsPath;
        var versions;
        writeMock.mockImplementationOnce(function (filepath, content) {
            versionsPath = filepath;
            versions = JSON.parse(content);
        });
        var consoleMock = jest.spyOn(console, 'log').mockImplementation();
        var options = {
            path: 'community',
            sidebarPath: path_1["default"].join(versionedSiteDir, 'community_sidebars.json')
        };
        cli_1.cliDocsVersionCommand('2.0.0', versionedSiteDir, pluginId, options);
        expect(copyMock).toHaveBeenCalledWith(path_1["default"].join(versionedSiteDir, options.path), path_1["default"].join(versions_1.getVersionedDocsDirPath(versionedSiteDir, pluginId), 'version-2.0.0'));
        expect(versionedSidebar).toMatchSnapshot();
        expect(versionedSidebarPath).toEqual(path_1["default"].join(versions_1.getVersionedSidebarsDirPath(versionedSiteDir, pluginId), 'version-2.0.0-sidebars.json'));
        expect(versionsPath).toEqual(versions_1.getVersionsFilePath(versionedSiteDir, pluginId));
        expect(versions).toEqual(['2.0.0', '1.0.0']);
        expect(consoleMock).toHaveBeenCalledWith('[community] Version 2.0.0 created!');
        copyMock.mockRestore();
        writeMock.mockRestore();
        consoleMock.mockRestore();
        ensureMock.mockRestore();
    });
});
