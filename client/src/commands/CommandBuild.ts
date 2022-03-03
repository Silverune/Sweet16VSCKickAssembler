/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/


import { spawn, spawnSync } from 'child_process';
import { Uri, workspace, window, Disposable, ExtensionContext, commands, WorkspaceConfiguration } from 'vscode';
import PathUtils from '../utils/PathUtils';  
import * as vscode from 'vscode';
import * as path from 'path';
import ClientUtils from '../utils/ClientUtils';
import * as fs from 'fs';

export class BuildInformation {
    public buildStatus: number
    public buildData: string
}



export class CommandBuild { 

    public stdout: string;
    
    private configuration: WorkspaceConfiguration;
    private output: vscode.OutputChannel;

    constructor(context:ExtensionContext, output:vscode.OutputChannel) {
        this.configuration = workspace.getConfiguration('kickassembler');
        this.output = output;
    }

    public buildOpen(): BuildInformation {


        var uri = ClientUtils.GetOpenDocumentUri();
        
        if (!uri) {
            var nostartup = window.showWarningMessage(`Cannot build because there is no open document.`);
            return;
        }

        return this.build(ClientUtils.GetOpenDocumentUri());
    }

    public buildStartup(): BuildInformation {

        var uri = ClientUtils.GetStartupUri();
        
        if (!uri) {

            var nostartup = window.showWarningMessage(`Cannot build because there is no startup file defined in your Settings.`, { title: 'Open Settings'});

            nostartup.then((value) => {
                if (value){
                    vscode.commands.executeCommand('workbench.action.openSettings', `kickassembler.startup`);
                }
            });

            return;
        }

        return this.build(ClientUtils.GetStartupUri());
    }

    private build(sourceFile:Uri): BuildInformation {

        // get the java runtime
        let javaRuntime:string = this.configuration.get("javaRuntime");

        // get the path to the kickass jar
        let assemblerJar:string = this.configuration.get("assemblerJar");

        let base = path.basename(sourceFile.fsPath);

        let overrideOutputFile:string = this.configuration.get("outputFile");

        // get the output filename from the current filename or use override
        let outputFile = path.join(ClientUtils.GetOutputPath(), overrideOutputFile != '' ? overrideOutputFile : ClientUtils.CreateProgramFilename(base));

        // delete old output
        // TODO: remove any program output like symbols
        if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
        }

        // create symbol directory
        let symbolDir:string = ClientUtils.GetOutputPath();

        // get the path of the source
        var source: string = PathUtils.GetPathFromFilename(sourceFile.path);
        var scheme: string = "";

        if (sourceFile.scheme != null && sourceFile.scheme != 'file') {
            scheme = sourceFile.scheme + ":";
        }

        var sourcePath: string = path.join(scheme, source);

        // create new output channel
        this.output.clear();
        this.output.show(true);

        var cpSeparator:string = process.platform == "win32" ? ';' : ':';
        var cpPlugins:string[] = this.configuration.get("javaPlugins");
        var cpPluginParameters:string[] = this.configuration.get("javaPluginSystemProperties");
        cpPluginParameters = cpPluginParameters.map(p => '-D' + p);
        var assemblerMainClass:string = this.configuration.get("assemblerMainClass");
        var assemblerArgs:string[] = this.configuration.get("assemblerArgs");
        assemblerArgs = assemblerArgs.map(x => x + ' ');

        let javaOptions = [
            "-cp", 
            cpPlugins.join(cpSeparator) + cpSeparator + assemblerJar,
            ...cpPluginParameters,
            assemblerMainClass, 
            sourceFile.fsPath, 
            "-o", 
            outputFile, 
            "-odir",
            ClientUtils.GetOutputPath(),
            "-symbolfile", 
            "-symbolfiledir", 
            symbolDir,
            ...assemblerArgs
        ];

        if (this.configuration.get("debuggerDumpFile")){
            javaOptions.push('-debugdump');
        }

        if (this.configuration.get("byteDumpFile")){
            let byteDumpFile = path.join(ClientUtils.GetOutputPath(), "ByteDump.txt");
            javaOptions.push('-bytedumpfile', byteDumpFile);
        }

        if (this.configuration.get("emulatorViceSymbols")){
            javaOptions.push('-vicesymbols');
        }

        if (this.configuration.get("javaAllowFileCreation")){
            javaOptions.push('-afo');
        }

        if(this.configuration.get("opcodes.DTV")){
            javaOptions.push('-dtv');
        }

        if(!this.configuration.get("opcodes.illegal")){
            javaOptions.push('-excludeillegal');
        }
        
        var libdirPaths:string[] = this.configuration.get("assemblerLibraryPaths");
        libdirPaths.forEach((libPath) => {
            if(!path.isAbsolute(libPath)) {
                libPath = path.join(sourcePath, libPath);
            }
            if (fs.existsSync(libPath)) {
                javaOptions.push('-libdir',libPath);
            }
        });

        //window.showInformationMessage(`Building ${base.toUpperCase()}`);

        window.showInformationMessage('Debug Building: ', javaOptions.join(' '));
        var start = process.hrtime();

        let java = spawnSync(javaRuntime, javaOptions, { cwd: path.resolve(sourcePath) });

        var end = process.hrtime(start);

        let errorCode = java.status;

        let time = `(${end[0]}s ${end[1].toString().substr(0,3)}ms)`;        

        var outputDisplay = path.basename(outputFile);
        if (errorCode > 0) {
            window.showWarningMessage(`Build of ${outputDisplay} Failed ${time}`);
            this.output.append(java.stdout.toString());
        } else {
            window.showInformationMessage(`Build of ${outputDisplay} Complete ${time}`);
            this.output.append(java.stdout.toString());
        }

        this.stdout = java.stdout.toString();

        var _info = new BuildInformation();
        _info.buildStatus = java.status;
        _info.buildData = java.output.toString();

        return _info;
    }
}
