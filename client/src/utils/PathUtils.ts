/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { dirname } from 'path';
import { Uri } from "vscode"; 
import * as fs from 'fs';


export default class PathUtils {

	/**
	 * Converts "file:///d%3A/blaba/a.x" to "d:\blaba\a.x"
	 */
	public static uriToFileSystemPath(uri:string):string {
		let newuri = Uri.parse(uri);
		return newuri.fsPath;
	}

	/**
	 * Converts "file:///d%3A/blaba/a.x" to "d:\blaba\a.x"
	 */
    public static uriToPlatformPath(uri: string): string {
        let newuri = Uri.parse(uri);
        return newuri.fsPath;
	}
	
	/**
     * Returns the Path from a Filename
     * @param filename 
     */
    public static GetPathFromFilename(filename: string) {
        return dirname(filename);
	}
	
	/**
	 * Returns True if the File Exists
	 * 
	 * Accomodates filenames that might have forward
	 * slashes in thier name for posix transformations
	 * 
	 */
	public static fileExists(filename: string) {

		// account for forward slashes on non-windows platforms 
        if (process.platform != "win32") 
			filename = filename.replace("\\", "");

		return fs.existsSync(filename);

	}
}