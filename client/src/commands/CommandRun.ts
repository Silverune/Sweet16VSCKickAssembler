/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/


import { spawn } from 'child_process';
import { workspace, window, Disposable, ExtensionContext, commands, Uri, WorkspaceConfiguration } from 'vscode';
import * as vscode from 'vscode';
import * as path from 'path';
import ClientUtils from '../utils/ClientUtils';


export class CommandRun {

    private configuration: WorkspaceConfiguration;
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
        this.run(program, overrideOutputFile == '' ? null : '"' + path.join(ClientUtils.GetOutputPath(), ClientUtils.CreateProgramFilename(base).replace(".prg", ".vs") + '"'));
    }

    public runStartup() {
        let sourceFile = ClientUtils.GetStartupUri();
        let base = path.basename(sourceFile.fsPath);
        let overrideOutputFile:string = this.configuration.get("outputFile");
        let program = path.join(ClientUtils.GetOutputPath(), overrideOutputFile != '' ? overrideOutputFile : ClientUtils.CreateProgramFilename(base));        
        this.run(program, overrideOutputFile == '' ? null : '"' + path.join(ClientUtils.GetOutputPath(), ClientUtils.CreateProgramFilename(base).replace(".prg", ".vs") + '"'));
    }

    public run(program:string, symbolFile:string = null) {

        //  is the emulator path set?
        let emulatorRuntime: string  = this.configuration.get("emulatorRuntime");

        // enclose in quotes to accomodate filenames with spaces on non-windows platforms
        if (process.platform == "darwin") {
            emulatorRuntime = '"' + emulatorRuntime + '"';
		    emulatorRuntime = emulatorRuntime.replace("\\", "");
        }

        // console.log(`- looking for program ${program}`);

        var fs = require('fs');
        if (!fs.existsSync(program)) {
            window.showWarningMessage(`Could not Locate the Program to Run`,`${program}`);
            return;
        }

        if (process.platform == "darwin") {
            program = '"' + program + '"';
        }

        let vsf = symbolFile == null ? program.replace(".prg", ".vs") : symbolFile;

        let emulatorOptionsString: string = this.configuration.get("emulatorOptions");
        let emulatorOptions: string[] = emulatorOptionsString.match(/\S+/g) || [];

        if (this.configuration.get("emulatorViceSymbols")){
            // seems to put the breakpoints in here regardless so turn off in non-debug mode
            //emulatorOptions.push('-moncommands',vsf);
        }

        emulatorOptions = ["-autostartprgmode", "1", "-autostart", program, ...emulatorOptions];

        //  spawn child process for win32
        if (process.platform == "win32") {
            let emu = spawn(emulatorRuntime, emulatorOptions, {
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
            var launcher:string = emulatorRuntime;
            if(emulatorRuntime.endsWith('.app"')) {
                launcher = "open -a";
                emulatorOptions = [emulatorRuntime, "--args", ...emulatorOptions];
            }
            let emu = spawn(launcher, emulatorOptions, {
                detached: true,
                stdio: 'inherit',
                shell: true
            });

            emu.unref();
            return;
        }

        //  spawn child process for linux
        if (process.platform == "linux") {

            let emu = spawn(emulatorRuntime, emulatorOptions, {
                detached: true,
                stdio: 'inherit',
                shell: false
            });

            emu.unref();
            return;
        }

        //  create new output channel
        window.showInformationMessage(`Platform ${process.platform} is not Supported.`);
    }
}