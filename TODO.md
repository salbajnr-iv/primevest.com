# Cleanup TODO - Codebase Cleanup Plan Execution

Current Working Directory: c:/Users/DELL 7480/SALBA-JNR/htdocs/primevest.com

Track progress by marking [x] as steps complete. BLACKBOXAI will update this file iteratively.

## Phase 1: Root Junk Deletion (Immediate, Safe) [ALL ✅]

- [x] Delete: globals.css.backup
- [x] Delete: \_middleware-deprecated.ts
- [x] Delete: postgres.xhyivvvbrcmbjvzmvlod.session.sql
- [x] Delete: server.log
- [x] Delete: price.json
- [x] Delete: LIVE_CHAT_WIDGET_COMPLETE.md (feature delivered)
- [x] Delete: test-api-auth-fixed.ps1, test-api-auth.ps1, test-api.ps1
- [x] Delete: test-primevest-api.sh, test-profile-fix.js
- [x] Delete: .hintrc
- [x] Delete entire: hint-report/ (obsolete HTML report)
- [x] Delete: print-env.js

## Phase 2: docs/ Cleanup (Preserve TASK_PLAN.md, active items)

### Delete Legacy/Completed MDs (50+ confirmed obsolete/archived):

- [ ] All TODO-FIX-_.md (e.g., TODO-FIX-TS-ERRORS.md - completed), TYPESCRIPT*FIX*_.md
- [ ] Legacy TODOs: TODO_DASHBOARD.md, TODO_LANGUAGE.md, TODO_MENU_PAGES.md, RESPONSIVENESS_TODO.md, RENAME_TODO.md
- [ ] Admin/CRON/Deploy: ADMIN*\*.md, CRON*_.md, DEPLOY\__.md, MIGRATION_DEPLOYMENT_PLAN.md (non-canonical)
- [ ] Implementation/Fix: IMPLEMENTATION*\*.md, FIX_PROFILE*\*.md, implementation_plan.md
- [ ] Audits/Summaries: api-route-audit.md, backend-\*.md, compact-ui-spec.md
- [ ] Other completed: CLI-API-TESTING.md, POSTMAN-TESTING.md, etc. (full list from search)

### Delete Subdirs:

- [ ] docs/hooks/ (drafts: use-market-data.ts etc.)
- [ ] docs/ui-audit/ (QA notes, incomplete READMEs)

### Consolidate:

- [ ] Create docs/COMPLETED_TASKS_ARCHIVE.md → Summarize deleted TODOs + link to TASK_PLAN.md
- [x] Keep: TASK_PLAN.md (canonical active plan), README.md (if any)

## Phase 3: Validation & Final

- [ ] Run: npm run lint && npm run build (confirm no breakage)
- [ ] Update root TODO.md (remove references to deleted)
- [ ] git add . && git commit -m "Cleanup: remove obsolete temp/legacy files, consolidate docs"
- [ ] Run git clean -fd (dry-run) to check leftovers

**Status:** Phase 1 complete. Next: Phase 2 docs cleanup.
**Next Step:** List & delete obsolete docs/ files.
