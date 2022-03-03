/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/


import * as vscode from 'vscode';
// import * as fs from 'fs';
// import { Uri } from "vscode"; 
import PathUtils from './PathUtils';


export default class ConfigUtils {

	public static validateBuildSettings():boolean {

		let settings = vscode.workspace.getConfiguration("kickassembler");

		if (!PathUtils.fileExists(settings.get("assemblerJar"))) {
			vscode.window.showErrorMessage("Could Not Find the KickAss Jar in the assemblerJar setting.");
			return false;
		}
		
		if (!PathUtils.fileExists(settings.get("javaRuntime"))) {
			vscode.window.showErrorMessage("Could Not Find the Java Runtime in the javaRuntime setting.");
			return false;
		}

        return true;
	}

	public static validateRunSettings():boolean {

		let settings = vscode.workspace.getConfiguration("kickassembler");

		if (!PathUtils.fileExists(settings.get("emulatorRuntime"))) {
			vscode.window.showErrorMessage("Could Not Find the Emulator Runtime in the emulatorRuntime setting.");
			return false;
		}

        return true;
	}

	public static validateDebugSettings():boolean {

		let settings = vscode.workspace.getConfiguration("kickassembler");

		if (!PathUtils.fileExists(settings.get("debuggerRuntime"))) {
			vscode.window.showErrorMessage("Could Not Find the C64Debugger Runtime in the debuggerRuntime setting.");
			return false;
		}

        return true;
	}

}