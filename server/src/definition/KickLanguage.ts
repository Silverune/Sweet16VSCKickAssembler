/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { Instructions, Instruction } from "./KickInstructions";
import { Directives, Directive, Star } from "./KickDirectives";
import { Extensions } from "./KickExtensions";
import { PreProcessors, PreProcessor } from "./KickPreprocessors";

export interface KickLanguageDefinition {
    Instructions: Instruction[];
    Directives: Directive[];
	Extensions: {[key: string]:string[]};
    PreProcessors: PreProcessor[];
    Star: Directive;
}

export const KickLanguage:KickLanguageDefinition = {
    Instructions,
    Directives,
    Extensions,
    PreProcessors,
    Star
};