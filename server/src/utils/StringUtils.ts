/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import {Symbol} from "../project/Project";
import NumberUtils from "./NumberUtils";

export default class StringUtils {

	public static splitIntoTokens(text:string):string[] {
		return text.match(/\S+/g) || [];
	}

	public static splitIntoLines(text:string):string[] {
		return text.split(/\r?\n/g);
    }

	public static splitFunction(text:string, isPseudo:Boolean=false):string[] {

		let vals:string[] = [];
		var pos;
		var parm_text;

		//	remove code after comments
		pos = text.indexOf("//");
		if (pos > 0) {
			text = text.substring(0, pos);
		}

		//	remove code after open paren "{"
		pos = text.indexOf("{");
		if (pos > 0) {
			text = text.substring(0, pos);
		}

		//	get parameters
		pos = isPseudo ? text.search(/\w+\s*:/) : text.indexOf("(");
		if (pos > 0) {
			parm_text = text.substring(pos);
			text = text.substring(0, pos);
		}

		//	split by blanks to get type and name of function
		let v1 = this.splitIntoTokens(text);

		if(v1.length > 0) vals.push(v1[0]);
		if(v1.length > 1) vals.push(v1[1]);
		if(isPseudo && !parm_text && v1.length > 2) parm_text = v1[2];
		
		//	split parms by comma

		if (parm_text) {
		//	remove parenthesis
			parm_text = parm_text.replace(/[() ]/g, "");

			let parms = parm_text.split(isPseudo ? ":" : ",");
			for (var parm of parms) {
				if(parm!=="") vals.push(parm);
			}
		}

		return vals;
	}

	public static splitPseudoCommand(text:string):string[]|undefined {

		let vals:string[] = [];
		var _work:string = text;

		//	remove code portion after {
		if (_work.indexOf("{") > 0 ) {
			_work = _work.substr(0,_work.indexOf("{"));
		}


		//	split by blanks to get function name and parms
		let _array = this.splitIntoTokens(_work);

		//	first value is name
		vals.push(_array[1].trim());

		for (var i = 2; i < _array.length; i++) {
			var _next = _array[i];
			_next = _next.replace(/[: ]/g, "");
			if (_next.length > 0) {
				vals.push(_next);
			}
		}
		
		return vals;
	}

	public static joinStringArray(text:string[]):string {
		return text.join("\n");
	}

	public static removeCRLF(text:string):string {
		return text.replace(/(\r\n|\n|\r)/gm,"");
	}

	/**
	 * Returns a Word at a given position in a line.
	 * 
	 * @param text 
	 * @param position 
	 */
	public static GetWordAt(text:string, position:number, cleanText:boolean=true):string {

		if(cleanText){
			text = this.CleanText(text);
		}

		// make pos point to a character of the word
		while (text[position] == " ") position--;
		// find the space before that word
		// (add 1 to be at the beginning of that word)
		// (note that it works even if there is no space before that word)
		position = text.lastIndexOf(" ", position) + 1;
		// find the end of the word
		var end = text.indexOf(" ", position);
		if (end == -1) end = text.length; // set to length if it was the last word
		// return the result
		return text.substring(position, end);
	  }

	/**
	 * Returns the Words Before a position on a line.
	 * 
	 * For example:
	 * 
	 * 		var str = The Quick Brown Fox
	 * 
	 * 		var words = GetWordsBefore(str, 11)
	 * 
	 * 		words = ['The', 'Quick']
	 * 
	 * @param text 
	 * @param position 
	 */
	public static GetWordsBefore(text:string, position:number):string[] | undefined {

		text = this.CleanText(text);

		var index = text.lastIndexOf(" ", position);

		if (index < 0) return undefined;

		var workText = text.substring(0,index).trim();
		return workText!="" ? this.splitIntoTokens(workText) : undefined;
	}

	/**
	 * Returns the Words After a position on a line.
	 * 
	 * For example:
	 * 
	 * 		var str = The Quick Brown Fox
	 * 
	 * 		var words = GetWordsBefore(str, 5)
	 * 
	 * 		words = ['Brown', 'Fox']
	 * 
	 * @param text 
	 * @param position 
	 */
	public static GetWordsAfter(text:string, position:number):string[] | undefined {

		text = this.CleanText(text);

		var index = text.indexOf(" ", position);
		
		if (index < 0) return undefined;

		var workText = text.substring(index).trim();
		return workText!="" ? this.splitIntoTokens(workText) : undefined;
	}

	public static CleanText(text:string):string {

		// comment out to test the new way
		//return text;
		
		text = text.replace(/\(/g, " ");
		text = text.replace(/\)/g, " ");
		text = text.replace(/\\/g, " ");
		text = text.replace(/\;/g, " ");
		text = text.replace(/\:/g, " ");
		text = text.replace(/\[/g, " ");
		text = text.replace(/\]/g, " ");
		text = text.replace(/\@/g, " ");
		text = text.replace(/\=/g, " ");
		return text ;
	}

	/**
	 * Build a String that represents the Parameters in a Function or Macro.
	 * 
	 * @param symbol the Symbol containing the Parameters
	 */
	public static BuildSymbolParameterString(symbol: Symbol, delimiter: string = ","): string {

		var parm_text = [];

		if (symbol.parameters) {
			for (var parm2 of symbol.parameters) {
				parm_text.push(parm2.name);
			}
		}

		return parm_text.join(delimiter);

	}

	/**
	 * Build a Formatted Value from a Symbol
	 * 
	 * @param full set true if you also want to include the octal value
	 */
	public static BuildSymbolFormattedValue(symbol: Symbol, full: boolean = false): string {

		if (isNaN(symbol.value) || !Number.isInteger(symbol.value))
			return '';

		return this.BuildFormattedValue(symbol.value, full);
	}

	/**
	 * Build a Formatted Value from a String Token
	 * 
	 * @param token 
	 * @param full 
	 */
	public static BuildTokenFormattedValue(token: string, full: boolean = false): string {

		var _number = NumberUtils.toDecimal(token);

			if (isNaN(_number) || !Number.isInteger(_number))
				return '';

			return this.BuildFormattedValue(_number, full);
		}

	/**
	 * Build a Formatted Value from a Number
	 * 
	 * @param value 
	 * @param full 
	 */
	public static BuildFormattedValue(value: number, full: boolean = false): string {

		if (!full)
			return '\n' +
			`\n* Dec: \`${value.toString(10)}\`` +
			`\n* Bin: \`\%${value.toString(2)}\`` +
			`\n* Hex: \`\$${value.toString(16)}\``;


		return '\n' +
		`\n* Dec: \`${value.toString(10)}\`` +
		`\n* Bin: \`\%${value.toString(2)}\`` +
		`\n* Oct: \`${value.toString(8)}\`` +
		`\n* Hex: \`\$${value.toString(16)}\``;
	}

}