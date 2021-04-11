"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
var fs_1 = require("fs");
var path_1 = require("path");
var shelljs_1 = require("shelljs");
var lastUpdate_1 = require("../lastUpdate");
describe('lastUpdate', function () {
    var existingFilePath = path_1["default"].join(__dirname, '__fixtures__/simple-site/docs/hello.md');
    test('existing test file in repository with Git timestamp', function () { return __awaiter(void 0, void 0, void 0, function () {
        var lastUpdateData, author, timestamp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, lastUpdate_1.getFileLastUpdate(existingFilePath)];
                case 1:
                    lastUpdateData = _a.sent();
                    expect(lastUpdateData).not.toBeNull();
                    author = lastUpdateData.author, timestamp = lastUpdateData.timestamp;
                    expect(author).not.toBeNull();
                    expect(typeof author).toBe('string');
                    expect(timestamp).not.toBeNull();
                    expect(typeof timestamp).toBe('number');
                    return [2 /*return*/];
            }
        });
    }); });
    test('non-existing file', function () { return __awaiter(void 0, void 0, void 0, function () {
        var consoleMock, nonExistingFilePath, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    consoleMock = jest.spyOn(console, 'error');
                    consoleMock.mockImplementation();
                    nonExistingFilePath = path_1["default"].join(__dirname, '__fixtures__', '.nonExisting');
                    _a = expect;
                    return [4 /*yield*/, lastUpdate_1.getFileLastUpdate(nonExistingFilePath)];
                case 1:
                    _a.apply(void 0, [_d.sent()]).toBeNull();
                    expect(consoleMock).toHaveBeenCalledTimes(1);
                    expect(consoleMock).toHaveBeenCalledWith(new Error("Command failed with exit code 128: git log -1 --format=%ct, %an " + nonExistingFilePath));
                    _b = expect;
                    return [4 /*yield*/, lastUpdate_1.getFileLastUpdate(null)];
                case 2:
                    _b.apply(void 0, [_d.sent()]).toBeNull();
                    _c = expect;
                    return [4 /*yield*/, lastUpdate_1.getFileLastUpdate(undefined)];
                case 3:
                    _c.apply(void 0, [_d.sent()]).toBeNull();
                    consoleMock.mockRestore();
                    return [2 /*return*/];
            }
        });
    }); });
    test('temporary created file that has no git timestamp', function () { return __awaiter(void 0, void 0, void 0, function () {
        var tempFilePath, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    tempFilePath = path_1["default"].join(__dirname, '__fixtures__', '.temp');
                    fs_1["default"].writeFileSync(tempFilePath, 'Lorem ipsum :)');
                    _a = expect;
                    return [4 /*yield*/, lastUpdate_1.getFileLastUpdate(tempFilePath)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).toBeNull();
                    fs_1["default"].unlinkSync(tempFilePath);
                    return [2 /*return*/];
            }
        });
    }); });
    test('Git does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mock, consoleMock, lastUpdateData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mock = jest.spyOn(shelljs_1["default"], 'which').mockImplementationOnce(function () { return null; });
                    consoleMock = jest.spyOn(console, 'warn').mockImplementation();
                    return [4 /*yield*/, lastUpdate_1.getFileLastUpdate(existingFilePath)];
                case 1:
                    lastUpdateData = _a.sent();
                    expect(lastUpdateData).toBeNull();
                    expect(consoleMock).toHaveBeenLastCalledWith('Sorry, the docs plugin last update options require Git.');
                    consoleMock.mockRestore();
                    mock.mockRestore();
                    return [2 /*return*/];
            }
        });
    }); });
});
