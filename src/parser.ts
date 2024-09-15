import type {
	ASTNode,
	BinaryOperationNode,
	Token,
	UnaryOperationNode,
	VariableNode,
} from "./types";

function precedence(op: string): number {
	switch (op) {
		case "~":
			return 4;
		case "&":
		case "v":
			return 3;
		case "->":
			return 2;
		case "<->":
			return 1;
		default:
			return 0;
	}
}

export default function parse(tokens: Token[]): ASTNode {
	let current = 0;

	function parseExpression(precedenceLevel = 0): ASTNode {
		let left = parsePrimary(); // Parse the left operand

		while (
			current < tokens.length &&
			precedence(tokens[current].value) > precedenceLevel
		) {
			const token = tokens[current];
			if (token.type === "OP") {
				current++;
				const right = parseExpression(precedence(token.value)); // Parse the right operand
				left = {
					type: "BinaryOperation",
					operator: token.value,
					left,
					right,
				} as BinaryOperationNode;
			}
		}

		return left;
	}

	function parsePrimary(): ASTNode {
		const token = tokens[current];

		if (token.type === "VAR") {
			current++;
			return { type: "Variable", name: token.value } as VariableNode;
		}

		if (token.type === "OP" && token.value === "~") {
			current++;
			const operand = parsePrimary(); // Negation has higher precedence
			return {
				type: "UnaryOperation",
				operator: "~",
				operand,
			} as UnaryOperationNode;
		}

		if (token.type === "LPAREN") {
			current++; // Skip the '('
			const expr = parseExpression(); // Parse expression inside parentheses
			if (tokens[current].type === "RPAREN") {
				current++; // Skip the ')'
				return expr;
			}
			throw new Error("Mismatched parentheses");
		}

		throw new Error(`Unexpected token: ${token.value}`);
	}

	return parseExpression();
}
