"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
exports.__esModule = true;
var loader_utils_1 = require("loader-utils");
var linkify_1 = require("./linkify");
var markdownLoader = function (source) {
    var fileString = source;
    var callback = this.async();
    var options = loader_utils_1.getOptions(this);
    return (callback && callback(null, linkify_1.linkify(fileString, this.resourcePath, options)));
};
exports["default"] = markdownLoader;
