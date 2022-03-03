/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import {
	IConnection,
	TextDocumentPositionParams,
	Hover,
	ResponseError,
	MarkupContent
} from "vscode-languageserver";

import { Provider, ProjectInfoProvider } from "./Provider";
import { InstructionType } from '../definition/KickInstructions';
import Project, { Symbol, SymbolType } from "../project/Project";
import StringUtils from "../utils/StringUtils";
import { KickLanguage } from "../definition/KickLanguage";
import { URI } from "vscode-uri";
import { AssemblerSyntax, AssemblerFile } from "../assembler/AssemblerInfo";

export default class HoverProvider extends Provider {

	// contains all project information
	private project: Project;

	// used for symbol lookups
	private symbols: Symbol[];

	private documentPosition:TextDocumentPositionParams;
	private currentScope: Number;

	constructor(connection: IConnection, projectInfo: ProjectInfoProvider) {

		super(connection, projectInfo);

		connection.onHover((textDocumentPosition: TextDocumentPositionParams) => {
			if (projectInfo.getSettings().valid) {
				return this.process(textDocumentPosition);
			}
		});
	}

    /**
     * Process the Hover Request.
     * @param textDocumentPosition
     */
	private process(textDocumentPosition: TextDocumentPositionParams): Hover | ResponseError<void> {

		this.project = this.getProjectInfo().getProject(textDocumentPosition.textDocument.uri);
		this.symbols = this.project.getAllSymbols();
		this.documentPosition = textDocumentPosition;
		let hoverValue = this.createHover(textDocumentPosition);
		let contents:MarkupContent = {
			value:hoverValue ? hoverValue.join("\n***\n") : '',
			kind:'markdown'
		};

		return { contents };
	}

	/**
	 * Returns the File that a Symbol is from.
	 * 
	 * @param symbol the symbol to use
	 */
	private getFileFromSymbol(symbol: Symbol): string | undefined{

		var file:string = "";

		// when this is a built-in function in the kickass.jar file
		if (symbol.isBuiltin) {
			return "from built-in";
		}

		// when this is in the currently open source file
		if (symbol.isMain) {
			return "";
		}

		var uri = this.project.getSourceFiles()[symbol.fileIndex].getUri();
		var filename = URI.parse(uri);
		var path = require('path');

		file = "from " + path.parse(filename.path).base;

		if (file.indexOf(".source") >= 0) {
			file = "";
		}

		return file;
	}

	/**
	 * Find a Symbol of a specific SymbolType.
	 * 
	 * @param token the token to search the symbol
	 * @param type  the type of symbol to find
	 */
	private findSymbolOfType(token:string, type: SymbolType, sameLine:boolean = false, scope: number = 0): Symbol | undefined {
		let minusChars = 0;
		let plusChars = 0;
		if(type == SymbolType.NamedLabel && !sameLine){
			if(token.indexOf("-")>=0) {
				minusChars = (token.substr(token.indexOf("-"))).length;
			} else if(token.indexOf("+")>=0) {
				plusChars = (token.substr(token.indexOf("+"))).length;
			}
			token = token.replace(/[\+\-]/g,"");
		}

		token = token.replace(/[<>]/g,"");
		let foundLine = 0;
		let symbolStack:Symbol[] = [];
		for(let symbol of this.symbols) {
			if (symbol.type === type) {
				if (symbol.name === token && (symbol.scope == this.currentScope || symbol.scope === 0 || symbol.scope === scope || (this.project.getScopes().find(s => s.id === symbol.scope) || {line:-1}).line === symbol.range.start.line )) {
					if(sameLine && symbol.range && symbol.range.start.line != this.documentPosition.position.line){
						continue;
					}
					if(symbol.range && (minusChars > 0 || plusChars > 0) ) {
						foundLine = symbol.range.start.line;
						if(
							(foundLine <= this.documentPosition.position.line && minusChars > 0) ||
							(foundLine > this.documentPosition.position.line && plusChars > 0)
						){
							symbolStack.push(symbol);
						}
					} else {
						return symbol;
					}
				}
			}
		}
		if(symbolStack.length>0) {
			if(minusChars > 0 && symbolStack.length>=minusChars){
				return symbolStack[(symbolStack.length-minusChars)];
			}
			if(symbolStack.length>=plusChars){
				return symbolStack[plusChars-1];
			}
		}
		return undefined;
	}

	/**
	 * Returns a Description from a Symbol.
	 * 
	 * @param symbol the symbol 
	 */
	private getSymbolDescription(symbol: Symbol): string | undefined {
		var _description: string = "";
		if (symbol.description) _description = symbol.description.trim();
		if (symbol.comments) _description += (_description !== "" ? "\n\n":"") + symbol.comments.trim();
		return _description;
	}

	private createSimpleHover(symbol: Symbol, originalToken?: String): string[] | undefined {

		var _file = this.getFileFromSymbol(symbol);
		var _description = this.getSymbolDescription(symbol);
		var _original = "";

		if (symbol.originalValue) {
			_original = `[${symbol.originalValue}]`;
		}
		var _type = "";

		switch (symbol.type) {
			case SymbolType.Constant:
				_type = '.const';
				break;
			case SymbolType.Variable:
				_type = '.var';
				break;
			case SymbolType.Label:
				_type = '.label';
				break;
			case SymbolType.NamedLabel:
				_type = '(label)';
				// dont show code when hovering over the declaration itself
				if(symbol.codeSneakPeek && originalToken && !originalToken.endsWith(":")) {
					if(_description !="") _description += "\n***";
					_description += "\nSneak Peek:\n```\n"+symbol.codeSneakPeek+"\n```\n";
				}
				break;
			case SymbolType.Boolean:
				_type = '(boolean)';
				break;
			case SymbolType.Namespace:
				_type = '.namespace';
				break;
			case SymbolType.Parameter:
				_type = '(parameter)';
				break;
		}

		return [
			`	${_type} ${symbol.name} ${_original} ${_file}`,
			`${_description}`,
			`${StringUtils.BuildSymbolFormattedValue(symbol)}`
		];
	}

	private createMacroHover(symbol: Symbol): string[] | undefined {

		const _file = this.getFileFromSymbol(symbol);
		const _parms = StringUtils.BuildSymbolParameterString(symbol);
		const _name = symbol.name;
		const _directive = ".macro";
		const _description = this.getSymbolDescription(symbol);

		return [
			`	${_directive} ${_name}(${_parms}) ${_file}`,
			`${_description.trim()}`,
		];

	}

	private createFunctionHover(symbol: Symbol): string[] | undefined {

		const _file = this.getFileFromSymbol(symbol);
		const _parms = StringUtils.BuildSymbolParameterString(symbol);
		const _name = symbol.name;
		const _directive = ".function";
		const _description = this.getSymbolDescription(symbol);

		return [
			`	${_directive} ${_name}(${_parms}) ${_file}`,
			`${_description.trim()}`,
		];

	}

	private createPseudoCommandHover(symbol: Symbol): string[] | undefined {

		const _file = this.getFileFromSymbol(symbol);
		const _parms = StringUtils.BuildSymbolParameterString(symbol,":");
		const _name = symbol.name;
		const _directive = ".pseudocommand";
		const _description = this.getSymbolDescription(symbol);

		return [
			`	${_directive} ${_name} ${_parms} ${_file}`,
			`${_description.trim()}`,
		];

	}
	
	/**
	 * Create a Hover Response at the Current Text Position.
	 * 
	 * @param textDocumentPosition the location in the document
	 */
	private createHover(textDocumentPosition: TextDocumentPositionParams): string[] | undefined {

		// initialize the contents of the returned hover text
		var contents: string[] | undefined;

		// we always need the token word at the cursor
		var line = this.project.getSourceLines()[textDocumentPosition.position.line];
		var token: string;
		/*
			and now -- some logic

			perhaps a partial or full rewrite for returning hovers

			- get the current assembler info syntax
			- read through each line of the current source file (main = true)
			- check for matching line number
			- check for position in range
			- get the syntax type
			- load hover based on syntax type
		*/

		// get main file number
		var fileNumber: number;

		// find the current source file index in the asminfo file
		// TODO: figure this out after assembly instead of here
		var files = this.project.getAssemblerInfo().getAssemblerFiles();
		for (var i: number = 0; i < files.length; i++) {
			var file: AssemblerFile = files[i];
			if (file.isCurrent) {
				fileNumber = file.index;
				break;
			}
		}
		
		if (this.project.getSourceFiles()[fileNumber] == undefined)
			return;
		
			this.currentScope = this.project.getSourceFiles()[fileNumber].getLines()[this.documentPosition.position.line].scope;

		// get current assembler syntax
		var syntaxList: AssemblerSyntax[] = this.project.getAssemblerInfo().getAssemblerSyntax();

		for (var i: number = 0; i < syntaxList.length; i++) {

			var assemblerSyntax: AssemblerSyntax = syntaxList[i];

			// source file?
			if (assemblerSyntax.range.fileIndex === fileNumber) {

				// same line number?
				if (textDocumentPosition.position.line >= assemblerSyntax.range.startLine &&
					textDocumentPosition.position.line <= assemblerSyntax.range.endLine) {

					// in range?
					if (textDocumentPosition.position.character >= assemblerSyntax.range.startPosition &&
						textDocumentPosition.position.character <= assemblerSyntax.range.endPosition) {

						token = line.substr(assemblerSyntax.range.startPosition,assemblerSyntax.range.endPosition-assemblerSyntax.range.startPosition);

						// macroExecution

						if (assemblerSyntax.type === 'macroExecution') {

							const symbol = this.findSymbolOfType(token, SymbolType.Macro);

							if (symbol) {
								return this.createMacroHover(symbol);
							}
						}

						// symbolReference

						if (assemblerSyntax.type === 'symbolReference' || assemblerSyntax.type === 'objFieldReference' || assemblerSyntax.type === 'label') {
							var exactLine = assemblerSyntax.type === 'label';
							var exactScope = 0;
							if(assemblerSyntax.type === 'objFieldReference'){
							// find the previous token to get scope
								let scopeNames = StringUtils.GetWordsBefore(line.replace(/[.]/g,' '), textDocumentPosition.position.character);
								if(scopeNames){
									var scopeName = scopeNames.pop();
									exactScope = (this.project.getScopes().find(s => s.name == scopeName) || {id:-1}).id;
								}
							}
							var symbol = this.findSymbolOfType(token, SymbolType.Variable, exactLine, exactScope);
							if (!symbol) symbol = this.findSymbolOfType(token, SymbolType.Namespace, exactLine, exactScope);
							if (!symbol) symbol = this.findSymbolOfType(token, SymbolType.Constant, exactLine, exactScope);
							if (!symbol) symbol = this.findSymbolOfType(token, SymbolType.Label, exactLine, exactScope);
							if (!symbol) symbol = this.findSymbolOfType(token.replace(":",""), SymbolType.NamedLabel, exactLine, exactScope);
							
							if (symbol) {
								return this.createSimpleHover(symbol, token);
							}
						}

						// mnmemonic

						if (assemblerSyntax.type === 'mnemonic') {
							return this.getInstructionMatch(token);
						}

						// directives

						if (assemblerSyntax.type === 'directive') {
							return this.getDirectiveHover(token);
						}

						// ppDirective

						if (assemblerSyntax.type === 'ppDirective') {
							return this.getPreProcessorMatch(token); // add # for proper search
						}

						// pseudoCommandExecution

						if (assemblerSyntax.type === 'pseudoCommandExecution') {
							const symbol = this.findSymbolOfType(token, SymbolType.PseudoCommand);

							if (symbol) {
								return this.createPseudoCommandHover(symbol);
							}
						}
					}
						
					token = StringUtils.GetWordAt(line.replace(/[\.\+\-\*\/,]/g," "), textDocumentPosition.position.character).trim();

					// mnemonic line?
					if (assemblerSyntax.type === 'mnemonic') {
						
						// when hovering over something in a mnemonic line
						// it is more than likely some kind of literal
						// value or memory address like #$01 or #d000
						//
						// if it was some kind of symbol, it would have already
						// been handled above

						var _contents = StringUtils.BuildTokenFormattedValue(token);

						if (_contents)
							return [
								_contents
							];						

					}

					// directive line?

					if (assemblerSyntax.type != "comment") {
					// if (assemblerSyntax.type === 'directive' || assemblerSyntax.type === 'ppDirective') {

						/*
							when hovering over something on a 
							directive line, and it was not already
							handled as a symbol reference, then
							it is probably the literal value of
							some expression like

							.label LABEL_NAME = $d020

						*/
						var _contents = StringUtils.BuildTokenFormattedValue(token);

						if (_contents) 
							return [
								_contents
							];						

						var _symbol; 
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.NamedLabel);
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.Label);
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.Constant);
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.Function);
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.Macro);
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.PseudoCommand);
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.Variable);
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.Namespace);
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.Parameter);
						if (!_symbol) _symbol = this.findSymbolOfType(token, SymbolType.Boolean);

						if (_symbol) {

							if (_symbol.type === SymbolType.Macro) {
								return this.createMacroHover(_symbol);
							}
							
							if (_symbol.type === SymbolType.Function) {
								return this.createFunctionHover(_symbol);
							}

							return this.createSimpleHover(_symbol);
						}
					}


					// unhandled token information -- uncomment for trubble shooting :)

					contents = [
						token, 
						assemblerSyntax.type
					];
				}
			}
		}
		return contents;
	}

	private createSymbolWithValue(symbol: Symbol, file: string): string[] {

		var description = "";
		var symbolDirective = "";
		switch (symbol.type) {
			case SymbolType.Constant:
				symbolDirective = '.const';
				break;
			case SymbolType.Variable:
				symbolDirective = '.var';
				break;
			case SymbolType.Label:
				symbolDirective = '.label';
				break;				
		}

		if (symbol.description) description = symbol.description.trim();
		if (symbol.comments) description += (description !== "" ? "\n\n":"") + symbol.comments.trim();

		return [
			`	${symbolDirective} ${symbol.name} [${symbol.originalValue}] ${file}`,
			`${description.trim()}`,
			`${StringUtils.BuildSymbolFormattedValue(symbol)}`
		 ];
}

	private getDirectiveHover(token: string): string[] | undefined {
		const tokenMatch = KickLanguage.Directives.find((match) => {
			return match.name.toLowerCase() === token.toLowerCase();
		});
		if (tokenMatch) {
			return [
				`*(directive)* **${tokenMatch.name}** : ${tokenMatch.description}`,
				(tokenMatch.deprecated?`*(deprecated)*`:'')
			];
		} else if (token===KickLanguage.Star.name) {
			return [
				`*(directive)* __${KickLanguage.Star.name}__ : ${KickLanguage.Star.description}`
			];
		}
		
	}

	private getInstructionMatch(token: string): string[] | undefined {
		const tokenMatch = KickLanguage.Instructions.find((match) => {
			return match.name.toLowerCase() === token.toLowerCase();
		});
		if (tokenMatch) {
			return [
				`*(instruction)* **${tokenMatch.name}** : ${tokenMatch.description}`,
				(tokenMatch.type && tokenMatch.type == InstructionType.Illegal ? "**(illegal opcode)**" : ""), 
				(tokenMatch.type && tokenMatch.type == InstructionType.DTV ? "**(DTV opcode)**" : ""), 
				(tokenMatch.type && tokenMatch.type == InstructionType.C02 ? "**(65c02 opcode)**" : ""),
				(tokenMatch.type && tokenMatch.type == InstructionType.CE02 ? "**(65ce02 opcode)**" : ""), 
				(tokenMatch.type && tokenMatch.type == InstructionType.GS02 ? "**(45gs02 opcode)**" : ""),
			];
		}
	}

	private getPreProcessorMatch(token: string): string[] | undefined {
		const tokenMatch = KickLanguage.PreProcessors.find((match) => {
			return match.name.toLowerCase() === token.toLowerCase();
		});
		if (tokenMatch) {
			return [
				`*(pre-processor)* \`${tokenMatch.name}\`: ${tokenMatch.description}`,
			];
		}
	}

}