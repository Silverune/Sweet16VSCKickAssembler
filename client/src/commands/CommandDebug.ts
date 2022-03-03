/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { spawn } from 'child_process';
import { workspace, window, Disposable, ExtensionContext, commands, Uri } from 'vscode';
import PathUtils from '../utils/PathUtils';
import ClientUtils from '../utils/ClientUtils';
import * as vscode from 'vscode';
import * as path from 'path';


export class CommandDebug {

    private configuration: vscode.WorkspaceConfiguration;
    private output: vscode.OutputChannel;

    constructor(context: ExtensionContext, output: vscode.OutputChannel) {
        this.configuration = workspace.getConfiguration('kickassembler');
        this.output = output;
    }

    public runOpen() {
        let sourceFile = ClientUtils.GetOpenDocumentUri();
        let base = path.basename(sourceFile.fsPath);
        
        let overrideOutputFile:string = this.configuration.get("outputFile");
        let program = path.join(ClientUtils.GetOutputPath(), overrideOutputFile != '' ? overrideOutputFile : ClientUtils.CreateProgramFilename(base));
        this.run(program, overrideOutputFile == '' ? null : path.join(ClientUtils.GetOutputPath(), ClientUtils.CreateProgramFilename(base).replace(".prg", ".vs")));
    }

    public runStartup() {
        let sourceFile = ClientUtils.GetStartupUri();
        let base = path.basename(sourceFile.fsPath);
        let overrideOutputFile:string = this.configuration.get("outputFile");
        let program = path.join(ClientUtils.GetOutputPath(), overrideOutputFile != '' ? overrideOutputFile : ClientUtils.CreateProgramFilename(base));
        this.run(program, overrideOutputFile == '' ? null : path.join(ClientUtils.GetOutputPath(), ClientUtils.CreateProgramFilename(base).replace(".prg", ".vs")));
    }

    private run(program:string, symbolFile:string = null) {

        // is the emulator path set?
        let debuggerRuntime: string = this.configuration.get("debuggerRuntime");

        // enclose in quotes to accomodate filenames with spaces on non-windows platforms
        if (process.platform == "darwin") {
            debuggerRuntime = '"' + debuggerRuntime + '"';
		    debuggerRuntime = debuggerRuntime.replace("\\", "");
        }

        let debuggerOptionsString: string = this.configuration.get("debuggerOptions");
        let debuggerOptions: string[] = debuggerOptionsString.match(/\S+/g) || [];
        
        // console.log(`- looking for program ${program}`);

        var fs = require('fs');
        if (!fs.existsSync(program)) {
            window.showWarningMessage(`Could not Locate the Program to Debug.`,`${program}`);
            return;
        }

        let vsf = symbolFile == null ? program.replace(".prg", ".vs") : symbolFile;

        if (process.platform == "darwin") {
            program = '"' + program + '"';
            vsf = '"' + vsf + '"';
        }

        debuggerOptions = ["-autostartprgmode", "1", "-autostart", program, '-moncommands', vsf];   // VICE
        // debuggerOptions = ["-breakpoints", "breakpoints.txt", "-symbols", vsf, "-prg", program, ...debuggerOptions];  // C64Debugger format original

        //  spawn child process for win32
        if (process.platform == "win32") {
            let emu = spawn(debuggerRuntime, debuggerOptions, {
                detached: true,
                stdio: 'inherit',
                shell: false
            });

            // console.log(emu);
            emu.unref();
            return;
        }

        //  spawn child process for osx
        if (process.platform == "darwin") {
            var launcher:string = debuggerRuntime;
            if(debuggerRuntime.endsWith('.app"')) {
                launcher = "open -a";
                debuggerOptions = [debuggerRuntime, "--args", ...debuggerOptions];
            }
            let emu = spawn(launcher, debuggerOptions, {
                detached: true,
                stdio: 'inherit',
                shell: true
            });

            emu.unref();
            return;
        }

        //  spawn child process for linux
        if (process.platform == "linux") {

            let emu = spawn(debuggerRuntime, debuggerOptions, {
                detached: true,
                stdio: 'inherit',
                shell: false
            });

            emu.unref();
            return;
        }
        //  create new output channel
        window.showErrorMessage(`Platform ${process.platform} is not Supported.`);
    }
}