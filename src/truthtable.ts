import evaluate from "./evaluator";
import type { ASTNode, TruthTable } from "./types";

// Generate all combinations of true/false for a given number of variables
function generateTruthCombinations(n: number): boolean[][] {
	const combinations: boolean[][] = [];

	for (let i = 0; i < 2 ** n; i++) {
		const combination: boolean[] = [];
		for (let j = n - 1; j >= 0; j--) {
			combination.push(Boolean(i & (1 << j)));
		}
		combinations.push(combination);
	}

	return combinations;
}

export default function generateTruthTable(
	variables: string[],
	ast: ASTNode,
): TruthTable {
	const combinations = generateTruthCombinations(variables.length);
	const truthTable: { [key: string]: boolean }[] = [];

	for (const combination of combinations) {
		const assignments: { [key: string]: boolean } = {};
		for (let index = 0; index < variables.length; index++) {
			const variable = variables[index];
			assignments[variable] = combination[index];
		}
		const result = evaluate(ast, assignments);
		truthTable.push({ ...assignments, result });
	}

	return truthTable;
}
