# zyouhou1-programming

Browser-based educational interpreter workspace for 情報I. The project combines a Monaco-powered editor, an AST-based evaluator, mock WebAPI access, device simulation, and teaching-oriented samples.

## Setup

```bash
npm run dev
```

Open the Vite URL and use the sample selector to load control-flow, WebAPI, numeric-error, device, and simulation examples.

## Commands

- `npm run dev`: start the browser workbench locally
- `npm test`: run parser, evaluator, runtime, and integration tests
- `npm run build`: create a production build in `dist/`

## Project Layout

- `src/lang`: tokenizer, parser, and AST definitions
- `src/runtime`: evaluator, built-ins, I/O model, WebAPI policy, and device mocks
- `src/ui`: Monaco workbench and teaching panels
- `src/samples`: sample registry used by the app
- `samples`: `.info1` classroom sample files
- `docs`: plan, conformance, language spec, runbook, and teaching notes

## Current Scope

- Core language: assignment, `print`, `if/else`, `for/range`, `while`, lists, `def/return`
- Built-ins: `len`, `range`, `random.randrange`, `webapi.get_json`, `device.*`
- Teaching support: numeric error notes, algorithm notes, simulation notes, device panel

## Constraints

- No unrestricted network access from learner code
- No real hardware integration in this repository
- `while` loops are capped by a step limit to avoid runaway execution
