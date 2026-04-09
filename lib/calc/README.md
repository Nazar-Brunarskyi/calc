# `lib/calc`

Small numeric helper: apply a sequence of arithmetic steps to a starting value.

## API

Import from `@/lib/calc/calc.util`:

- **`calc({ value, formulas })`** — returns a **`number`**. Starts from **`value`**, then for each entry in **`formulas`** (in order) applies one step when the string begins with **`+`**, **`-`**, **`*`**, or **`/`** followed by a numeric operand (optional whitespace). Operand is parsed with **`Number`**.

Examples:

- `calc({ value: 10, formulas: ["+5", "*2"] })` → **30**
- `calc({ value: 100, formulas: ["/4", "-10"] })` → **15**

Strings that are empty, only whitespace, lack a leading operator, or have a non-numeric operand are **skipped** (the accumulator is unchanged for that step).

## Files

- **`calc.util.ts`** — **`calc`**, **`ICalcProps`**
