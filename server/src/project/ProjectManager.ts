/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import SettingsProvider, { Settings } from "../providers/SettingsProvider";
import HoverProvider from "../providers/HoverProvider";
import Project from "./Project";
import { ProjectInfoProvider } from "../providers/Provider";
import DiagnosticProvider from "../providers/DiagnosticProvider";
import { readFileSync } from "fs";
import PathUtils from "../utils/PathUtils";
import { createHash } from "crypto";
import DocumentSymbolProvider from "../providers/DocumentSymbolProvider";
import CompletionProvider from "../providers/CompletionProvider";
import SignatureHelpProvider from "../providers/SignatureHelpProvider";
import ReferencesProvider from "../providers/ReferencesProvider";
import DefinitionProvider from "../providers/DefinitionProvider";
import { TextDocument } from "vscode-languageserver-textdocument";

import {
    InitializeResult,
    TextDocuments,
    InitializeParams,
    InitializedParams,
    DidChangeTextDocumentParams,
    DidOpenTextDocumentParams,
    DidSaveTextDocumentParams,
    Connection,
    DidCloseTextDocumentParams,
    TextDocumentSyncKind
} from "vscode-languageserver";

/*
    Class: ProjectManager

    Manage a Project

    Remarks:

        The Manager is responsible for
        the handling of providers that are
        available on the Client.

*/

export default class ProjectManager {

    private settingsProvider: SettingsProvider;
    private hoverProvider: HoverProvider;
    private diagnosticProvider: DiagnosticProvider;
    private documentSymbolProvider: DocumentSymbolProvider;
    private completionProvider: CompletionProvider;
    private signatureHelpProvider: SignatureHelpProvider;
    private referencesProvider: ReferencesProvider;
    private definitionProvider: DefinitionProvider;

    private projects: Project[];
    private connection: Connection;
    private documents: TextDocuments<TextDocument>;
    private timer: NodeJS.Timer;

    constructor(connection: Connection) {

        // connection.console.info("[ProjectManager]");

        this.projects = [];
        this.connection = connection;

        //  setup project information provider
        const projectInfoProvider: ProjectInfoProvider = {
            getProject: this.getProject.bind(this),
            getSettings: this.getSettings.bind(this)
        };

        this.settingsProvider = new SettingsProvider(connection, projectInfoProvider);
        this.hoverProvider = new HoverProvider(connection, projectInfoProvider);
        this.diagnosticProvider = new DiagnosticProvider(connection, projectInfoProvider);
        this.documentSymbolProvider = new DocumentSymbolProvider(connection, projectInfoProvider);
        this.completionProvider = new CompletionProvider(connection, projectInfoProvider);
        this.signatureHelpProvider = new SignatureHelpProvider(connection, projectInfoProvider);
        this.referencesProvider = new ReferencesProvider(connection, projectInfoProvider);        
        this.definitionProvider = new DefinitionProvider(connection, projectInfoProvider);

        connection.onInitialize((params: InitializeParams): InitializeResult => {
            // this.connection.console.info("[ProjectManager] onInitialize");
            return {
                capabilities: {
                    textDocumentSync: TextDocumentSyncKind.Full,
                    hoverProvider: true,
                    documentSymbolProvider: true,
                    referencesProvider : true,
                    definitionProvider : true,
                    signatureHelpProvider: {
                        triggerCharacters: ["(",","]
                    },
                    completionProvider: {
                        resolveProvider: true,
                        triggerCharacters: ["#", ".", "<", ">", ",", "*", '"', "(", "!"],
                    }
                }
            };
        });

        connection.onInitialized((params: InitializedParams) => {
            // this.connection.console.info("[ProjectManager] onInitialized");
            // connection.console.info("- params : " + params.toString());
        });

        connection.onDidOpenTextDocument((open: DidOpenTextDocumentParams) => {

            // this.connection.console.info("[ProjectManager] onDidOpenTextDocument");

            var project = new Project(open.textDocument.uri);
            project.connection = this.connection;
            this.projects.push(project);
            if (this.settingsProvider.getSettings().valid) {
                project.assemble(this.settingsProvider.getSettings(), open.textDocument.text);
                this.diagnosticProvider.process(open.textDocument.uri);
            }
        });

        connection.onDidChangeTextDocument((change: DidChangeTextDocumentParams) => {

            // this.connection.console.info("[ProjectManager] onDidChangeTextDocument");

            var kickAssSettings = this.settingsProvider.getSettings();
            
            var project = this.findProject(change.textDocument.uri);
            var source = change.contentChanges[0].text;
        
            project.setSource(source); // always update the source

            if (kickAssSettings.valid && kickAssSettings.autoAssembleTrigger.indexOf('onChange') !== -1) {

                if (this.timer) { 
                    clearTimeout(this.timer); 
                }

                this.timer = setTimeout(() => {
                    project.assemble(kickAssSettings, source);
                    this.diagnosticProvider.process(change.textDocument.uri);
                },
                
                kickAssSettings.autoAssembleTriggerDelay);
            }
6        });

        connection.onDidSaveTextDocument((change: DidSaveTextDocumentParams) => {

            // this.connection.console.info("[ProjectManager] onDidSaveTextDocument");

            var project = this.findProject(change.textDocument.uri);
            var file = readFileSync(PathUtils.uriToPlatformPath(change.textDocument.uri), 'utf8');

            if (this.settingsProvider.getSettings().valid) {
                project.assemble(this.settingsProvider.getSettings(), file);
                this.diagnosticProvider.process(change.textDocument.uri);
            }

            if (this.timer) {
                clearTimeout(this.timer);
            }
        });

        connection.onDidCloseTextDocument((close: DidCloseTextDocumentParams) => {
            // this.connection.console.info("[ProjectManager] onDidCloseTextDocument");
            this.removeProject(close.textDocument.uri);
            if (this.timer) {
                clearTimeout(this.timer);
            }
        });
    }

    private findProject(uri: string): Project | undefined {
        // this.connection.console.info("[ProjectManager] findProject");
        var hash = createHash('md5').update(uri).digest('hex');
        for (var project of this.projects) {
            if (hash == project.getId()) {
                return project;
            }
        }
    }

    private removeProject(uri: string) {
        // this.connection.console.info("[ProjectManager] removeProject");
        var pos = 0;
        var hash = createHash('md5').update(uri).digest('hex');
        for (var project of this.projects) {
            if (hash == project.getId()) {
                this.projects.splice(pos, 1);
            }
            pos += 1;
        }
    }

    public start() {
        // this.connection.console.info("[ProjectManager] start");
        this.connection.listen();
        // this.connection.console.info('- project manager is ready')
    }

    public getSettings(): Settings {
        // this.connection.console.info("[ProjectManager] getSettings");
        return this.settingsProvider.getSettings();
    }

    public getHoverProvider(): HoverProvider {
        // this.connection.console.info("[ProjectManager] getHoverProvider");
        return this.hoverProvider;
    }

    public getProject(uri: string): Project {
        // this.connection.console.info("[ProjectManager] getProject");
        return this.findProject(uri);
    }

    public getCompletionProvider(): CompletionProvider {
        // this.connection.console.info("[ProjectManager] getCompletionProvider");
        return this.completionProvider;
    }

}