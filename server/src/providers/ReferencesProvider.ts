/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { Provider, ProjectInfoProvider } from "./Provider";
import StringUtils from "../utils/StringUtils";

import {
	Connection,
	Location,
	ReferenceParams
} from "vscode-languageserver";
import { SymbolType } from '../project/Project';

export default class ReferencesProvider extends Provider {

    constructor(connection:Connection, projectInfo:ProjectInfoProvider) {
		super(connection, projectInfo);

		connection.onReferences((reference: ReferenceParams): Location[] => {
			if (projectInfo.getSettings().valid) {
				var project = projectInfo.getProject(reference.textDocument.uri);
				var lines = project.getSourceLines();
				var triggerLine = lines[reference.position.line];

				var locations: Location[] = [];

				var triggerCharacterPos = reference.position.character - 1;
				var token = StringUtils.GetWordAt(triggerLine.replace(/[\.\+\-\*\/,<>]/g," "), triggerCharacterPos).trim();
				for(var symbol of project.getSymbols()) {

					if(symbol.name === token && symbol.type === SymbolType.Reference){
						locations.push(<Location> {
							uri: symbol.isMain ? project.getUri() : project.getSourceFiles()[symbol.fileIndex].getUri(),
							range: symbol.range
						});
					}
				}
				return locations;
			}
		});
	}
}