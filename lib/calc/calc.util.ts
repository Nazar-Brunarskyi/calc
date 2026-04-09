export interface ICalcProps {
  value: number;
  formulas: string[];
}

export type Variables = Record<string, number>;

type InternalVariables = Variables & { init: number };

export interface ICalcContext {
  variables: InternalVariables;
}

const PLACEHOLDER_PATTERN = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

/** Allowed tokens after placeholders are replaced with numeric literals (JSON number in parentheses). */
const SAFE_EXPRESSION_PATTERN = /^[0-9eE+\-*/().\s]+$/;

/**
 * PRIVATE
 */
interface ISubstitutePlaceholdersProps {
  formula: string;
  variables: InternalVariables;
}

/**
 * PRIVATE
 */
const substitutePlaceholders = ({
  formula,
  variables,
}: ISubstitutePlaceholdersProps): string =>
  formula.replace(PLACEHOLDER_PATTERN, (_match, key: string) => {
    const value = variables[key];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`Unknown or non-finite placeholder {${key}} in formula`);
    }

    return `(${JSON.stringify(value)})`;
  });

/**
 * PRIVATE
 */
const evaluateExpandedExpression = (
  expression: string,
  stepIndexOneBased: number,
): number => {
  try {
    const fn = new Function(`return (${expression});`);
    const result = fn();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error(
        `Formula at step ${stepIndexOneBased} did not evaluate to a finite number`,
      );
    }
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Formula at step")) {
      throw error;
    }
    throw new Error(
      `Formula at step ${stepIndexOneBased} is invalid or could not be evaluated`,
    );
  }
};

export const calc = ({ value, formulas }: ICalcProps): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("calc value must be a finite number");
  }

  const variables: InternalVariables = {
    init: value,
  };

  if (formulas.length === 0) {
    return value;
  }

  for (let i = 0; i < formulas.length; i += 1) {
    const formula = formulas[i];
    const expanded = substitutePlaceholders({ formula, variables });
    const trimmed = expanded.trim();

    if (trimmed.length === 0) {
      throw new Error(`Formula at step ${i + 1} is empty or whitespace-only`);
    }

    if (!SAFE_EXPRESSION_PATTERN.test(expanded)) {
      throw new Error(
        `Formula at step ${i + 1} contains invalid characters after substitution`,
      );
    }

    const result = evaluateExpandedExpression(expanded, i + 1);
    const stepKey = `step_${i + 1}`;
    variables[stepKey] = result;
  }

  return variables[`step_${formulas.length}`];
};
