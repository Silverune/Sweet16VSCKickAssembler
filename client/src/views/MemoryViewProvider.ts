/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import * as vscode from 'vscode';
import ClientUtils from '../utils/ClientUtils';

/*

	Class: MemoryViewProvider

	Provides a View that tries to identify the
	areas in RAM that an assembled program
	will use in the C64.

*/
export class MemoryViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'kickassembler.memoryViewer';

	private _view?: vscode.WebviewView;

	private testColor: vscode.ThemeColor;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {

			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {

			switch (data.type) {

				case 'dummy': {
					break;
				}
			}
		});
	}

	public viewCreate(output) {

		var _settings = ClientUtils.GetSettings();

		var data = Object.create( {} );

		data.output = output;
		data.size = _settings.get("memoryViewerSize");
		data.showRoms = _settings.get("memoryViewerShowRoms");

		if (this._view) {
			this._view.webview.postMessage({ type: 'view_create', data: data });
		}
	}

	/*
		Refresh View Using KickAssembler Output
	*/
	public viewRefresh() {

		if (this._view) {
			this._view.webview.postMessage({ type: 'view_refresh' });
		}
	}

	public viewInit() {

		var _settings = ClientUtils.GetSettings();

		var data = Object.create( {} );

		data.size = _settings.get("memoryViewerSize");
		data.showRoms = _settings.get("memoryViewerShowRoms");


		if (this._view) {
			this._view.webview.postMessage({ type: 'view_init', data: data });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		const jQueryJs = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'client/media', 'jquery-3.6.0.min.js'));

		const createJs = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'client/media', 'createjs.js'));

		const zimJs = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'client/media', 'zim.js'));

		const memoryViewJs = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'client/media', 'memoryViewProvider.js'));

		const memoryViewCss = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'client/media', 'memoryViewProvider.css'));

		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<title>Kick Assembler Memory Viewer</title>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->

				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${memoryViewCss}" rel="stylesheet">

			</head>
			<body>
				<div id="test"/>
				<script nonce="${nonce}"></script>
				<script type="text/javascript" nonce="${nonce}" src="${jQueryJs}"></script>
				<script type="text/javascript" nonce="${nonce}" src="${createJs}"></script>
				<script type="text/javascript" nonce="${nonce}" src="${zimJs}"></script>
				<script type="text/javascript" nonce="${nonce}" src="${memoryViewJs}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {

	let _nonce = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < 32; i++) {
		_nonce += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return _nonce;
}
