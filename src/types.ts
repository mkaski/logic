export type TokenType = "VAR" | "OP" | "LPAREN" | "RPAREN";

export interface Token {
	type: TokenType;
	value: string;
}

export type ASTNode = VariableNode | UnaryOperationNode | BinaryOperationNode;

export interface VariableNode {
	type: "Variable";
	name: string;
}

export interface UnaryOperationNode {
	type: "UnaryOperation";
	operator: "~"; // Negation
	operand: ASTNode;
}

export interface BinaryOperationNode {
	type: "BinaryOperation";
	operator: "->" | "<->" | "&" | "v"; // Binary operators
	left: ASTNode;
	right: ASTNode;
}

export type VariableAssignments = {
	[key: string]: boolean;
};

export type TruthTable = { [key: string]: boolean }[];
