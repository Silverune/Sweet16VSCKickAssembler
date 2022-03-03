/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { SymbolKind } from "vscode-languageserver";

export interface Parameter {
	name: string;
	kind: SymbolKind;
	values?: string[];
	description?: string;
	optional?: boolean;
}

export interface PreProcessor {
	name: string;
	description: string;
	example: string;
	parameters?: Parameter[];
	snippet?: string;
}

export const PreProcessors:PreProcessor[] = [
	{
		name: "#define",
		description: "Defines a preprocessor symbol.",
		example: "\#define DEBUG",
		parameters : [
			{
				name: "symbol",
				kind: SymbolKind.String
			}
		],
		snippet: ' ${1:symbol}\n'
	},
	{
		name: "#elif",
		description: "The combination of an \#else\ and an \#if\ preprocessor directive.",
		example: "",
		parameters : [
			{
				name: "symbol",
				kind: SymbolKind.Constant
			}
		],
		snippet: ' $0\n'
	},
	{
		name: "#else",
		description: "Used after an \#if\ to start an else block which is executed if the condition is false.",
		example: "",
		snippet: '\n'
	},
	{
		name: "#endif",
		description: "Marks the end of an #if/#else block.",
		example: "",
		snippet: '\n'
	},
	{
		name: "#if",
		description: "Discards the sourcecode after the \#if\-directive if the condition is false.",
		example: "",
		parameters : [
			{
				name: "symbol",
				kind: SymbolKind.Constant
			}
		],
		snippet: ' '
	},
	{
		name: "#import",
		description: "Imports another sourcefile.",
		example: "",
		parameters : [
			{
				name: "name",
				kind: SymbolKind.File
			}
		],
		snippet: ' "$1"\n'
	},
	{
		name: "#importif",
		description: "Imports another sourcefile if the given expression is evaluated to true.",
		example: "",
		parameters : [
			{
				name: "symbol",
				kind: SymbolKind.Constant
			},
			{
				name: "filename",
				kind: SymbolKind.File
			}
		],
		snippet: ' $1 "$2"\n'
	},
	{
		name: "#importonce",
		description: "Make the assembler skip the current file if it has already been imported.",
		example: "",
		snippet: '\n'
	},
	{
		name: "#undef",
		description: "Removes the definition of a preprocessor symbol.",
		example: "",
		parameters : [
			{
				name: "symbol",
				kind: SymbolKind.Constant
			}
		],
		snippet: ' $0\n'
	}
];