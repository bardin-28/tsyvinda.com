---
name: doc-writer
description: Generates and maintains Architecture Decision Records (ADR) for features in this project. Use when the user asks to "document a feature", "write an ADR", "generate docs", "update documentation", or when the developer skill finishes a feature and asks about documentation. Creates docs/{feature-slug}.md files by scanning actual code to reflect real implementation. Updates existing docs surgically — never rewrites sections that didn't change. Always compares the implementation against any plan in plans/ and surfaces mismatches before writing.
effort: high
---

# doc-writer

Generates and maintains ADR documents for this Laravel project.
Read [doc-template.md](references/doc-template.md) for the exact document structure to follow.

## Document Naming

File: `docs/{feature-slug}.md`

Prepend the feature name with the JIRA task code if exists(grab from current git branch name if applied).
Derive the slug from the feature name — lowercase, kebab-case, noun phrase:

- User impersonation → `ARC-123-user-impersonation.md`
- Consolidated invoices → `ARC-123-consolidated-invoices.md`
- Camera FTP connection → `ARC-123-camera-ftp-connection.md`

Never include dates or version numbers in the filename. Git is the version history.

## Modes

Determine which mode applies from the user's request or context:

| Signal                                                                   | Mode         |
|--------------------------------------------------------------------------|--------------|
| "document X", "write ADR for X", new feature just built                  | **Create**   |
| "update docs", "sync docs", "code changed", specific section out of date | **Update**   |
| "does the doc match?", "check the plan"                                  | **Validate** |

---

## Create Mode

### Step 1 — Understand the feature scope

First of all try to obtain all required information from current context/memory.
Ask the user for the feature name if not provided. Then locate all relevant code if context is not enough:

- **Routes**: `routes/admin_v1.php`, `routes/platform_v1.php`, `routes/embed_v1.php`
- **Controllers**: `app/Http/Controllers/{Surface}/V1/`
- **Services**: `app/Services/`
- **DTOs**: `app/DTO/`
- **Models**: `app/Models/`
- **Migrations**: `database/migrations/` (most recent for this feature)
- **Config**: `config/` (any new or modified files)
- **OpenAPI specs**: `resources/documentation/{surface}/V1/paths/`

Read these files. Do not guess what they contain. If you can't find it, ask the user for it.
Do not add any assumptions to the document that are not confirmed by code.

### Step 2 — Compare plan vs implementation

Check `plans/` for a file matching the feature (first by name, then by content). If one exists:

1. Read the plan.
2. Compare each planned endpoint, model field, business rule, and service method against the actual code.
3. List every discrepancy and **show it to the user before writing the doc**.

Format for mismatches:

```
⚠ Plan/Code Mismatch
  Plan:   POST /admin/invoices/void (VoidRequest DTO with reason field)
  Code:   POST /admin/consolidated-invoice/{id}/void (no request body)
  Action: Confirm which is correct before I document it.
```

Do not proceed to write the doc until the user has acknowledged mismatches (or there are none).

### Step 3 — Write the ADR

Use the template in [doc-template.md](references/doc-template.md). Fill every section from actual code, not from
assumptions.

Rules:

- **Context**: describe the business driver and technical problem the feature solves.
- **Decision**: one or two sentences — what was built and the primary architectural choice.
- **Alternatives Considered**: include only alternatives that were genuinely weighed. Omit the table if none.
- **Implementation**: derive entirely from code. Every field, endpoint, status value, and log event must exist in the
  actual codebase at the time of writing.
- **Consequences**: be honest. Include trade-offs, edge cases, and anything deferred.
- Omit template sections that don't apply (e.g., no Status Lifecycle if there's no status enum, no Configuration if no
  config file was added). A shorter doc that's accurate beats a padded one.

Save to `docs/{feature-slug}.md`.

---

## Update Mode

### Step 1 — Identify what changed

Ask the user what changed, or inspect `git diff` / recent commits to identify modified files.

Map each changed file to the doc section it affects:

| Changed file                  | Doc section                   |
|-------------------------------|-------------------------------|
| Migration / Model             | Data Model                    |
| Controller / OpenAPI spec     | API Endpoints                 |
| Service class                 | Service Layer, Implementation |
| `config/*.php`                | Configuration                 |
| Exception / Handler map       | Error Handling                |
| Log::info/warning/error calls | Logging                       |

### Step 2 — Read the existing doc

Read `docs/{feature-slug}.md` in full before editing. Understand its current structure.

### Step 3 — Edit surgically

Use the **Edit tool** — never the Write tool — to modify only the affected sections. Preserve all surrounding content
exactly, including whitespace and formatting style.

If a section needs new rows in a table, add them. If a field was renamed, update that row. Do not reformat, re-order, or
rewrite prose that wasn't affected by the code change.

After editing, read the doc back to confirm structure integrity.

---

## Validate Mode

Run this on demand or automatically before Update mode.

1. Read `plans/{matching-plan}.md` if it exists.
2. Read `docs/{feature-slug}.md`.
3. Read the current code (controller, service, model).
4. Report any of:
    - Endpoints in doc that no longer exist in code
    - Fields in doc that no longer exist in the model
    - Log events in doc that no longer appear in the service
    - Plan items that were never implemented and never documented as deferred

---

## Quality Checklist

Before saving or editing, verify:

- [ ] Every API endpoint in the doc exists in the routes + controller
- [ ] Every model field exists in the migration and Model `$fillable` / casts
- [ ] Every log event string matches a `Log::` call in the service
- [ ] Every status value matches the Enum class
- [ ] No section contains placeholder text (`{...}`, `...`, `TODO`)
- [ ] File saved to `docs/{feature-slug}.md`
- [ ] Any plan mismatches were shown to the user and acknowledged
