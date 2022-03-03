/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { Connection } from "vscode-languageserver";
import { Settings } from "./SettingsProvider";
import Project from "../project/Project";

export interface ProjectInfoProvider {
    getProject:(uri:string) => Project;
    getSettings:() => Settings;
}
export class Provider {

        private connection:Connection;
        private projectInfo:ProjectInfoProvider;

        constructor(connection:Connection, projectInfo:ProjectInfoProvider) {
            this.connection = connection;
            this.projectInfo = projectInfo;
        }

        public getConnection():Connection {
            return this.connection;
        }

        public getProjectInfo():ProjectInfoProvider {
            return this.projectInfo;
        }
}