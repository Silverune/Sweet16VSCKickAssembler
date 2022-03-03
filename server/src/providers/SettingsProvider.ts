/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { 
    Provider, ProjectInfoProvider 
} from "./Provider";

import { 
    IConnection,
    DidChangeConfigurationParams
 } from "vscode-languageserver";
import Project from "../project/Project";
import { Assembler, AssemblerResults } from "../assembler/Assembler"
import * as path from 'path';
import PathUtils from "../utils/PathUtils";
import * as fs from "fs";
import * as opn from "open";
import { URI } from "vscode-uri";

/*

*/

interface GlobalSettings {
    ['kickassembler']:Settings;
}

interface SettingsOpcodes {
    "65c02":boolean;
    "65ce02":boolean;
    "45gs02":boolean;
    DTV: boolean;
    illegal: boolean;
}
export interface Settings {
    assemblerJar: string
    javaRuntime: string;
    javaOptions: string;
    javaPlugins: string[];
    javaPluginSystemProperties: string[];
    valid: boolean;
    emulatorRuntime: string;
    emulatorOptions: string;
    emulatorViceSymbols: boolean;
    debuggerRuntime: string;
    debuggerOptions: string;
    outputDirectory: string;
    autoAssembleTrigger: string;
    autoAssembleTriggerDelay: number;
    debuggerDumpFile: boolean;
    byteDumpFile: boolean;
    javaAllowFileCreation: boolean;
    completionParameterPlaceholders: boolean;
    fileTypesBinary: string;
    fileTypesSid: string;
    fileTypesPicture: string;
    fileTypesSource: string;
    fileTypesC64: string;
    fileTypesText: string;
    opcodes:SettingsOpcodes;
    assemblerLibraryPaths: string[];
    startup: string;
    codeSneakPeekLines: number;
    assemblerMainClass: string;
    assemblerArgs: string[];
    outputFile: string;
}

export default class SettingsProvider extends Provider {

    private settings:Settings;
    private kickAssemblerLatestVersion:string = "5.19";
    private kickAssemblerWebsite: string = "http://theweb.dk/KickAssembler/";

    constructor(connection:IConnection, projectInfo:ProjectInfoProvider) {

        super(connection, projectInfo);
        // connection.console.info("[SettingsProvider]");

        connection.onDidChangeConfiguration((change:DidChangeConfigurationParams) => {
            const settings = <GlobalSettings>change.settings;
            this.process(<Settings>settings['kickassembler']);
        });
    }

    public getSettings() {
        return this.settings;
    }

    private process(settings:Settings) {
        
        this.settings = settings;
        this.settings.valid = this.validateSettings(settings);

        // var _s = "\n";
        // _s += `\n`
        // _s += `Settings\n`;
        // _s += `--------\n`
        // _s += `javaRuntime                  ${settings.javaRuntime}\n`
        // _s += `javaOptions                  ${settings.javaOptions}\n`
        // _s += `emulatorRuntime              ${settings.emulatorRuntime}\n`
        // _s += `assemblerJar                 ${settings.assemblerJar}\n`
        // _s += `outputDirectory              ${settings.outputDirectory}\n`
        // _s += `autoAssemblerTrigger         ${settings.autoAssembleTrigger}\n`
        // _s += `autoAssemblerTriggerDelay    ${settings.autoAssembleTriggerDelay}\n`

        // this.getConnection().console.info(_s);
    }

    /**
     * Returns true if the settings for the extension are Valid, 
     * false otherwise.
     * 
     * @param settings 
     */
    private validateSettings(settings:Settings):boolean|undefined {

       // is the assembler setting empty?
        if (!fs.existsSync(settings.assemblerJar)) return false;

        // is the java runtime empty?
        if (!fs.existsSync(settings.javaRuntime)) return false;

        for(let i=0, il=settings.assemblerLibraryPaths.length; i < il; i++){
            let libPath = settings.assemblerLibraryPaths[i];
            if (path.isAbsolute(libPath) && !fs.existsSync(libPath)) {
                this.getConnection().window.showWarningMessage(`KickAssembler Library Path "${libPath}" does not exist. Ignoring.`);
            }
        }
        for(let i=0, il=settings.javaPlugins.length; i < il; i++){
            if (!fs.existsSync(settings.javaPlugins[i])) {
                this.getConnection().window.showWarningMessage(`Java Plugin "${settings.javaPlugins[i]}" does not exist. Ignoring.`);
            }
        }        

        try {

            fs.accessSync(PathUtils.getPathFromFilename(settings.assemblerJar), fs.constants.W_OK);
            let assembler = new Assembler();
            let uri = URI.file(settings.assemblerJar)
            let assemblerResults = assembler.assemble(this.settings, uri.toString(), "",true, true);
            var kickassVersion = assemblerResults.assemblerInfo.getAssemblerVersion();

            if(kickassVersion === "0") {
                // version lower than 5.12, parse output
                var parsedKickassVersion = assemblerResults.stdout.match(/\d+\.\d+/);
                if(parsedKickassVersion) {
                    kickassVersion = parsedKickassVersion[0];
                }
            }

            var compareVersions = require('compare-versions');
            if(compareVersions.compare(kickassVersion,"4","<")) {
                this.kickAssBelow4Error(kickassVersion);
                return false;       
            }

            if(compareVersions.compare(kickassVersion,"5","<")) {
                var offerKickassDownload = this.getConnection().window.showWarningMessage(`Your KickAssembler Version ${kickassVersion} is outdated.`, {
                    title: 'Upgrade KickAssembler'
                });
                offerKickassDownload.then((value) => {
                    if (value){
                        opn(this.kickAssemblerWebsite);
                    }
                });   
            }        
            else if(compareVersions.compare(kickassVersion,this.kickAssemblerLatestVersion,"<")) {
                var offerKickassDownload = this.getConnection().window.showInformationMessage(`Your KickAssembler Version ${kickassVersion} can be updated to ${this.kickAssemblerLatestVersion}.`, {
                    title: 'Download Update' 
                });
                offerKickassDownload.then((value) => {
                    if (value){
                        opn(this.kickAssemblerWebsite);
                    }
                }); 
            }
        }
        catch (err) {

            // at least try to guess the version by jar size
            const jarFileStats = fs.statSync(settings.assemblerJar);

            // Kickass 2.x and 3.x are smaller than 400k in size - LOL
            if (jarFileStats.size < 400000) {
                this.kickAssBelow4Error('lower than 4.0')
                return false;
            }

            // log the error and return message that we cannot figure it out :)
            console.log(err);
            this.getConnection().window.showWarningMessage('Unable to Check the KickAssembler Version.');
        }

        return true;
    }

    private kickAssBelow4Error(kickassVersion:string){

        var offerKickassDownload = this.getConnection().window.showErrorMessage(`Your KickAssembler Version ${kickassVersion} is not supported.`, {
            title: 'Get supported KickAssembler Version',
        });

        offerKickassDownload.then((value) => {
            if (value){
                opn(this.kickAssemblerWebsite);
            }
        });
    }

}