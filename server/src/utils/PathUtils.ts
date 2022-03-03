/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { dirname } from 'path';
import { URI } from "vscode-uri";

export default class PathUtils {

	/**
	 * Converts "D:\blaba\a.x" to "file:///d%3A/blaba"
	 */
    public static platformPathToUri(path: string): string {
        let uri = path.replace(/\\/g, "/");

        // On windows, the path starts with a drive letter but it needs a slash
        if (uri[0] !== "/") uri = "/" + uri;

        return encodeURI("file://" + uri);
    }

	/**
	 * Converts "file:///d%3A/blaba/a.x" to "d:\blaba\a.x"
	 */
    public static uriToPlatformPath(uri: string): string {
        //return decodeURIComponent(uri.replace(/file:[\/\\]+/g, ""));
        //return decodeURIComponent(uri.replace(/file:/g, ""));
        let newuri = URI.parse(uri);
        //console.log(newuri.path);
        //console.log(newuri.fsPath);
        return newuri.fsPath;
    }

    /**
     * Returns the Path from a Filename
     * @param filename 
     */
    public static getPathFromFilename(filename: string) {
        return dirname(filename);
    }
}
