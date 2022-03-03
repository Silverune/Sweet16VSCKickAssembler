/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import {
	createConnection, 
	IConnection, 
	ProposedFeatures,
} from "vscode-languageserver";

import ProjectManager from "./project/ProjectManager";

const connection:IConnection = createConnection(ProposedFeatures.all);
const projectManager = new ProjectManager(connection);

projectManager.start();
