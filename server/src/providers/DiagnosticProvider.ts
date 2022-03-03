/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { Provider, ProjectInfoProvider } from "./Provider";
import { AssemblerResults } from "../assembler/Assembler";
import {
    Connection,
	Diagnostic,
	DiagnosticSeverity,
} from "vscode-languageserver";


export default class DiagnosticProvider extends Provider {

    constructor(connection:Connection, projectInfo:ProjectInfoProvider) {
        super(connection, projectInfo);
    }

    /**
     * Does Something
     * @param uri 
     */
    public process(uri:string):void {

		//	for return
		const diagnostics:Diagnostic[] = [];
		
		//	grab the assembler results from the last change
		const results:AssemblerResults = this.getProjectInfo().getProject(uri).getAssemblerResults();
		
		//	create diagnostic for each error on the last compile
		if (results.status > 0) {

			//	only send back diagnostics for the
			//	file that is being worked on
			var fileNumber = -1;

			for (let file of results.assemblerInfo.getAssemblerFiles()) {
				if (file.isCurrent) {
					fileNumber = file.index;
					break;
				} 
			}			

			if (results.assemblerInfo.getAssemblerErrors().length > 0) {
				results.assemblerInfo.getAssemblerErrors().forEach((error) => {
					if (error.range.fileIndex == fileNumber) {
						diagnostics.push( {
							severity: DiagnosticSeverity.Error,
							range: {
								start: { line: error.range.startLine, character: error.range.startPosition },
								end: { line: error.range.endLine, character: error.range.endPosition},
							},
							message: error.message,
							source: "kickassembler",
						});
					}
				});
			}
		}

        //	return the diagnostic information
		this.getConnection().sendDiagnostics({ uri, diagnostics });
	}

}