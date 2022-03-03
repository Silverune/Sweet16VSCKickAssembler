/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { Uri, WorkspaceFolder, WorkspaceConfiguration, window, workspace, TextDocument, TextEditor } from 'vscode';
import * as path from "path";

export default class ClientUtils {

    /**
     * Return a Valid Uri for an Assembled Program
     * 
     * This helper method will create the valid
     * Uri for the program file that will be
     * assembled by KickAssembler.
     * 
     * 
     * Example 1:
     * 
     * With an Output setting of 
     * 
     *      "" (blank) 
     * 
     * and a source filename of 
     * 
     *      /home/user/workspace/coolgame.asm
     * 
     * this method will return
     * 
     *      /home/user/workspace/coolgame.prg
     * 
     * 
     * Example 2:
     * 
     * with an output of 
     * 
     *      "output"
     * 
     * and a source filename of
     * 
     *      /home/user/workspace/coolgame.asm
     * 
     * this method will return
     * 
     *      /home/user/workspace/output/coolgame.prg
     * 
     * 
     * Example 3:
     * 
     * with an output of
     * 
     *      "/home/user/build"
     * 
     * and a source filename of 
     * 
     *      /home/user/workspace/coolgame.asm
     * 
     * this method will return
     * 
     *      /home/user/build/coolgame.prg
     * 
     * 
     * Example 4:
     * 
     * with an output of
     * 
     *      "build"
     * 
     * and a source filename of 
     * 
     *      /home/user/workspace/module/coolmodule.asm
     * 
     * this method will return
     * 
     *      /home/user/workspace/build/coolgame.prg
     * 
     */
    public static GetWorkspaceProgramFilename():string {

        // get the output path
        var outputPath:string = this.GetOutputPath();
        var sourceFile: string = this.GetOpenDocumentUri().fsPath;

        // get the final program filename
        var prg = this.CreateProgramFilename(path.basename(sourceFile));

        // build the filename
        var outputFile:string = outputPath + path.sep + prg;

        return outputFile;
    }

    public static CreateProgramFilename(filename:string): string | undefined {

        // simply replace the extension of the current file with `.prg`

        let _ext = filename.substr(filename.lastIndexOf('.'))
        filename = filename.replace(_ext, ".prg");

        return filename;

    }

    /**
     * Return an Path for Output
     * 
     * This method will return a valid string
     * path for the output specified on the
     * extension setting
     * 
     *      kickassembler.output
     * 
     * To do this we basically get the root folder
     * of the Workspace and either add the output 
     * folder to it, or if it is an absolute path
     * make that the output folder.
     * 
     * Example 1:
     *  
     *  with an output setting of
     * 
     *      "output"
     * 
     *  and a workspace value of
     * 
     *      /home/user/workspace
     * 
     *  the returning value will be
     * 
     *      /home/user/workspace/output
     * 
     * Example 2:
     *  
     *  with an output setting of
     * 
     *      "/output"
     * 
     *  and a workspace value of
     * 
     *      /home/user/workspace
     * 
     *  the returning value will be
     * 
     *      /output
     * 
     * Example 3:
     *  
     *  with an output setting of
     * 
     *      "./output"
     * 
     *  and a workspace value of
     * 
     *      /home/user/workspace
     * 
     *  the returning value will be
     * 
     *      /home/user/workspace/output
     * 
     */
	public static GetOutputPath():string {

        var rootFolder:string = this.GetWorkspaceFolder().uri.fsPath;
        var outputDirectory:string = this.GetSettings().get("outputDirectory");
        var outputParse = path.parse(outputDirectory);
        var outputPath:string;

        /*
            the default is to use the root workspace folder
        */
        outputPath = rootFolder;

        /*
            when there is something populated in the 
            output directory
        */
        if (outputDirectory.length > 0) {
            outputPath = path.join(rootFolder, outputDirectory);
        }

        /*
            when the output path starts with a hard "/"
        */
        if (outputParse.root.length > 0) {
            outputPath = outputDirectory;
        }

        outputPath = path.normalize(outputPath);

        var fs = require('fs');
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }

        return outputPath;
    }

    /**
     * Return the Active Text Editor Uri
     * 
     * This method is a simple helper method
     * to retrieve the currently open 
     * editor file in the Workspace.
     * 
     */
    public static GetSourceUri():Uri {
        return window.activeTextEditor.document.uri;
    }

    /**
     * Returns the Active Open Document
     */
    public static GetOpenDocumentUri():Uri | undefined {


        var document:TextDocument;

        /*
            first try the active window text editor

            if it has a valid viewColumn (! undefined) then
            we can pretty safely assume it is one of the
            open source code windows
        */

        let activeEditor = window.activeTextEditor;

        // get the document and return it to the caller
        if (activeEditor != undefined) {
            if (activeEditor.viewColumn)
                document = activeEditor.document;
        }

        let textEditors = window.visibleTextEditors;

        if (textEditors.length < 0) {
            document = undefined;
        }

        if (!document) {
            for (var i = 0; i < textEditors.length; i++ ) {
                var editor:TextEditor = textEditors[i];
                if (editor.viewColumn == 1) {
                    document = editor.document;
                    // return document;
                }
            }
        }

        var uri;

        if (document) {

            uri = Uri.parse(document.fileName);

            // if (buildStartup) {
            //     let filename:string = document.fileName;
            //     let dir:string = path.dirname(filename);
            //     uri = Uri.parse(dir + path.sep + buildStartup);
            // }
        }

        return uri;

    }

    public static GetStartupUri():Uri | undefined {

        // get the build master

        let buildStartup:string = this.GetSettings().get("startup");

        var uri: Uri;

        if (buildStartup) {
            let filename = path.join(this.GetWorkspaceFolder().uri.fsPath, buildStartup);
            uri = Uri.parse(filename);
        }

        return uri;
    }

    /**
     * Return The Extension Settings
     * 
     * A simple helper method to return
     * the settings for this extension
     * 
     *      kickassembler
     */
    public static GetSettings():WorkspaceConfiguration {
		return workspace.getConfiguration("kickassembler");
    }

    /**
     * Return the Workspace Folder
     * 
     * Note: For now we are just returning the root folder. This will
     * need to be updated at some point to support multiple workspace
     * folders.
     * 
     */
    public static GetWorkspaceFolder():WorkspaceFolder {
        return workspace.workspaceFolders[0];
    }
}
