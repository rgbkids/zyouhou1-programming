# Repository Guidelines

## Project Structure & Module Organization
This repository is documentation-first. The root contains a minimal [README.md](/Users/myuser/git/zyouhou1-programming/README.md). Most work lives under [docs/harness](/Users/myuser/git/zyouhou1-programming/docs/harness), which stores the template-driven harness for building an educational browser interpreter.

- `00_master_instruction.md` is the top-level orchestrator.
- `01_` to `15_` cover scoped implementation areas such as parser, runtime, I/O, browser sandboxing, and test traces.
- `99_template_to_boilerplate.md` captures generalization/reuse guidance.
- `templates/manifest.json` holds template metadata.

Keep new materials in `docs/harness/` unless they are truly repository-wide.

## Build, Test, and Development Commands
There is no project build system checked in yet. Use lightweight validation commands while editing docs:

- `rg --files docs/harness` lists harness files quickly.
- `sed -n '1,80p' docs/harness/00_master_instruction.md` previews a document section.
- `git diff -- AGENTS.md docs/harness` reviews pending documentation edits.

If a formatter or linter is added later, document its exact command here instead of assuming one exists.

## Coding Style & Naming Conventions
Write in Markdown with short sections, ordered headings, and direct instructions. Follow the existing numbered filename pattern for harness documents: `00_...md`, `01_...md`, `99_...md`. Keep names descriptive and snake_case.

Within each harness file, preserve the established section structure when relevant:

- `Goal`
- `Output Files`
- `Contracts`
- `Stage Structure`
- `Validation Checklist`
- `Failure Recovery Rules`
- `Final Output Format`

Prefer concise Japanese or English prose that is easy for humans and AI tools to parse.

## Testing Guidelines
Testing here is review-based rather than automated. Before submitting changes:

- verify links and referenced paths exist
- confirm numbering and file prefixes stay consistent
- read the edited Markdown once in rendered form or plain text for heading order and clarity

When adding examples, keep them executable as written and scoped to this repo.

## Commit & Pull Request Guidelines
Recent commits use short conventional prefixes such as `docs:` and `doc:`. Continue with imperative, scoped summaries like `docs: add contributor guide` or `docs: refine harness README`.

Pull requests should include:

- a brief summary of the documentation change
- affected paths, such as `docs/harness/*`
- rationale when reordering stages or changing template contracts
- screenshots only if rendered output or UI docs are involved
