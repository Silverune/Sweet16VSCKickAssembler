/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

export default class NumberUtils {

	public static asDecimal(value:number):string {
		return value.toString(10);
	}

	public static asBinary(value:number):string {
		return "%" + value.toString(2);
	}

	public static asOctal(value:number):string {
		return "0" + value.toString(8);
	}

	public static asHexa(value:number):string {
		return "$" + value.toString(16);
	}

	/**
	 * Takes a String and Tries to convert it
	 * to a Decimal value.
	 * 
	 * @param value the String to Convert
	 */
	public static toDecimal(value:string):number {
		var isImmediate = value.substr(0, 1) == "#";
		var numberPosition = isImmediate ? 1 : 0;		
		var isLowByte = value.substr(numberPosition, 1) == "<";
		var isHighByte = value.substr(numberPosition, 1) == ">";
		if (isLowByte || isHighByte) {
			numberPosition++;
		}
		var numberSystem = value.substr(numberPosition, 1);
		var numberBase = 10;
		if (numberSystem == "$") {
			numberBase = 16;
			numberPosition++;
		}
		if (numberSystem == "0" && value !== "0") {
			numberBase = 8;
			numberPosition++;
		}	
		if (numberSystem == "%") {
			numberBase = 2;
			numberPosition++;
		}					

		var num = parseInt(value.substr(numberPosition), numberBase);
		if (!isNaN(num)) {
			if(isLowByte) {
				num = num % 256;
			}
			if(isHighByte) {
				num = num >> 8;
			}  
			return num;
		}
		return undefined;
	}

}