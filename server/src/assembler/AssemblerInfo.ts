/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import * as path from 'path';
import { URI } from "vscode-uri";
import StringUtils from "../utils/StringUtils";

export interface AssemblerSourceRange {
    startLine:number;
    startPosition:number;
    endLine:number;
    endPosition:number;
    fileIndex:number;
}

export enum AssemblerSections {
    AssemblerFiles,
    AssemblerSyntax,
    AssemblerErrors,
    AssemblerVersion,
    AssemblerNone,
}

export enum AssemblerEntryType {
    Constant,
    Function,
}

export interface AssemblerDirective {
    name:string;
    example:string;
    description:string;
}

export interface AssemblerFile {
    index:number;
    system:boolean;     // is this an internal system file?
    isCurrent:boolean;  // is this the current or master project file?
    uri:URI;
}

export interface AssemblerSyntax {
    type:string;
    range:AssemblerSourceRange
}

export interface AssemblerError {
	level: string;
	range: AssemblerSourceRange;
	message: string;
}

/*
    Class: AssemblerInfo

        Represents the Information Returned from the Kick Assembler

    Remarks:

        When Kick Assembler is run with the -asminfo option, it will
        produce a AssemblerFile called 'asminfo.txt'.

        This AssemblerFile contains important information about the 
        build of the assembled source AssemblerFiles. It is used by
        the Server to return information back to the Client
        like AssemblerErrors. But it can also be useful when parsing
        the symbols in the Code.
*/
export class AssemblerInfo {

    private AssemblerFiles:AssemblerFile[] = [];
    private AssemblerSyntax:AssemblerSyntax[] = [];
    private AssemblerErrors:AssemblerError[] = [];
    private AssemblerVersion:string = "0";
    public hasCurrent: boolean = false;
    private filename:string = "";

    constructor(data:string, filename:string) {
        this.filename = filename;
        this.processData(data); 
    }

    public getAssemblerFiles():AssemblerFile[] {
        return this.AssemblerFiles;
    }

    public getAssemblerSyntax():AssemblerSyntax[] {
        return this.AssemblerSyntax;
    }

    public getAssemblerErrors():AssemblerError[] {
        return this.AssemblerErrors;
    }

    public getAssemblerVersion():string {
        return this.AssemblerVersion;
    }

    private processData(data:string) {

        var lines = StringUtils.splitIntoLines(data); 
        var section:AssemblerSections;

        this.hasCurrent = false;

        for (var i = 0; i < lines.length; i++) {

            var line:string = lines[i];

            if (line.length <= 0)
                continue;

            if (line.toLowerCase() == "[errors]") {
                section = AssemblerSections.AssemblerErrors;
                continue;
            }

            if (line.toLowerCase() == "[syntax]") {
                section = AssemblerSections.AssemblerSyntax;
                continue;
            }

            if (line.toLowerCase() == "[files]") {
                section = AssemblerSections.AssemblerFiles;
                continue;
            }
            if (line.toLowerCase() == "[version]") {
                section = AssemblerSections.AssemblerVersion;
                continue;
            }

            switch(section) {
                case AssemblerSections.AssemblerErrors:
                    this.addAssemblerError(line);
                    break;

                case AssemblerSections.AssemblerSyntax:
                    this.addAssemblerSyntax(line);
                    break;

                case AssemblerSections.AssemblerFiles:
                    this.addAssemblerFile(line);
                    break;

                case AssemblerSections.AssemblerVersion:
                    this.AssemblerVersion = line;
                    break;
            }
        }
    }

     private addAssemblerError(line:string) {
        var parms = line.split(";");
        let assemblerError = <AssemblerError>{};
        assemblerError.level = parms[0];
        assemblerError.range = this.parseRange(parms[1]);
        assemblerError.message = parms[2];
        this.AssemblerErrors.push(assemblerError);
    }
    
    private addAssemblerSyntax(line:string) {
        var parms = line.split(";");
        let assemblerSyntax = <AssemblerSyntax>{};
        assemblerSyntax.type = parms[0];
        assemblerSyntax.range = this.parseRange(parms[1]);
        this.AssemblerSyntax.push(assemblerSyntax);
    }
    
    private addAssemblerFile(line:string) {
        var parms = line.split(";");
        let assemblerFile = <AssemblerFile> {};
        assemblerFile.index = parseInt(parms[0]);
        let n = path.normalize(parms[1])
        let r = path.resolve(parms[1])
        let p = path.parse(parms[1])
        assemblerFile.uri = URI.file(r)

        //  don't include the kick autoinclude AssemblerFile
        if (assemblerFile.uri.fsPath.indexOf('autoinclude') > 0)
            assemblerFile.system = true;

        var assembledFile = assemblerFile.uri.fsPath.toLowerCase();
        var filename = this.filename.toLowerCase();
    
            //  is this the main project file?
        if (assemblerFile.uri.fsPath.indexOf('.source.txt') > 0)
            assemblerFile.isCurrent = true;

        if ( assembledFile === filename)
            assemblerFile.isCurrent = true;

        if (assemblerFile.isCurrent) {
            this.hasCurrent = true;
        }

        this.AssemblerFiles.push(assemblerFile);
    }
    
    private parseRange(text:string):AssemblerSourceRange {
        let parms = text.split(",");
        let range = <AssemblerSourceRange>{};
        range.startLine = Number(parms[0]) - 1;
        range.startPosition = Number(parms[1]) - 1;
        range.endLine = Number(parms[2]) - 1;
        range.endPosition = Number(parms[3]);
        range.fileIndex = Number(parms[4]);
        return range;
    }

}

