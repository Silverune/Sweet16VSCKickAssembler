/*
	Copyright (C) 2018-2021 Paul Hocker. All rights reserved.
	Licensed under the MIT License. (See LICENSE.md in the project root for license information)
*/

import { Parameter } from "./KickPreprocessors";
import { SymbolKind } from "vscode-languageserver";
import { SymbolType } from "../project/Project";

export enum InstructionType {
    Legal,
    Illegal,
	DTV,
	C02,
	CE02,
	GS02
}
export interface Instruction {
	name: string;
	description: string;
	group: string;
	parameters?: Parameter[];
	type?: InstructionType;
	snippet?: string;
}

export const Instructions:Instruction[] = [
	{
		name: "ADC",
		description: "ADd to accumulator with Carry",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "AND",
		description: "AND memory with accumulator",
		group: "Logical",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "ASL",
		description: "Accumulator Shift Left",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "BCC",
		description: "Branch on Carry Clear (C = 0)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BCS",
		description: "Branch on Carry Set (C = 1)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BEQ",
		description: "Branch on EQual to zero (Z = 1)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BIT",
		description: "test BITs",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BMI",
		description: "Branch on MInus (N = 1)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BNE",
		description: "Branch on Not Equal to zero (Z = 0)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BPL",
		description: "Branch on PLus (N = 0)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BRK",
		description: "BReaK",
		group: "Other",
		snippet: '\n'
	},
	{
		name: "BVC",
		description: "Branch on oVerflow Clear (V = 0)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BVS",
		description: "Branch on oVerflow Set (V = 1)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "CLC",
		description: "CLear Carry flag",
		group: "Set and Reset (Clear)",
		snippet: '\n'
	},
	{
		name: "CLD",
		description: "CLear Decimal mode",
		group: "Set and Reset (Clear)",
		snippet: '\n'
	},
	{
		name: "CLI",
		description: "CLear Interrupt disable",
		group: "Set and Reset (Clear)",
		snippet: '\n'
	},
	{
		name: "CLV",
		description: "CLear oVerflow flag",
		group: "Set and Reset (Clear)",
		snippet: '\n'
	},
	{
		name: "CMP",
		description: "CoMPare memory and accumulator",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "CPX",
		description: "ComPare memory and X",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "CPY",
		description: "ComPare memory and Y",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "DEC",
		description: "DECrement memory by one",
		group: "Increment and Decrement",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "DEX",
		description: "DEcrement X by one",
		group: "Increment and Decrement",
		snippet: '\n'
	},
	{
		name: "DEY",
		description: "DEcrement Y by one",
		group: "Increment and Decrement",
		snippet: '\n'
	},
	{
		name: "EOR",
		description: "Exclusive-OR memory with Accumulator",
		group: "Logical",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "INC",
		description: "INCrement memory by one",
		group: "Increment and Decrement",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "INX",
		description: "INcrement X by one",
		group: "Increment and Decrement",
		snippet: '\n'
	},
	{
		name: "INY",
		description: "INcrement Y by one",
		group: "Increment and Decrement",
		snippet: '\n'
	},
	{
		name: "JMP",
		description: "JuMP to another location (GOTO)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "JSR",
		description: "Jump to SubRoutine",
		group: "Subroutine",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LDA",
		description: "LoaD the Accumulator",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LDX",
		description: "LoaD the X register",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LDY",
		description: "LoaD the Y register",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LSR",
		description: "Logical Shift Right",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "NOP",
		description: "No OPeration",
		group: "Other",
		snippet: '\n'
	},
	{
		name: "ORA",
		description: "OR memory with Accumulator",
		group: "Logical",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "PHA",
		description: "PusH Accumulator on stack",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "PHP",
		description: "PusH Processor status on stack",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "PLA",
		description: "PulL Accumulator from stack",
		group: "Transfer",
		snippet: '\n'		
	},
	{
		name: "PLP",
		description: "PulL Processor status from stack",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "ROL",
		description: "ROtate Left",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "ROR",
		description: "ROtate Right",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "RTI",
		description: "ReTurn from Interrupt",
		group: "Subroutine",
		snippet: '\n'
	},
	{
		name: "RTS",
		description: "ReTurn from Subroutine",
		group: "Subroutine",
		snippet: '\n'
	},
	{
		name: "SBC",
		description: "SuBtract from accumulator with Carry",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SEC",
		description: "SEt Carry",
		group: "Set and Reset (Clear)",
		snippet: '\n'
	},
	{
		name: "SED",
		description: "SEt Decimal mode",
		group: "Set and Reset (Clear)",
		snippet: '\n'
	},
	{
		name: "SEI",
		description: "SEt Interrupt disable",
		group: "Set and Reset (Clear)",
		snippet: '\n'
	},
	{
		name: "STA",
		description: "STore the Accumulator",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "STX",
		description: "STore the X register",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "STY",
		description: "STore the Y register",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "TAX",
		description: "Transfer Accumulator to X",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "TAY",
		description: "Transfer Accumulator to Y",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "TSX",
		description: "Transfer Stack pointer to X",
		group: "Stack",
		snippet: '\n'
	},
	{
		name: "TXA",
		description: "Transfer X to accumulator",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "TXS",
		description: "Transfer X to Stack pointer",
		group: "Stack",
		snippet: '\n'
	},
	{
		name: "TYA",
		description: "Transfer Y to Accumulator",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "AHX",
		type: InstructionType.Illegal,
		description: "stores A&X&H into memory",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "ALR",
		type: InstructionType.Illegal,
		description: "AND #{value} + LSR",
		group: "Shift and Rotate",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "ANC",
		type: InstructionType.Illegal,
		description: "AND #{value} + (ASL)",
		group: "Shift and Rotate",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "ANC2",
		type: InstructionType.Illegal,
		description: "AND #{value} + (ROL)",
		group: "Shift and Rotate",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "ARR",
		type: InstructionType.Illegal,
		description: "AND #{value} + ROR",
		group: "Shift and Rotate",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "AXS",
		type: InstructionType.Illegal,
		description: "A&X minus #{value} into X",
		group: "Arithmetic",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "DCP",
		type: InstructionType.Illegal,
		description: "DEC memory + CMP memory",
		group: "Increment and Decrement",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "ISC",
		type: InstructionType.Illegal,
		description: "INC memory + SBC memory",
		group: "Increment and Decrement",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LAS",
		type: InstructionType.Illegal,
		description: "stores memory&S into A, X and S",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LAX",
		type: InstructionType.Illegal,
		description: "LDA #{value} + TAX",
		group: "Load and Store",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "RLA",
		type: InstructionType.Illegal,
		description: "ROL memory + AND memory",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "RRA",
		type: InstructionType.Illegal,
		description: "ROR memory + ADC memory",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SAX",
		type: InstructionType.Illegal,
		description: "store A&X into memory",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SBC2",
		type: InstructionType.Illegal,
		description: "SBC #{value} + NOP",
		group: "Arithmetic",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "SHX",
		type: InstructionType.Illegal,
		description: "stores X&H into memory",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SHY",
		type: InstructionType.Illegal,
		description: "stores Y&H into memory",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SLO",
		type: InstructionType.Illegal,
		description: "ASL memory + ORA memory",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "ASO",	//alias of SLO
		type: InstructionType.Illegal,
		description: "ASL memory + ORA memory",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SRE",
		type: InstructionType.Illegal,
		description: "LSR memory + EOR memory",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LSE",	//alias of SRE
		type: InstructionType.Illegal,
		description: "LSR memory + EOR memory",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "TAS",
		type: InstructionType.Illegal,
		description: "stores A&X into S and A&X&H into memory",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "XAA",
		type: InstructionType.Illegal,
		description: "TXA + AND #{value}",
		group: "Shift and Rotate",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "KIL",
		type: InstructionType.Illegal,
		description: "Halts the CPU. the data bus will be set to #$FF",
		group: "Other",
		snippet: '\n'
	},
	{
		name: "JAM",	//alias of KIL
		type: InstructionType.Illegal,
		description: "Halts the CPU. the data bus will be set to #$FF",
		group: "Other",
		snippet: '\n'
	},
	{
		name: "HLT",	//alias of KIL
		type: InstructionType.Illegal,
		description: "Halts the CPU. the data bus will be set to #$FF",
		group: "Other",
		snippet: '\n'
	},
	{
		name: "BRA",
		type: InstructionType.DTV,
		description: "BRanch Always",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SAC",
		type: InstructionType.DTV,
		description: "Set ACcumulator mapping",
		group: "Load and Store",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "SIR",
		type: InstructionType.DTV,
		description: "Set Index Register mapping",
		group: "Load and Store",
		parameters: [{
			name: "value",
			kind: SymbolKind.Number
		}],
		snippet: ' #'
	},
	{
		name: "BBR0",
		type: InstructionType.C02,
		description: "Branch on Bit 0 Reset",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBR1",
		type: InstructionType.C02,
		description: "Branch on Bit 1 Reset",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBR2",
		type: InstructionType.C02,
		description: "Branch on Bit 2 Reset",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBR3",
		type: InstructionType.C02,
		description: "Branch on Bit 3 Reset",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBR4",
		type: InstructionType.C02,
		description: "Branch on Bit 4 Reset",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBR5",
		type: InstructionType.C02,
		description: "Branch on Bit 5 Reset",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBR6",
		type: InstructionType.C02,
		description: "Branch on Bit 6 Reset",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBR7",
		type: InstructionType.C02,
		description: "Branch on Bit 7 Reset",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBS0",
		type: InstructionType.C02,
		description: "Branch on Bit 0 Set",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBS1",
		type: InstructionType.C02,
		description: "Branch on Bit 1 Set",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBS2",
		type: InstructionType.C02,
		description: "Branch on Bit 2 Set",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBS3",
		type: InstructionType.C02,
		description: "Branch on Bit 3 Set",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBS4",
		type: InstructionType.C02,
		description: "Branch on Bit 4 Set",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBS5",
		type: InstructionType.C02,
		description: "Branch on Bit 5 Set",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBS6",
		type: InstructionType.C02,
		description: "Branch on Bit 6 Set",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BBS7",
		type: InstructionType.C02,
		description: "Branch on Bit 7 Set",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "PHX",
		type: InstructionType.C02,
		description: "PusH X register on stack",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "PHY",
		type: InstructionType.C02,
		description: "PusH Y register on stack",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "PLX",
		type: InstructionType.C02,
		description: "PulL X register from stack",
		group: "Transfer",
		snippet: '\n'		
	},
	{
		name: "PLY",
		type: InstructionType.C02,
		description: "PulL Y register from stack",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "RMB0",
		type: InstructionType.C02,
		description: "memory:=memory nand 2^0",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "RMB1",
		type: InstructionType.C02,
		description: "memory:=memory nand 2^1",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "RMB2",
		type: InstructionType.C02,
		description: "memory:=memory nand 2^2",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "RMB3",
		type: InstructionType.C02,
		description: "memory:=memory nand 2^3",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "RMB4",
		type: InstructionType.C02,
		description: "memory:=memory nand 2^4",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "RMB5",
		type: InstructionType.C02,
		description: "memory:=memory nand 2^5",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "RMB6",
		type: InstructionType.C02,
		description: "memory:=memory nand 2^6",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "RMB7",
		type: InstructionType.C02,
		description: "memory:=memory nand 2^7",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SMB0",
		type: InstructionType.C02,
		description: "memory:=memory or 2^0",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SMB1",
		type: InstructionType.C02,
		description: "memory:=memory or 2^1",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SMB2",
		type: InstructionType.C02,
		description: "memory:=memory or 2^2",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SMB3",
		type: InstructionType.C02,
		description: "memory:=memory or 2^3",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SMB4",
		type: InstructionType.C02,
		description: "memory:=memory or 2^4",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SMB5",
		type: InstructionType.C02,
		description: "memory:=memory or 2^5",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SMB6",
		type: InstructionType.C02,
		description: "memory:=memory or 2^6",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SMB7",
		type: InstructionType.C02,
		description: "memory:=memory or 2^7",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "STP",
		type: InstructionType.C02,
		description: "SToP",
		group: "Other",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "STZ",
		type: InstructionType.C02,
		description: "STore Zero into memory / STore into Z Register (65CE02)",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "TRB",
		type: InstructionType.C02,
		description: "Test and Reset Bits memory:=memory nand A",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "TSB",
		type: InstructionType.C02,
		description: "Test and Set Bits memory:=memory or A",
		group: "STore Zero into memory",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "WAI",
		type: InstructionType.C02,
		description: "WAit for Interrupt",
		group: "",
		snippet: '\n'
	},


	{
		name: "ASR",
		type: InstructionType.CE02,
		description: "Accumulator Shift Right",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "ASW",
		type: InstructionType.CE02,
		description: "Accumulator Shift Word left",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "CLE",
		type: InstructionType.CE02,
		description: "CLear Extended Stack disabled Flag",
		group: "Set and Reset (Clear)",
		snippet: '\n'
	},
	{
		name: "CPZ",
		type: InstructionType.CE02,
		description: "ComPare memory and Z",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "DEW",
		type: InstructionType.CE02,
		description: "DEcrement memory Word",
		group: "Increment and Decrement",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "DEZ",
		type: InstructionType.CE02,
		description: "DEcrement Z by one",
		group: "Increment and Decrement",
		snippet: '\n'
	},
	{
		name: "EOM",
		type: InstructionType.CE02,
		description: "End Of Mapping sequence",
		group: "Other",
		snippet: '\n'
	},
	{
		name: "INW",
		type: InstructionType.CE02,
		description: "INcrement memory Word",
		group: "Increment and Decrement",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "INZ",
		type: InstructionType.CE02,
		description: "INcrement Z by one",
		group: "Increment and Decrement",
		snippet: '\n'
	},
	{
		name: "LBCC",
		type: InstructionType.CE02,
		description: "16 bit Long Branch on Carry Clear (C = 0)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LBCS",
		type: InstructionType.CE02,
		description: "16 bit Long Branch on Carry Set (C = 1)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LBEQ",
		type: InstructionType.CE02,
		description: "16 bit Long Branch on EQual to zero (Z = 1)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LBMI",
		type: InstructionType.CE02,
		description: "16 bit Long Branch on MInus (N = 1)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LBNE",
		type: InstructionType.CE02,
		description: "16 bit Long Branch on Not Equal to zero (Z = 0)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LBPL",
		type: InstructionType.CE02,
		description: "16 bit Long Branch on PLus (N = 0)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LBRA",
		type: InstructionType.CE02,
		description: "16 bit Long BRanch Always",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LBSR",
		type: InstructionType.CE02,
		description: "16 bit Long Branch on oVerflow Set (V = 1)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LBVC",
		type: InstructionType.CE02,
		description: "16 bit Long Branch on oVerflow Clear (V = 0)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LBVS",
		type: InstructionType.CE02,
		description: "16 bit Long Branch on oVerflow Set (V = 1)",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LDZ",
		type: InstructionType.CE02,
		description: "LoaD Z Register",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "MAP",
		type: InstructionType.CE02,
		description: "set memory MAP",
		group: "Other",
		snippet: '\n'
	},
	{
		name: "NEG",
		type: InstructionType.CE02,
		description: "NEGate accumulator",
		group: "Other",
		snippet: '\n'
	},
	{
		name: "PHW",
		type: InstructionType.CE02,
		description: "PusH Word on stack",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "PHZ",
		type: InstructionType.CE02,
		description: "PusH Z register on stack",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "PLZ",
		type: InstructionType.CE02,
		description: "PulL Z register from stack",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "ROW",
		type: InstructionType.CE02,
		description: "ROtate Word left",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "RTN",
		type: InstructionType.CE02,
		description: "ReTurN from subroutine and adjust stack pointer",
		group: "Subroutine",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "SEE",
		type: InstructionType.CE02,
		description: "SEt stack Extend disable bit",
		group: "Set and Reset (Clear)",
		snippet: '\n'
	},
	{
		name: "TAB",
		type: InstructionType.CE02,
		description: "Transfer Accumulator into Base page register",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "TAZ",
		type: InstructionType.CE02,
		description: "Transfer Accumulator register into the Z register",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "TBA",
		type: InstructionType.CE02,
		description: "Transfer Base page register into the Accumulator",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "TSY",
		type: InstructionType.CE02,
		description: "Transfer Stack pointer to Y",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "TYS",
		type: InstructionType.CE02,
		description: "Transfer Y to Stack pointer",
		group: "Transfer",
		snippet: '\n'
	},
	{
		name: "TZA",
		type: InstructionType.CE02,
		description: "Transfer Z to accumulator",
		group: "Transfer",
		snippet: '\n'
	},

	{
		name: "ADCQ",
		type: InstructionType.GS02,
		description: "ADd to 32 bit Q register with Carry",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "ANDQ",
		type: InstructionType.GS02,
		description: "Binary AND to 32 bit Q register",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "ASLQ",
		type: InstructionType.GS02,
		description: "Arithmetic Shift Left to 32 bit Q register",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "ASRQ",
		type: InstructionType.GS02,
		description: "Arithmetic Shift Right to 32 bit Q register",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "BITQ",
		type: InstructionType.GS02,
		description: "test BITs",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "CPQ",
		type: InstructionType.GS02,
		description: "ComPpare Q pseudo register",
		group: "Jump, Branch, Compare, and Test",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "DEQ",
		type: InstructionType.GS02,
		description: "DECrement memory or Q pseudo register",
		group: "Increment and Decrement",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "EORQ",
		type: InstructionType.GS02,
		description: "Exclusive-OR memory with Q pseuco register",
		group: "Logical",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "INQ",
		type: InstructionType.GS02,
		description: "INcrement memory or Q pseudo register",
		group: "Increment and Decrement",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LDQ",
		type: InstructionType.GS02,
		description: "LoaD Q pseudo register",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "LSRQ",
		type: InstructionType.GS02,
		description: "Logical Shift Right Q pseudo register",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "ORQ",
		type: InstructionType.GS02,
		description: "OR memory with Q pseudo register",
		group: "Logical",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "ROLQ",
		type: InstructionType.GS02,
		description: "ROtate Left Memory or Q pseudo register",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "RORQ",
		type: InstructionType.GS02,
		description: "ROtate Right Memory or Q pseudo register",
		group: "Shift and Rotate",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number,
			optional: true
		}],
		snippet: ' '
	},
	{
		name: "SBCQ",
		type: InstructionType.GS02,
		description: "SuBtract from Q pseudo register with Carry",
		group: "Arithmetic",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	},
	{
		name: "STQ",
		type: InstructionType.GS02,
		description: "STore Q pseudo register",
		group: "Load and Store",
		parameters: [{
			name: "memory",
			kind: SymbolKind.Number
		}],
		snippet: ' '
	}
];