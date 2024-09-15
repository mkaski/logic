import type { ASTNode, VariableAssignments } from "./types";

export default function evaluate(
	ast: ASTNode,
	assignments: VariableAssignments,
): boolean {
	switch (ast.type) {
		case "Variable":
			// Lookup the variable value in the assignments
			if (ast.name in assignments) {
				return assignments[ast.name];
			}
			throw new Error(`Variable ${ast.name} is not defined in assignments`);

		case "UnaryOperation":
			// Negation (~)
			if (ast.operator === "~") {
				return !evaluate(ast.operand, assignments);
			}
			break;

		case "BinaryOperation": {
			// Recursively evaluate left and right operands
			const left = evaluate(ast.left, assignments);
			const right = evaluate(ast.right, assignments);

			// Apply the binary operator
			switch (ast.operator) {
				case "&": // Conjunction
					return left && right;
				case "v": // Disjunction
					return left || right;
				case "->": // Implication
					return !left || right;
				case "<->": // Equivalence
					return left === right;
			}
			break;
		}
	}

	throw new Error(`Unknown AST node type or operator: ${ast}`);
}
