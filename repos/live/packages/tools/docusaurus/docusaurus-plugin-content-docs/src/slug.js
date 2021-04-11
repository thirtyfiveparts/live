"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
exports.__esModule = true;
var utils_1 = require("@docusaurus/utils");
function getSlug(_a) {
    var baseID = _a.baseID, frontmatterSlug = _a.frontmatterSlug, dirName = _a.dirName;
    var baseSlug = frontmatterSlug || baseID;
    var slug;
    if (baseSlug.startsWith('/')) {
        slug = baseSlug;
    }
    else {
        var resolveDirname = dirName === '.' ? '/' : utils_1.addLeadingSlash(utils_1.addTrailingSlash(dirName));
        slug = utils_1.resolvePathname(baseSlug, resolveDirname);
    }
    if (!utils_1.isValidPathname(slug)) {
        throw new Error("We couldn't compute a valid slug for document with id=" + baseID + " in folder=" + dirName + "\nThe slug we computed looks invalid: " + slug + "\nMaybe your slug frontmatter is incorrect or you use weird chars in the file path?\nBy using the slug frontmatter, you should be able to fix this error, by using the slug of your choice:\n\nExample =>\n---\nslug: /my/customDocPath\n---\n");
    }
    return slug;
}
exports["default"] = getSlug;
