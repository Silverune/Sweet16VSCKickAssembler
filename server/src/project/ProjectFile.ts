/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

/*
    Class: ProjectFile

        Represents one File in the Project

    Remarks:

        A Project can consist of one large
        source file, or many source files
        using the #import directives.

        Kick Assembler will combine the
        files and summarize them at the
        end of the compile process.

        Each of those files and their source
        will be put into its own project
        file that can be used.
*/

import { URI } from "vscode-uri";
import StringUtils from "../utils/StringUtils";
import { Line, Scope, Comment, ScopeType } from "./Project";
import { AssemblerSyntax } from "../assembler/AssemblerInfo";

export class ProjectFile {

    //  the uri of the document
    private uri: URI;

    //  the text of the document
    private text: string;

    //  lines of text
    private lines:Line[];
    private comments: Comment[];

    //  is the main project file
    private main:boolean;

    private scopes: Scope[] = [];

    private lastScope: number = 0;

    public constructor(uri: URI, text: string, main: boolean, nextScope: number, assemblerSyntax:AssemblerSyntax[]) {
        this.uri = uri
        this.text = text;
        this.comments = this.fetchComments(assemblerSyntax);
        this.lines = this.createLines(nextScope);
        this.main = main;
        this.lastScope = nextScope;
    }

    //  returns the source code as one large string
    public getSource(): string | undefined {
        return this.text;
    }

    //  returns the source code as an array of strings(rows)
    public getSourceLines(): string[] | undefined {
        return StringUtils.splitIntoLines(this.text);    
    }

    public getLines(): Line[]|undefined {
        return this.lines;
    }

    public isMain(): boolean {
        return this.main;
    }

    public getUri(): string {
        return this.uri.toString();
    }

    public getScopes(): Scope[] {
        return this.scopes;
    }

    public setSource(text: string) {
        this.text = text;
        this.lines = this.createLines(this.lastScope);
    }

    private fetchComments(assemblerSyntax:AssemblerSyntax[]):Comment[] {
        var comments:Comment[] = [];
        for (var syntax of assemblerSyntax) {
            if(syntax.type === 'comment') {
                comments.push({range:syntax.range});
            }
        }
        return comments;
    }

    private createLines(next:number):Line[] {

        let lines = [];
        let sourceLines = this.getSourceLines();
        let cleanedSourceLines = this.removeComments(this.getSourceLines());
        let last = [];
        let scope = 0;
        let lastPossibleScopeName = {
            name: '',
            line: 0,
            type: ScopeType.NamedLabel
        };

        var possibleLabel: RegExpMatchArray;
        var possibleScopeType: ScopeType;

        for (var i = 0; i < cleanedSourceLines.length; i++) {

            let line = <Line>{};

            line.scope = scope;
            line.text = sourceLines[i];
            line.cleanedText = cleanedSourceLines[i];

            let isFileNameSpace = false;
            let sourceLine = cleanedSourceLines[i].trim();
            if(sourceLine.substr(0,10).toLowerCase() === '.namespace'){
                possibleLabel=sourceLine.substr(10).trim().match(/\w*/);
                possibleScopeType = ScopeType.Namespace;
            } else if(sourceLine.substr(0,14).toLowerCase() === '.filenamespace'){
                possibleLabel=sourceLine.substr(14).trim().match(/\w*/);
                possibleScopeType = ScopeType.Namespace;
                isFileNameSpace = true;
            } else if(sourceLine.substr(0,9).toLowerCase() === '.function'){
                possibleLabel=sourceLine.substr(9).trim().match(/\w*/);
                possibleScopeType = ScopeType.Function;
            } else if(sourceLine.substr(0,6).toLowerCase() === '.macro'){
                possibleLabel=sourceLine.substr(6).trim().match(/\w*/);
                possibleScopeType = ScopeType.Macro;
            } else if(sourceLine.substr(0,14).toLowerCase() === '.pseudocommand'){
                possibleLabel=sourceLine.substr(14).trim().match(/\w*/);
                possibleScopeType = ScopeType.PseudoCommand;
            } else {
                possibleLabel=sourceLine.match(/\w*:/);
                possibleScopeType = ScopeType.NamedLabel;
            }
            if(possibleLabel){
                lastPossibleScopeName = {
                    name:possibleLabel[0].replace(":",""),
                    line: i,
                    type: possibleScopeType
                }
            }
            
            let openingBrace = sourceLine.indexOf("{");
            let closingBrace = sourceLine.indexOf("}");

            //make sure to support a closing and opening in brace in the same line
            if (closingBrace >= 0 && closingBrace < openingBrace) {
                scope = last.pop();
            }
            //	search for {  - add to scope
            if (openingBrace >= 0 || isFileNameSpace) {
                last.push(scope);                
                let existingScope = this.scopes.find(exScope => {
                    return exScope.name == lastPossibleScopeName.name && exScope.type == ScopeType.Namespace;
                });
                if(lastPossibleScopeName.type === ScopeType.Namespace && existingScope) {
                    scope = existingScope.id;
                } else {
                    this.scopes.push({
                        id: next,
                        parentScope: scope,
                        name: lastPossibleScopeName.name !== '' ? lastPossibleScopeName.name : 'Anonymous',
                        line: lastPossibleScopeName.name !== '' ? lastPossibleScopeName.line : i,
                        type: lastPossibleScopeName.type
                    });
                    scope = next++;
                }
                lastPossibleScopeName = {
                    name:'',
                    line: 0,
                    type: ScopeType.NamedLabel
                };
            }
            
            //	search for } - remove from scope
            if (closingBrace >= 0 && closingBrace > openingBrace) {
                scope = last.pop();
            }
            lines.push(line);
        }
        return lines;
    }

    private removeComments(sourceLines: string[]):string[] {
        this.comments.forEach(comment => {
            for(var i=comment.range.startLine;i<=comment.range.endLine;i++) {
                if(!sourceLines[i]) break;
                if(comment.range.startLine ==  comment.range.endLine) {
                    // dont trim but replace with spaces to support a possible a block comment in one line only and still has code at the end and keep symbol range positioning
                    sourceLines[i] = sourceLines[i].substr(0,comment.range.startPosition)+(' '.repeat(comment.range.endPosition-comment.range.startPosition))+sourceLines[i].substr(comment.range.endPosition);
                } else {
                  if (i == comment.range.startLine) {
                    sourceLines[i] = sourceLines[i].substr(0,comment.range.startPosition);
                  }
                  if (i == comment.range.endLine) {
                    sourceLines[i] = sourceLines[i].substr(comment.range.endPosition);
                  } else {
                    sourceLines[i] = "";  
                  }
                }
            }
        });
        return sourceLines;
    }
}