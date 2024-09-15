import evaluate from "./evaluator";
import parse from "./parser";
import tokenize from "./tokenizer";
import generateTruthTable from "./truthtable";
import type { TruthTable } from "./types";

import "./style.css";

const SELECTORS = {
	input: "form textarea",
	output: "form output",
	compile: "form button[data-compile]",
	evaluate: "form button[data-evaluate]",
	variables: "aside[data-variables] table",
	truth: "aside[data-truth] table",
};

const input = document.querySelector(SELECTORS.input) as HTMLInputElement;
const output = document.querySelector(SELECTORS.output) as HTMLOutputElement;
const truth = document.querySelector(SELECTORS.truth) as HTMLTableElement;

const variablesTable = document.querySelector(
	SELECTORS.variables,
) as HTMLTableElement;

const variableAssignments = new Map<string, boolean>();
// This one is used to store the previous state of the variableAssignments map.
// It's not cleared when the map is cleared.
const variableAssignmentCache = new Map<
	string,
	{
		value: boolean;
		description: string;
	}
>();

// Parse formula from query string
const params = new URLSearchParams(window.location.search);
const initialFormula = params.get("f") ?? "";

variablesTable.addEventListener("change", handleVariableChange);
input.value = initialFormula;
input.addEventListener("input", compile);

function compile() {
	try {
		const tokens = tokenize(input.value);
		const variables: { [key: string]: boolean } = tokens
			.filter((token) => token.type === "VAR")
			.map((token) => token.value)
			.reduce((acc: { [key: string]: boolean }, variable) => {
				acc[variable] =
					variableAssignments.get(variable) ??
					variableAssignmentCache.get(variable)?.value ??
					false;
				return acc;
			}, {});

		// Initialize the variableAssignments map with the variables and their default values
		variableAssignments.clear();
		for (const variable in variables) {
			variableAssignments.set(variable, variables[variable]);
		}
		renderVariables();

		// Compile and evaluate the formula
		const ast = parse(tokens);
		const evaluation = evaluate(ast, variables);

		// Display the result with color
		output.classList.remove("warning");
		output.classList.remove("true");
		output.classList.remove("false");

		if (evaluation) {
			output.classList.add("true");
		} else {
			output.classList.add("false");
		}
		output.textContent = evaluation.toString();

		// Generate the truth table
		const truthTable = generateTruthTable(Object.keys(variables), ast);
		renderTruthTable(Object.keys(variables), truthTable);

		// Update the URL with the formula
		const url = new URL(window.location.href);
		url.searchParams.set("f", input.value);
		window.history.replaceState({}, "", url.toString());
	} catch (error) {
		output.textContent = (error as Error).message;
		output.classList.remove("true");
		output.classList.remove("false");
		output.classList.add("warning");
	}
}

function renderVariables() {
	const table = document.querySelector(SELECTORS.variables) as HTMLTableElement;
	const tbody = table.querySelector("tbody") ?? document.createElement("tbody");
	tbody.innerHTML = "";
	for (const [variable, assignment] of variableAssignments.entries()) {
		const row = document.createElement("tr");
		const variableCell = document.createElement("td");
		const valueCell = document.createElement("td");
		const descriptionCell = document.createElement("td");

		// Variable name
		variableCell.textContent = variable;

		// Value checkbox
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.name = variable;
		checkbox.checked = assignment;
		valueCell.appendChild(checkbox);
		// valueCell.appendChild(
		// 	document.createTextNode(assignment ? "true" : "false"),
		// );

		// Description input
		const description =
			variableAssignmentCache.get(variable)?.description ?? "";
		const descriptionInput = document.createElement("input");
		descriptionInput.type = "text";
		descriptionInput.value = description;
		descriptionInput.name = variable;
		descriptionCell.appendChild(descriptionInput);

		row.appendChild(variableCell);
		row.appendChild(valueCell);
		row.appendChild(descriptionCell);
		tbody.appendChild(row);
	}
	table.appendChild(tbody);
}

export function renderTruthTable(variables: string[], truthTable: TruthTable) {
	const tableHead = truth.querySelector("thead tr") as HTMLTableRowElement;
	const tableBody = truth.querySelector("tbody") as HTMLTableSectionElement;

	// Clear previous table content
	tableHead.innerHTML = "";
	tableBody.innerHTML = "";

	// Create table headers
	for (const variable of variables) {
		const th = document.createElement("th");
		th.textContent = variable;
		tableHead.appendChild(th);
	}

	const resultTh = document.createElement("th");
	resultTh.style.fontWeight = "bold";
	resultTh.textContent = "Result";
	tableHead.appendChild(resultTh);

	// Create table rows for each combination
	for (const row of truthTable) {
		const tr = document.createElement("tr");

		// Add each variable's value
		for (const variable of variables) {
			const td = document.createElement("td");
			td.textContent = row[variable] ? "true" : "false";
			td.classList.add(row[variable] ? "true" : "false");
			tr.appendChild(td);
		}

		// Add the result
		const resultTd = document.createElement("td");
		resultTd.style.fontWeight = "bold";
		resultTd.textContent = row.result ? "true" : "false";
		resultTd.classList.add(row.result ? "true" : "false");
		tr.appendChild(resultTd);

		tableBody.appendChild(tr);
	}
}

function toggleVariable(event: Event) {
	const checkbox = event.target as HTMLInputElement;
	const variable = checkbox.name;
	variableAssignments.set(variable, checkbox.checked);
	compile();
}

function setVariableDescription(event: Event) {
	const input = event.target as HTMLInputElement;
	const variable = input.name;
	console.log({ variable, value: variableAssignments.get(variable) });
	variableAssignmentCache.set(variable, {
		value: variableAssignments.get(variable) ?? false,
		description: input.value,
	});
}

function handleVariableChange(event: Event) {
	const input = event.target as HTMLInputElement;
	switch (input.type) {
		case "checkbox":
			toggleVariable(event);
			break;
		default:
			setVariableDescription(event);
			break;
	}
}
