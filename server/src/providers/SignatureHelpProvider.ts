/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { Provider, ProjectInfoProvider } from "./Provider";
import StringUtils from "../utils/StringUtils";
import { Parameter } from "../definition/KickPreprocessors";
import Project from "../project/Project";

import {
	Connection,
	SignatureHelp,
	TextDocumentPositionParams,
	SignatureInformation,
	ParameterInformation,
	SymbolKind,
} from "vscode-languageserver";
import { Symbol, SymbolType } from "../project/Project";
import { close } from "fs";


export default class SignatureHelpProvider extends Provider {
	private project: Project;

	private documentPosition:TextDocumentPositionParams;
	private documentSource:string[];

	private trigger:string;
	private triggerToken:string;
	private triggerLine:string;
	private triggerCharacterPos: number;

    constructor(connection:Connection, projectInfo:ProjectInfoProvider) {
		super(connection, projectInfo);

		connection.onSignatureHelp((textDocumentPosition: TextDocumentPositionParams): SignatureHelp => {
			if (projectInfo.getSettings().valid) {
				this.project = projectInfo.getProject(textDocumentPosition.textDocument.uri);
				this.documentPosition = textDocumentPosition;
				return this.createSignatureHelp()
			}
		});
    }
	private createSignatureHelp():SignatureHelp {

		const settings = this.getProjectInfo().getSettings();

		if (!settings.valid) return;

		this.triggerCharacterPos = this.documentPosition.position.character - 1;

		this.documentSource = this.project.getSourceLines();
		this.triggerLine = this.documentSource[this.documentPosition.position.line];

		// support functions as parameters as well so correctly find the parenthesis to the function name
		var parenthesisStart=this.triggerCharacterPos+0;
		var closedParenthesis = 0;
		while(parenthesisStart>=0) {
			if (this.triggerLine[parenthesisStart]===")") closedParenthesis++;
			if (this.triggerLine[parenthesisStart]==="(") {
				if (closedParenthesis-- === 0) break;
			}
			parenthesisStart--;
		}
		var parenthesisEnd=this.triggerCharacterPos+1;
		var openedParenthesis = 0;
		while(parenthesisEnd<this.triggerLine.length) {
			if (this.triggerLine[parenthesisEnd]==="(") openedParenthesis++;
			if (this.triggerLine[parenthesisEnd]===")") {
				if (openedParenthesis-- === 0) break;
			}
			parenthesisEnd++;
		}
		var parenthesisString = this.triggerLine.substr(parenthesisStart,parenthesisEnd-parenthesisStart+1);

		// remove math operators here instead of CleanText,
		// because + and - are possible multi labels which have to stay when GetWordAt/Before/After is used in other Providers
		// but here we definately dont want them to make sure to fetch the function name before parenthesis
		this.triggerToken = StringUtils.GetWordAt(this.triggerLine.replace(/[\+\-\*\/,]/g," "), parenthesisStart);

		let signatures: SignatureInformation[] = [];
		let activeParameter = null;
		if(parenthesisStart !== -1  && parenthesisEnd !== -1 && this.triggerToken){

			activeParameter=0;
			for(var i=0,iL=parenthesisString.length; i<iL;i++) {
				if (parenthesisString[i] === "," && this.triggerCharacterPos-parenthesisStart+1 > i) activeParameter++;
			}
			for (let symbol of this.project.getAllSymbols()) {
				if (symbol.name == this.triggerToken && symbol.parameters && (symbol.type == SymbolType.Macro || symbol.type == SymbolType.Function)) {
					signatures.push(this.createSignatureItem(symbol));
					break;
				}
			}
		}
		return {
			activeSignature: signatures.length > 0 ? 0 : null,
			activeParameter: signatures.length > 0 ? activeParameter : null,
			signatures: signatures
		}
	}

	private createTypeText(symbol: Symbol|Parameter ){
		let typeText: string = "";
		if(symbol.kind){
			typeText = ":";
			switch(symbol.kind){
				case SymbolKind.Number:
					typeText+='number';
					break;
				case SymbolKind.String:
					typeText+='string';
					break;
				case SymbolKind.File:
					typeText+='filename';
					break;
				default:
					typeText+='any';
					break;
			}
		}
		return typeText;
	}
	private createSignatureItem(symbol: Symbol): SignatureInformation {
		var parm_text = [];
		var parameters: ParameterInformation[] = [];
		var parmKindText;

		if (symbol.parameters) {
			for (var parm of symbol.parameters) {
				parmKindText = parm.name + this.createTypeText(parm);
				parm_text.push(parmKindText);
				parameters.push({
					label: parmKindText,
					documentation: parm.description || ''
				})
			}
		}

		return {
			label:symbol.name+'('+parm_text.join(', ')+')'+this.createTypeText(symbol),
			documentation: symbol.description || '',
			parameters
		}
	}
}