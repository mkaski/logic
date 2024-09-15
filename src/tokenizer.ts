import type { Token } from "./types";

const OPERATORS = ["~", "->", "<->", "&", "v"];
const WHITESPACE = /\s/;
const VARIABLE_REGEX = /^[a-uw-zA-Z]+\d*/; // Variables can be any string, except 'v'

// ~ (negation)
// -> (implication)
// <-> (equivalence)
// & (conjunction)
// v (disjunction)
// ( (left parenthesis)
// ) (right parenthesis)

export default function tokenize(input: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;

	while (i < input.length) {
		const char = input[i];

		// Ignore spaces and line breaks
		if (WHITESPACE.test(char)) {
			i++;
			continue;
		}

		// Match parentheses
		if (char === "(") {
			tokens.push({ type: "LPAREN", value: "(" });
			i++;
			continue;
		}

		if (char === ")") {
			tokens.push({ type: "RPAREN", value: ")" });
			i++;
			continue;
		}

		// Match operators
		const operator = OPERATORS.find((op) => input.startsWith(op, i));
		if (operator) {
			tokens.push({ type: "OP", value: operator });
			i += operator.length;
			continue;
		}

		// Match variables (any string except 'v')
		const variableMatch = input.slice(i).match(VARIABLE_REGEX);
		if (variableMatch) {
			tokens.push({ type: "VAR", value: variableMatch[0] });
			i += variableMatch[0].length;
			continue;
		}

		// If no match, throw an error (invalid character)
		throw new Error(`Unexpected character at position ${i}: '${char}'`);
	}

	return tokens;
}
