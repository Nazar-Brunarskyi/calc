# `lib/calc`

Small numeric helper: apply a sequence of arithmetic formulas to a starting value using placeholders.

## API

Import from `@/lib/calc/calc.util`:

- **`calc({ value, formulas })`** — returns a **`number`**. Seeds **`variables.init`** from **`value`**, then runs each string in **`formulas`** in order. For step **`n`** (1-based), the result is stored as **`step_n`** and is available to later formulas as **`{step_n}`**.

Placeholders use the form **`{name}`** where **`name`** is a key in the current context (always **`init`** for the input value, and **`step_1`** … **`step_{k}`** for results of earlier steps in this run). Each placeholder is replaced with that variable’s numeric value before the step is evaluated.

If **`formulas`** is empty, **`calc`** returns **`value`**. **`value`** and every step result must be a finite number. Unknown placeholders, empty steps, characters outside a simple arithmetic subset after substitution, or a non-finite evaluation result cause **`calc`** to **throw** an **`Error`**.

Examples:

- `calc({ value: 10, formulas: ["{init} + 5", "{step_1} * 2"] })` → **30**
- `calc({ value: 100, formulas: ["{init} / 4", "{step_1} - 10"] })` → **15**

## Files

- **`calc.util.ts`** — **`calc`**, **`ICalcProps`**, **`ICalcContext`**, **`Variables`**
