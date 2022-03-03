/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import * as path from 'path';
import PathUtils from "../utils/PathUtils";
import { URI } from "vscode-uri";

import { Settings } from "../providers/SettingsProvider";
import { AssemblerInfo } from "./AssemblerInfo";
import { writeFileSync, readFileSync } from "fs";
import { spawnSync } from "child_process";
import { combineConsoleFeatures } from 'vscode-languageserver';

export interface AssemblerResults {
    assemblerInfo: AssemblerInfo;
    stdout: string;
    stderr: string;
    status: number;
}

/*
    Class: Assembler

        Runs Kick to Assemble a Source File


    Remarks:

        Attempts to run KickAssembler, but will not actually
        create the assembled object. Instead it will produce
        an assembly information file, that can be used for
        diagnostic information about the source file being
        worked on.

*/
export class Assembler {

    // private assemblerResults: AssemblerResults;

    public assemble(settings: Settings, filename:string, text: string, ignoreOutputPathSetting: boolean = false, ignoreBuildStartup: boolean = false): AssemblerResults | undefined {

        let buildStartup: string = "";


        if (!ignoreBuildStartup)
            buildStartup = settings.startup;

        let uri:URI = URI.parse(filename);

        var outputDirectory: string = settings.outputDirectory;
        var sourcePath: string = PathUtils.getPathFromFilename(uri.fsPath);

        
        if (outputDirectory == "" || ignoreOutputPathSetting) {
            outputDirectory = sourcePath;
        }

        outputDirectory = path.resolve(outputDirectory);        

        var fs = require('fs');
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory);
        }

        let javaOptions:string [] = [];

        var cpSeparator:string = process.platform == "win32" ? ';' : ':';
        var cpPlugins:string[] = settings.javaPlugins;
        var cpPluginParameters:string[] = settings.javaPluginSystemProperties;
        cpPluginParameters = cpPluginParameters.map(p => '-D' + p);
        var assemblerArgs:string[] = settings.assemblerArgs;
        assemblerArgs = assemblerArgs.map(x => x + ' ');

        javaOptions.push(
            "-cp",
            cpPlugins.join(cpSeparator) + cpSeparator + settings.assemblerJar,
            ...cpPluginParameters,
            settings.assemblerMainClass
        );

        /*
            when assembling we want to take the
            source code that has been given to us
            and store it in a temporary source file
            first and then tell kickass to 
            use this

            the compile line ends up looking like:

                java -jar {.source.txt}
        */

        var tmpSource = path.join(sourcePath, ".source.txt");
        //tmpSource = path.resolve(tmpSource);

        writeFileSync(tmpSource, text);

        let srcFilename = tmpSource;

        /*
            when startup has been specified we want to
            use that file to assemble

            the compile ends up looking like:

                java -jar {startup}
        */

        if (buildStartup) {
            srcFilename =  path.resolve() + path.sep + buildStartup;
        } else {
            srcFilename = tmpSource;
        }

        javaOptions.push(
            srcFilename,
            '-noeval',
            '-warningsoff',
            '-showmem',
            ...assemblerArgs
        );

        /*
            the asminfo file is very important because
            it returns information about any errors
            in the source and also the list of symbols
            that are in the assembled source codes
        */

        var tmpAsmInfo = path.join(sourcePath, ".asminfo.txt");
        tmpAsmInfo = path.resolve(tmpAsmInfo);

        javaOptions.push(
            '-asminfo',
            'allSourceSpecific|version',
            '-asminfofile',
            tmpAsmInfo,
            '-asminfoToStdOut'
        );

        if(settings.opcodes.DTV){
            javaOptions.push('-dtv');
        }
        if(!settings.opcodes.illegal){
            javaOptions.push('-excludeillegal');
        }

        var libdirRoot = path.resolve(".");

        settings.assemblerLibraryPaths.forEach((libPath) => {
            var rootLibPath:string = '';            
            if(!path.isAbsolute(libPath)) {
                if (libdirRoot != '') {
                    rootLibPath = path.join(libdirRoot, libPath);
                }
                libPath = path.join(sourcePath, libPath);
            }
            if (fs.existsSync(libPath)) {
                javaOptions.push('-libdir',libPath);                
            } // else?
            if (fs.existsSync(rootLibPath)) {
                javaOptions.push('-libdir',rootLibPath);
            }
        }); 

        //  run java process and wait for return
        
        // console.info(settings.javaRuntime);
        // console.info(javaOptions);
        // console.info(path.resolve(sourcePath));

        let java = spawnSync(settings.javaRuntime, javaOptions, { cwd: path.resolve(sourcePath) });

        // console.info(`error = ${java.error}`);
        // console.info(`status = ${java.status}`);
        // console.info(`signal = ${java.signal}`);
        // console.info(`output = ${java.output.toString()}`);
        // console.info(`stderr = ${java.stderr.toString()}`);
        // console.info(`stdout = ${java.stdout.toString()}`);

        /*
            KickAssembler >= 5.17 supports ASMINFO returned
            from stdout. we check here to see if that exists,
            otherwise drop back to reading it from the 
            file system.
        */

        let asminfoStartString:string = '### ASMINFO START ###';
        let asminfoEndString:string   = '### ASMINFO END ###';
        let asminfo_data:string = java.output.toString();
        let asminfoStart:number = asminfo_data.indexOf(asminfoStartString,0);

        if(asminfoStart > -1) {
            // console.info('- ASMINFO found in stdout');
            asminfoStart += asminfoStartString.length;
            asminfo_data  = asminfo_data.substr(asminfoStart,asminfo_data.indexOf(asminfoEndString)-asminfoStart);
        } else {
            // console.info('- ASMINFO missing from stdout');
            // console.info(tmpAsmInfo);
            asminfo_data = readFileSync(tmpAsmInfo, 'utf8');
        }

        // prepare assembler results

        var assemblerResults = <AssemblerResults>{};
        assemblerResults.assemblerInfo = new AssemblerInfo(asminfo_data, uri.fsPath);
        assemblerResults.stdout = java.stdout.toString();
        assemblerResults.stderr = java.stderr.toString();
        assemblerResults.status = java.status;

        return assemblerResults;
    }

}