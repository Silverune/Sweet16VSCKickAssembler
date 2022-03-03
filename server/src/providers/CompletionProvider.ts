/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

const { resolve } = require('path');
const { readdir } = require('fs').promises;
import * as fs from 'fs';
import * as path from 'path';

import {
	Provider, ProjectInfoProvider
} from "./Provider";

import {
	CompletionItem,
	CompletionItemKind,
	IConnection,
	TextDocumentPositionParams,
	TextEdit,
	MarkupContent,
	SymbolKind,
} from "vscode-languageserver";

enum LanguageCompletionTypes {
	Instruction,
	Symbol,
	Label,
	Register,
	PreProcessor,
	Directives,
}

import Project, { Symbol, SymbolType } from "../project/Project";
import LineUtils from "../utils/LineUtils";
import { KickLanguage } from "../definition/KickLanguage";
import StringUtils from "../utils/StringUtils";
import PathUtils from '../utils/PathUtils'; 
import { InstructionType } from '../definition/KickInstructions';
import { URI } from "vscode-uri";
import { ProjectFile } from '../project/ProjectFile';

export default class CompletionProvider extends Provider {

	private project: Project;
	private textDocumentPosition: TextDocumentPositionParams;

	private documentPosition:TextDocumentPositionParams;
	private documentSource:string[];

	private trigger:string;
	private triggerToken:string;
	private triggerLine:string;
	private triggerCharacterPos: number;
	private currentScope: number;

	private intelligentLabels:boolean;

	private multiLabels: {[key: string]: Symbol[]} = {};

	constructor(connection: IConnection, projectInfo: ProjectInfoProvider) {

		super(connection, projectInfo);

		// 	show the initial list of items
		connection.onCompletion((textDocumentPosition:TextDocumentPositionParams): undefined|Thenable<CompletionItem[]> => {
            // connection.console.info("[CompletionManager] onCompletion");
			// if (projectInfo.getSettings().valid) {
				this.project = projectInfo.getProject(textDocumentPosition.textDocument.uri);
				this.documentPosition = textDocumentPosition;
				this.multiLabels = {};
				return this.createCompletionItems();
			// }
		});

		//	request for more details of a particular item
		connection.onCompletionResolve((item:CompletionItem):CompletionItem => {
            // connection.console.info("[CompletionManager] onCompletionResolve");
			if (projectInfo.getSettings().valid) {
				return this.resolveItem(item);
			}
		});
    }
    
	private async createCompletionItems():Promise<CompletionItem[]> {

		/*
			working out some new pseudo code for completion logic

			no tokens?
				trigger is #?
					show pre-processor directives
				trigger is "."
					show directives
			there are tokens?
				trigger is "<" or ">"
					show vars, labels
				last token ended with ";", ":", "{", "}"?
					trigger is "."?
						show directives
				last token was an instruction or pseudocommand?
					show vars, labels, macros, functions
				last token was nothing?
					show instructions, macros, pseudocommands
				last token was pre-processor directive
					show booleans (made of #define)

		*/

		var items:CompletionItem[] = [];
		
		const settings = this.getProjectInfo().getSettings();

		// if (!settings.valid) return;

		this.triggerCharacterPos = this.documentPosition.position.character - 1;

		/*
			after assembly a list of files will be available
			to the project. in the event that the assembly did 
			not occur we can simply use the existing source
			code.

			this is probably a little overcomplicated right now
			and we can probably do better.
		*/

		var _sourceFiles = this.project.getSourceFiles();

		if (_sourceFiles && _sourceFiles.length > 0) {

			var currentProjectFile: ProjectFile = this.project.getSourceFiles().find(projectFile => {
				return projectFile.isMain();
			});

			this.documentSource = currentProjectFile.getSourceLines();
			this.currentScope = currentProjectFile ? currentProjectFile.getLines()[this.documentPosition.position.line].scope : 0;

		} else {

			if (this.project.getSourceLines()) { 
				this.documentSource = this.project.getSourceLines();
			} else {
				this.documentSource = StringUtils.splitIntoLines(this.project.getSource());
			}
			this.currentScope = 0;
		}

		this.triggerLine = this.documentSource[this.documentPosition.position.line];
		this.trigger = this.triggerCharacterPos >=0 ? this.triggerLine[this.triggerCharacterPos] : "";

		//	get number of tokens before trigger character
		this.triggerToken = StringUtils.GetWordAt(this.triggerLine, this.triggerCharacterPos);
		var tokensLeft = StringUtils.GetWordsBefore(this.triggerLine, this.triggerCharacterPos);
//		var tokensRight = StringUtils.GetWordsAfter(this.triggerLine, triggerCharacterPos);

		// No autocomplete in comments
		var blockCommentStart = this.triggerLine.indexOf('/*');
		var blockCommentEnd = this.triggerLine.lastIndexOf('*/');
		if ((blockCommentStart < this.triggerCharacterPos && blockCommentEnd > this.triggerCharacterPos ) ||
			(tokensLeft && tokensLeft.filter(token => token.indexOf("//") !== -1).length > 0) ||
			this.triggerToken.substr(0,2) == "//" ||
			this.triggerToken == "/*"
			) {
			return;
		}
		var cl=this.documentPosition.position.line-1;
		var inComment=false;
		while(cl>=0) {
			blockCommentStart = this.documentSource[cl].indexOf('/*');
			blockCommentEnd = this.documentSource[cl].lastIndexOf('*/');
			if (blockCommentStart < blockCommentEnd) break;
			if (blockCommentStart > blockCommentEnd) {
				inComment=true;
				break;
			}
			cl--;
		}
		if(inComment) return;

		var inStringTest = this.triggerLine.substr(0,this.triggerCharacterPos).replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,"");
		if (inStringTest.match(/["']/) || this.triggerToken=='""' || this.triggerToken=="''") {
//inside a string quote, now check if its a file selection, its the only allowed intellisense possibility here
			if((tokensLeft && 
				tokensLeft[0].match(/\.*import(if)*/) ||
				tokensLeft[tokensLeft.length-1].substr(0,4) == "Load")
			) {
				var extensionFilter = '';
				if(tokensLeft[0].substr(0,6) === "import" || (tokensLeft[0] === ".import" && tokensLeft[1] === "source") ){
					extensionFilter = settings.fileTypesSource;
				}
				if(tokensLeft[tokensLeft.length-1].substr(0,10) == "LoadBinary" || (tokensLeft[0] === ".import" && tokensLeft[1] === "binary") ){
					extensionFilter = settings.fileTypesBinary;
				}
				if(tokensLeft[tokensLeft.length-1].substr(0,7) == "LoadSid"){
					extensionFilter = settings.fileTypesSid;
				}
				if(tokensLeft[tokensLeft.length-1].substr(0,11) == "LoadPicture"){
					extensionFilter = settings.fileTypesPicture;
				}
				if(tokensLeft[0] === ".import" && tokensLeft[1] === "c64"){
					extensionFilter = settings.fileTypesC64;
				}
				if(tokensLeft[0] === ".import" && tokensLeft[1] === "text"){
					extensionFilter = settings.fileTypesText;
				}

				extensionFilter = extensionFilter.trim()	
					.replace(/  +/g,' ')	// reduce multiple spaces to one
					.replace(".","")		// remove possible extension dots
					.replace(/[, ]/g,"|")	//convert them to regex or
				;
				const sourcePath:string = PathUtils.getPathFromFilename(this.project.getUri());
				var foundFiles = await this.loadFileSystem(extensionFilter,PathUtils.uriToPlatformPath(sourcePath));

				var libpathDirentries;
				for(let i=0, il=settings.assemblerLibraryPaths.length; i < il; i++){
					let libPath = settings.assemblerLibraryPaths[i];
					if(!path.isAbsolute(libPath)) {
						libPath = path.join(sourcePath, libPath);
					}
					if (fs.existsSync(libPath)) {
						libpathDirentries = await this.loadFileSystem(extensionFilter,PathUtils.uriToPlatformPath(URI.file(libPath).toString()));
						if(libpathDirentries.length>0) {
							foundFiles.push(...libpathDirentries);
						}
					}
				}
				if(foundFiles.length === 0){
					// to prevent confusing word proposals (it's a central setting in vscode) return at least one item 
					foundFiles.push(<CompletionItem> {
						label: "No matching files found",
						kind: CompletionItemKind.File,
						data: {
							payload:{}
						}
					});
				}
				return foundFiles;
			}
			return;
		}

		// 	preproc only on "#" trigger as first directive in line
		if (!tokensLeft && this.trigger == "#") {
			items = this.loadPreprocessorDirectives();
		} 

		if(this.trigger == "."){
			var preparedToken = StringUtils.GetWordAt(this.triggerLine, this.triggerCharacterPos, false).replace(/\(.*?\)/g,"");
			var possibleInternalClass = LineUtils.getTokenAtLinePosition(preparedToken,preparedToken.length - 1);
			if(possibleInternalClass) {
				var symbolInstance = "", instancePos;
				for (let symbol of this.project.getSymbols()) {
					if (symbol.name == possibleInternalClass && (symbol.scope == this.currentScope || symbol.scope === 0)) {
						if(symbol.kind == SymbolKind.Namespace){
							var scopeElement = this.project.getScopes().find(scope => {
								return scope.name == possibleInternalClass && scope.parentScope == symbol.scope
							});
							for (let scopedSymbol of this.project.getSymbols()) {
								if(scopedSymbol.scope == scopeElement.id && scopedSymbol.type !== SymbolType.Macro){
									items.push(this.createCompletionItem(scopedSymbol.name, LanguageCompletionTypes.Symbol, scopedSymbol, scopedSymbol.completionKind || CompletionItemKind.Variable));
								}
							}	
						} else if (symbol.originalValue) {
							instancePos = symbol.originalValue.indexOf("(");
							if(instancePos > 0) {
								symbolInstance = symbol.originalValue.substr(0,instancePos);
								for (let symbol of this.project.getBuiltInSymbols()) {
									if (symbol.name == possibleInternalClass || symbol.name == symbolInstance) {
										if(symbol.properties) {
											symbol.properties.forEach((property)=> {
												items.push(this.createCompletionItem(property.name, LanguageCompletionTypes.Symbol, property, CompletionItemKind.Property));
											});
										}
										if(symbol.methods) {
											symbol.methods.forEach((method)=> {
												items.push(this.createCompletionItem(method.name, LanguageCompletionTypes.Symbol, method, CompletionItemKind.Method));
											});	
										}
									}
								}
							}
						}
					}
				}				
			} else if (items.length === 0 && (!tokensLeft || (tokensLeft.length === 1 && this.triggerLine.trim().substr(0,tokensLeft[0].length+1) === tokensLeft[0]+":"))) {
				items = this.loadDirectives();
			}
		} else if (items.length === 0 && !(!tokensLeft && this.triggerToken[0] == "!")) {
			var prevToken:string = "";
			var prevSymbolType:SymbolType;

			/**
			 * when the trigger is larger than one character then we
			 * no longer want to send anything
			 */
			// if (this.triggerToken.length > 1 && this.trigger != " ") {
			// 	prevToken = "none";
			// }

			if(tokensLeft && prevToken == "") {
				var lastToken = tokensLeft[tokensLeft.length - 1].toLowerCase();
				const instructionMatch = KickLanguage.Instructions.find((instruction) => {
					return instruction.name.toLowerCase() === lastToken;
				});
				if (instructionMatch) {
					prevToken = "instruction";
				}

				if(prevToken == "") {
					const symbolMatch = this.project.getSymbols().find((the_symbol) => {
						return the_symbol.name.toLowerCase() === lastToken;
					});
					if (symbolMatch) {
						prevToken = "symbol";
						prevSymbolType = symbolMatch.type;
					}
				}

				if(prevToken == "") {
					const preProcessorMatch = KickLanguage.PreProcessors.find((preProcessor) => {
						return preProcessor.name.toLowerCase().substring(1) === lastToken && preProcessor.parameters.length > 0;
					});
					if (preProcessorMatch) {
						prevToken = "preprocessor";
					}			
				}

				if(prevToken == "") {
					var firstToken = tokensLeft[0].toLowerCase();
					const directiveMatch = KickLanguage.Directives.find((directive) => {
						return directive.name.toLowerCase() === lastToken || directive.name.toLowerCase() === firstToken;
					});
					if (directiveMatch) {
						prevToken = "directive";
					}			
				}
			}

			// always insert named labels if not preprocessors
			if (prevToken !== "preprocessor" && prevToken != "none") {
				items = items.concat(this.loadSymbols(SymbolType.NamedLabel));
			}
			// completion items for unhandled previous tokens
			if (prevToken == "") {

				items = this.loadInstructions();

				// insert macros
				items = items.concat(this.loadSymbols(SymbolType.Macro));

				// insert pseudocommands
				items = items.concat(this.loadSymbols(SymbolType.PseudoCommand));

				// insert namespaces
				items = items.concat(this.loadSymbols(SymbolType.Namespace));

				items.push(this.createCompletionItem(KickLanguage.Star.name, LanguageCompletionTypes.Label, KickLanguage.Star, CompletionItemKind.Value));
			}	

			if (prevToken == "instruction") {
				items = items.concat(this.loadSymbols(SymbolType.Function));
				items = items.concat(this.loadSymbols(SymbolType.Variable));
				items = items.concat(this.loadSymbols(SymbolType.Label));
				items = items.concat(this.loadSymbols(SymbolType.Constant));
				items = items.concat(this.loadSymbols(SymbolType.Parameter));
				items = items.concat(this.loadSymbols(SymbolType.Namespace));
			}

			if (prevToken == "symbol" || prevToken == "directive") {
				items = items.concat(this.loadSymbols(SymbolType.Function));
				items = items.concat(this.loadSymbols(SymbolType.Variable));
				items = items.concat(this.loadSymbols(SymbolType.Label));
				items = items.concat(this.loadSymbols(SymbolType.Constant));
				items = items.concat(this.loadSymbols(SymbolType.Parameter));
				items = items.concat(this.loadSymbols(SymbolType.Namespace));
			}

			if (prevToken == "preprocessor" && lastToken !== "define") {
				items = items.concat(this.loadSymbols(SymbolType.Boolean));
			}

		}
// to prevent confusing word proposals (it's a central setting in vscode) return at least one item 
		if(items.length===0){
			items.push(this.createCompletionItem(" ",LanguageCompletionTypes.Symbol,{},CompletionItemKind.Text));
		}
		return items;
	}

	private async loadFileSystem(extensionFilter:string, dir:string,base?:string):Promise<CompletionItem[]> {
		if (!base) base = dir;
		// make setting entries dynamic :)
		const outputDirectory = this.getProjectInfo().getSettings().outputDirectory;
		const currentEditorFile = path.basename(this.project.getUri());
		const dirents = await readdir(dir, { withFileTypes: true });
		const files = await Promise.all(
			dirents
			.filter((dirent: fs.Dirent) => {
				const ext = path.extname(dirent.name);
				const extReg = new RegExp("\\.("+extensionFilter+")", "i");
				return dirent.name !== currentEditorFile && dirent.name !== outputDirectory && dirent.name[0] !== '.' && (extensionFilter == "" || dirent.isDirectory() || ext.match(extReg));
			})
			.map((dirent: fs.Dirent) => {
				const res = resolve(dir, dirent.name);
				const ext = path.extname(dirent.name);
				const relPath = res.replace(base,"").substr(1);
				const documentation = ext.match(/\.(jpg|png|gif)/i) ? {
					value: `![](file://${res})\n\n\n\n\n\n\n\n\#### Preview`,
					kind: 'markdown'
				} : '';
				return dirent.isDirectory() ? this.loadFileSystem(extensionFilter,res,base) : <CompletionItem> {
					label: relPath,
					kind: CompletionItemKind.File,
					documentation,
					data: {
						payload:{}
					}
				};
			})
		);
		var cleanedFiles = Array.prototype.concat(...files).filter((entry:CompletionItem) => {
			return !!entry.label;
		});
		return cleanedFiles;
	}

	private createCompletionItem(label:string, type:LanguageCompletionTypes, payload:any, kind:CompletionItemKind):CompletionItem {
		
		let filterText = label;
		let textEdit: TextEdit = {
			newText: label,
			range: {
				start: this.documentPosition.position,
				end: this.documentPosition.position
			}
		};

		if (this.trigger.match(/[.#]/) && (type == LanguageCompletionTypes.PreProcessor || type == LanguageCompletionTypes.Directives)) {			
			filterText = filterText.substr(1);
			textEdit.newText = label.substr(1);
		}
		
		if(!this.trigger.match(/[.#,<> ]/)) {
			textEdit.range.start.character = this.triggerCharacterPos;
			textEdit.range.end.character = this.triggerCharacterPos;			
		}

		let documentation: string | MarkupContent = payload.description || payload.comments || payload.codeSneakPeek ? {
			value:	((payload.description || payload.comments || '') +
					(payload.example ? "\n***\n"+payload.example : "") +
					(payload.deprecated ? "\n***\n*(deprecated)*" : "") + 
					(payload.codeSneakPeek ? "\n***\nSneak Peek\n```\n"+payload.codeSneakPeek+"\n```\n" : "") +
					(type == LanguageCompletionTypes.Instruction && payload.type ? (
						(payload.type == InstructionType.Illegal ? "\n***\n**(Illegal opcode)**" : "") + 
						(payload.type == InstructionType.DTV ? "\n***\n**(DTV opcode)**" : "") + 
						(payload.type == InstructionType.C02 ? "\n***\n**(65c02 opcode)**" : "") +
						(payload.type == InstructionType.CE02 ? "\n***\n**(65ce02 opcode)**" : "") +
						(payload.type == InstructionType.GS02 ? "\n***\n**(45gs02 opcode)**" : "")
					):"")).replace(/^\n\*\*\*\n/,""),
			kind: 'markdown'
		} : "";

		let adjustedSnippet = (payload.snippet || "");
		if(payload.snippet  && payload.parameters && payload.snippet.replace(/[\(\) ]/g,"") === "$0" && this.getProjectInfo().getSettings().completionParameterPlaceholders){
			var paramSnippet: string[] = [];
			for (var i=0,iL=payload.parameters.length;i<iL;i++){
				paramSnippet.push("${"+(i+1)+":"+payload.parameters[i].name+"}");
			}
			adjustedSnippet = payload.type === SymbolType.PseudoCommand ? " "+paramSnippet.join(":") : '('+paramSnippet.join(',')+')';
		}
		textEdit.newText += adjustedSnippet;

		let command: string = "";
		if(payload.snippet) {
			if (payload.parameters && payload.parameters.length > 0 && (payload.type == SymbolType.PseudoCommand || (payload.snippet[0] === "(" && payload.snippet[1] !== '"'))) {
				command = 'editor.action.triggerParameterHints';
			} else if (payload.snippet.substr(0,2) !== "()" && payload.snippet !== "\n") {
				command = 'editor.action.triggerSuggest';
			}
		}
		var sortText = '';
		var detail = '';

		if(!payload.isBuiltin && type !== LanguageCompletionTypes.Instruction && payload.scope != undefined){
			//have current scope first, so decent sort
			sortText = String(99999-payload.scope);
			if(payload.scope>0) {
				var scopeElement = this.project.getScopes()[payload.scope];
				if(scopeElement) {
					detail='Scope: '+scopeElement.name
				}
			}
			if(label[0] == "!") {
				let multiLabelsKey = label + String(payload.scope);
				if(!this.multiLabels[multiLabelsKey]) {
					this.multiLabels[multiLabelsKey] = this.project.getSymbols().filter(symbol => {
						return symbol.name == label && symbol.scope === payload.scope;
					});
				}
				let multiLabelAddon = "";
				let howManyMinusSymbols = this.multiLabels[multiLabelsKey].filter(symbol => {
					return symbol.range.start.line <= this.documentPosition.position.line;
				}).length;

				for(var p=0,pL=this.multiLabels[multiLabelsKey].length;p<pL;p++){
									
					if (this.multiLabels[multiLabelsKey][p].range.start.line > this.documentPosition.position.line) {
						if(multiLabelAddon.indexOf("-") >= 0) {
							multiLabelAddon="";
						}
						multiLabelAddon += "+";
					} else {
						multiLabelAddon += "-";
					}

					if(this.multiLabels[multiLabelsKey][p].range.start.line === payload.range.start.line) {
						break;
					}
				}
				if(multiLabelAddon[0] == "-") {
					multiLabelAddon = "-".repeat((howManyMinusSymbols-multiLabelAddon.length)+1);	
				}
				textEdit.newText += multiLabelAddon;
				label+= multiLabelAddon; 
				filterText = label;
			}
		}
		
		return {
			label,
			kind,
			documentation,
			filterText,
			textEdit,
			insertTextFormat: 2,
			command: {
				title: '',
				command
			},
			data: {
				type,
				payload
			},
			sortText,
			detail
		};
	
	}

	private resolveItem(item:CompletionItem):CompletionItem {
		return item;
	}

	private loadInstructions(): CompletionItem[] {

		var items: CompletionItem[] = [];
		var settings = this.getProjectInfo().getSettings();
		for (let instruction of KickLanguage.Instructions) {
			const name = instruction.name.toLocaleLowerCase();
			if (!instruction.type ||
				(instruction.type === InstructionType.Illegal && settings.opcodes.illegal) ||
				(instruction.type === InstructionType.DTV && settings.opcodes.DTV) ||
				(instruction.type === InstructionType.C02 && settings.opcodes["65c02"]) ||
				(instruction.type === InstructionType.CE02 && settings.opcodes["65ce02"]) ||
				(instruction.type === InstructionType.GS02 && settings.opcodes["45gs02"])
			) { 
				items.push(this.createCompletionItem(name, LanguageCompletionTypes.Instruction, instruction, CompletionItemKind.Text));
			}
		}

		return items;
	}

	private loadDirectives(): CompletionItem[] {
		
		var items: CompletionItem[] = [];

		for (let directive of KickLanguage.Directives) {
			const name = directive.name.toLocaleLowerCase();
			items.push(this.createCompletionItem(name, LanguageCompletionTypes.Directives, directive, CompletionItemKind.Interface));
		}

		return items;
	}


	private loadPreprocessorDirectives(): CompletionItem[] {

		var items: CompletionItem[] = [];

		for (let pp of KickLanguage.PreProcessors) {
			const name = pp.name.toLocaleLowerCase();
			items.push(this.createCompletionItem(name, LanguageCompletionTypes.PreProcessor, pp, CompletionItemKind.Interface));
		}

		return items;

	}

	/**
	 * Load Symbols from Source file and Built In Resources.
	 * @param symbolType 
	 */
	private loadSymbols(symbolType:SymbolType): CompletionItem[] {

		var items: CompletionItem[] = [];
		var symbols = this.project.getSymbols();

		// project symbols
		for (let symbol of symbols) {
			if (symbol.type == symbolType && (symbol.scope == this.currentScope || symbol.scope === 0)) {
				items.push(this.createCompletionItem(symbol.name, LanguageCompletionTypes.Label, symbol, symbol.completionKind || CompletionItemKind.Class));
			}
		}

		// built-in symbols
		for (let symbol of this.project.getBuiltInSymbols()) {
			if (symbol.type == symbolType) {
				items.push(this.createCompletionItem(symbol.name, LanguageCompletionTypes.Label, symbol, symbol.completionKind || CompletionItemKind.Class));
			}

		}

		return items;
	}

}
