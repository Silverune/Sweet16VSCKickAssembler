/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import * as path from 'path';
import * as vscode from 'vscode';
import { TextLine, Range, SourceBreakpoint } from 'vscode';
import { BuildInformation, CommandBuild } from "./commands/CommandBuild"
import { CommandRun } from "./commands/CommandRun"
import { CommandDebug } from './commands/CommandDebug';
import { MemoryViewProvider } from './views/MemoryViewProvider'

import ConfigUtils from "./utils/ConfigUtils"


import { 
	workspace, 
	commands,
	window,
	ExtensionContext,
	extensions 
} from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';
import ClientUtils from './utils/ClientUtils';

let client: LanguageClient;
var autoBreakpointDetectionActive: Boolean = false;
var lastChangedDate: Date = new Date();
var memoryViewProvider: MemoryViewProvider
var extension;

export function activate(context: ExtensionContext) {

	var _outputChannel: vscode.OutputChannel;
	extension = extensions.getExtension('paulhocker.kick-assembler-vscode-ext');
	_outputChannel = window.createOutputChannel('Kick Assembler Build');

	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	let clientOptions: LanguageClientOptions = {
		documentSelector: ['kickassembler'],
		synchronize: {
			configurationSection: 'kickassembler',
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(configChanged));
	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(fileOpened)); 
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(fileChanged));	
	context.subscriptions.push(vscode.debug.onDidChangeBreakpoints(breakpointsChanged));

	// Create the language client and start the client.
	let client = new LanguageClient('kickassembler', 'Kick Assembler', serverOptions, clientOptions);

	// Start the client. This will also launch the server
	let disposable = client.start();

	// Push the disposable to the context's subscriptions so that the 
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);

	//	wait for the language server to be ready
	client.onReady().then(() => {

		//	catch notifications from the language server
		client.onNotification("ERROR", (message: string) => {
			vscode.window.showErrorMessage(message);
		});

		client.onNotification("BUILD", (message: string) => {
			vscode.window.showInformationMessage(message);
		});
		
	});

	let cmdBuild = commands.registerCommand("kickassembler.build", function () {
		commandBuild(context, _outputChannel);
	});

	let cmdBuildStartup = commands.registerCommand("kickassembler.buildstartup", function () {
		commandBuildStartup(context, _outputChannel);
	});

	let cmdBuildRun = commands.registerCommand("kickassembler.buildandrun", function () {
		commandBuildRun(context, _outputChannel);
	});

	let cmdBuildRunStartup = commands.registerCommand("kickassembler.buildandrunstartup", function () {
		commandBuildRunStartup(context, _outputChannel);
	});

	let cmdBuildDebug = commands.registerCommand("kickassembler.buildanddebug", function () {
		commandBuildDebug(context, _outputChannel);
	});

	let cmdBuildDebugStartup = commands.registerCommand("kickassembler.buildanddebugstartup", function () {
		commandBuildDebugStartup(context, _outputChannel);
	});

	context.subscriptions.push(cmdBuild);
	context.subscriptions.push(cmdBuildStartup);
	context.subscriptions.push(cmdBuildRun);
	context.subscriptions.push(cmdBuildRunStartup);
	context.subscriptions.push(cmdBuildDebug);
	context.subscriptions.push(cmdBuildDebugStartup);

	memoryViewProvider = new MemoryViewProvider(context.extensionUri);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(MemoryViewProvider.viewType, 	memoryViewProvider));

	console.log("** kick-assembler-vscode-ext ** client has started")

	validateSettings();
}

function validateSettings() {

	var _valid = true;

	if (!ConfigUtils.validateBuildSettings()) {
		_valid = false;
	}

	if (!ConfigUtils.validateRunSettings()) {
		_valid = false;
	}

	if (!ConfigUtils.validateDebugSettings()) {
		_valid = false;
	}
	
	if (_valid) {
		window.showInformationMessage(`Kick AssemblerExtension  ${extension.packageJSON.version}${extension.packageJSON.status} is Ready.`);
	} else {
		window.showWarningMessage(`Kick AssemblerExtension  ${extension.packageJSON.version}${extension.packageJSON.status} is Not Configured Properly. Check your Settings.`);
	}
}

export function deactivate(): Thenable<void> {
	if (!client) {
		return undefined;
	}
	console.log("- kickass-vscode-ext extension has been deactivated.");
	return client.stop();
}

/**
 * Build a Program From Source
 * @param context 
 * @param output 
 */
function commandBuild(context: ExtensionContext, output: vscode.OutputChannel): BuildInformation {

	if (!ConfigUtils.validateBuildSettings()) {
		vscode.window.showErrorMessage("We were unable to Build your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}
	var cb = new CommandBuild(context, output);
	var _info = cb.buildOpen()
	memoryViewProvider.viewCreate(_info.buildData);
	return _info;
}

function commandBuildStartup(context: ExtensionContext, output: vscode.OutputChannel): BuildInformation {

	if (!ConfigUtils.validateBuildSettings()) {
		vscode.window.showErrorMessage("We were unable to Build your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}
	var cb = new CommandBuild(context, output);
	var _info = cb.buildStartup()
	memoryViewProvider.viewCreate(_info.buildData);
	return _info;
}

/**
 * Build and then Run the currently Open file in the Editor.
 * @param context 
 * @param output 
 */
function commandBuildRun(context: ExtensionContext, output: vscode.OutputChannel) {

	if (!ConfigUtils.validateRunSettings()) {
		vscode.window.showErrorMessage("We were unable to Run your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}

	saveOpenDocument(function(){

		if (commandBuild(context, output).buildStatus == 0) {
			commandRun(context, output);
		}
	});
}

/**
 * Build and Run the Startup program
 * @param context 
 * @param output 
 */
function commandBuildRunStartup(context: ExtensionContext, output: vscode.OutputChannel) {
	if (!ConfigUtils.validateRunSettings()) {
		vscode.window.showErrorMessage("We were unable to Run your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}

	saveOpenDocument(function(){

		if (commandBuildStartup(context, output).buildStatus == 0) {
			commandRunStartup(context, output);
		}
	});
}

/**
 * Build and Debug the Currently Open Document
 * @param context 
 * @param output 
 */
function commandBuildDebug(context: ExtensionContext, output: vscode.OutputChannel) {

	if (!ConfigUtils.validateDebugSettings()) {
		vscode.window.showErrorMessage("We were unable to Debug your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}

	saveOpenDocument(function(){

		if (commandBuild(context, output).buildStatus == 0) {
			commandDebug(context, output);
		}
	});
}

/**
 * Build and Debug the Startup Program
 * @param context 
 * @param output 
 */
function commandBuildDebugStartup(context: ExtensionContext, output: vscode.OutputChannel) {

	if (!ConfigUtils.validateDebugSettings()) {
		vscode.window.showErrorMessage("We were unable to Debug your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}

	saveOpenDocument(function(){

		if (commandBuildStartup(context, output).buildStatus == 0) {
			commandDebugStartup(context, output);
		}
	});
}

/**
 * Run the Currently Open Program
 * @param context 
 * @param output 
 */
function commandRun(context: ExtensionContext, output: vscode.OutputChannel) {

	if (!ConfigUtils.validateRunSettings()) {
		vscode.window.showErrorMessage("We were unable to Run your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}

	var cr = new CommandRun(context, output);
	cr.runOpen();
}

/**
 * Run The Startup Program
 * @param context 
 * @param output 
 */
function commandRunStartup(context: ExtensionContext, output: vscode.OutputChannel) {

	if (!ConfigUtils.validateRunSettings()) {
		vscode.window.showErrorMessage("We were unable to Run your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}

	var cr = new CommandRun(context, output);
	cr.runStartup();
}

function commandDebug(context: ExtensionContext, output: vscode.OutputChannel) {

	if (!ConfigUtils.validateDebugSettings()) {
		vscode.window.showErrorMessage("We were unable to Debug your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}

	var cd = new CommandDebug(context, output);
	cd.runOpen();
}

function commandDebugStartup(context: ExtensionContext, output: vscode.OutputChannel) {

	if (!ConfigUtils.validateDebugSettings()) {
		vscode.window.showErrorMessage("We were unable to Debug your program because there was a problem validating your Settings. Please check your Settings and Try Again.");
		return;
	}

	var cd = new CommandDebug(context, output);
	cd.runStartup();
}

function configChanged(e:vscode.ConfigurationChangeEvent) {
	let affected = e.affectsConfiguration("kickassembler");
	ConfigUtils.validateBuildSettings();
	memoryViewProvider.viewInit();	
}

function fileChanged(e:vscode.TextDocumentChangeEvent){

	let isSameChangeLine = e.contentChanges[0].range.start.line === e.contentChanges[0].range.end.line;
	let rangeToCheck = isSameChangeLine && !e.contentChanges[0].text.includes("\n") ? e.contentChanges[0].range.start.line : undefined;
	lastChangedDate = new Date();
	fileOpened(e.document,rangeToCheck);
}

/**
 * Save the currently open document if available. * 
 */
function saveOpenDocument(callback?:Function) {

	// only when open active document is available

	if (window && window.activeTextEditor && window.activeTextEditor.document) {
		// save the active document and return
		window.activeTextEditor.document.save().then(function (reponse) {
			if(callback) callback();
		});
	} else if(callback) callback();
}

function fileOpened(text:vscode.TextDocument, checkLineNumber?:number) {
	autoBreakpointDetectionActive = true;
	var line:TextLine;
	var breakExpressionInfo:RegExpMatchArray;

	// Remove all existing breakpoints
	if(!checkLineNumber){
		let bpexists = vscode.debug.breakpoints.filter((bp:SourceBreakpoint) => {
			return bp.location.uri.path == text.uri.path;
		});
		if(bpexists.length > 0){
			vscode.debug.removeBreakpoints(bpexists);
		}
	}

	//find all existing breakpoints and create them in vscode	

	let newBreakpoints: vscode.Breakpoint[] = [];

	for(var i=(checkLineNumber || 0),iL=(checkLineNumber ? checkLineNumber+1 : text.lineCount);i<iL;i++){
		line = text.lineAt(i);
		let checkLine = line.text.trim();
		let existingBreak = checkLine.match(/^(\/\/\s*)*\.break/);
		let existingPrint = checkLine.match(/^(\/\/\s*)*\.print(\s+[\(\"]*|\s*[\(\"]+)[\w")]+/);		
		let existingPrintNow = checkLine.match(/^(\/\/\s*)*\.printnow(\s+[\(\"]*|\s*[\(\"]+)[\w")]+/);
		if(existingBreak || existingPrint || existingPrintNow) {
			breakExpressionInfo = existingBreak ? checkLine.substr(existingBreak[0].length).trim().match(/".*"/) : undefined;
			newBreakpoints.push(new vscode.SourceBreakpoint(
				new vscode.Location(text.uri, new vscode.Position(i, 0)),
				checkLine.substr(0,2) != "//",
				breakExpressionInfo ? breakExpressionInfo[0] : '',
				'',
				existingPrint ? checkLine.substr(checkLine.indexOf(".print")+6).trim() :
				existingPrintNow ? checkLine.substr(checkLine.indexOf(".printnow")+9).trim() : ''
			));
		}
		// remove a possible existing breakpoint
		let bpexists = vscode.debug.breakpoints.filter((bp:SourceBreakpoint) => {
			return bp.location.uri.path == text.uri.path && bp.location.range.start.line === i;
		});
		if(bpexists.length > 0){
			vscode.debug.removeBreakpoints(bpexists);
		}
	}
	if(newBreakpoints.length>0) {
		vscode.debug.addBreakpoints(newBreakpoints);
	}
	autoBreakpointDetectionActive = false;
}

function breakpointsChanged(breakpointChanges:vscode.BreakpointsChangeEvent){
	let editor = vscode.window.activeTextEditor;
	if (editor) {

		let document = editor.document;
// Don't add/remove anything if it wasn't triggered by native context menu
		if(!autoBreakpointDetectionActive){

			breakpointChanges.added.forEach((bp:vscode.SourceBreakpoint) => {
				if(bp.location.uri.path == document.uri.path) {
					let bpLine = document.lineAt(bp.location.range.start.line);
					if(bpLine && !bpLine.text.trim().match(/^(\/\/\s*)*\.(break|print)/)) {
						editor.edit(editBuilder => {
							editBuilder.insert(
								bp.location.range.start,
								(bp.enabled===false ? "// ":"")+(bp.logMessage ? ".print "+bp.logMessage : ".break"+(bp.condition ? ' "'+bp.condition+'"':""))+"\n"
							);
						});
					}
				}
			});
			breakpointChanges.removed.forEach((bp:vscode.SourceBreakpoint) => {
				if(bp.location.uri.path == document.uri.path) {
					let bpLine = document.lineAt(bp.location.range.start.line);
					if(bpLine && bpLine.text.trim().match(/^(\/\/\s*)*\.(break|print)/)){
						let conditionString = bpLine.text.trim().replace(/^(\/\/\s*)*\.(break|printnow|print)\s*/,'');
						// only remove if the current line matches EXACTLY the remove object (otherwise it's an old trigger when typing quickly and should be ignored!)
						// also make sure it wasn't triggered internally by vscode because of quick key repetition (so basically only the contextmenu remove will match here)
						if ((conditionString == bp.condition || conditionString == bp.logMessage) && (new Date()).getTime() - lastChangedDate.getTime() > 500){
							editor.edit(editBuilder => {
								editBuilder.delete(
									new Range(bp.location.range.start.line,0,bp.location.range.start.line+1,0)
								);
							});
						}
					}
				}
			});
		}
// changes always happen automatically by vscode when inserting from clipboard or new lines/del lines happen
// But only single bp changes are triggered via contextmenu
		if(breakpointChanges.changed.length === 1){
			breakpointChanges.changed.forEach((bp:vscode.SourceBreakpoint) => {
				if(bp.location.uri.path == document.uri.path) {
					let bpLine = document.lineAt(bp.location.range.start.line);
					if(bpLine && bpLine.text.trim().match(/^(\/\/\s*)*\.(break|print)/)){
						let spaceRepeat = Math.max(bpLine.text.trim().replace(/^(\/\/\s*)*\.(break|printnow|print)/,'').search(/[^\s]/),1);
						editor.edit(editBuilder => {
							editBuilder.replace(
								new Range(bp.location.range.start.line,0,bp.location.range.start.line,bpLine.text.length+2),
								(bp.enabled===false ? "//" : "") + " ".repeat(bpLine.text.replace(/^\/\//,'').search(/\S/)) + (bp.logMessage ? (bpLine.text.match(/\.printnow/) ? ".printnow" : ".print") + " ".repeat(spaceRepeat) + bp.logMessage : ".break" + (bp.condition ? " ".repeat(spaceRepeat) + '"' + bp.condition.replace(/^"(.*)"$/, '$1') +'"' : ''))
							);
						});
					}
				}
			});
		}
	}
}
