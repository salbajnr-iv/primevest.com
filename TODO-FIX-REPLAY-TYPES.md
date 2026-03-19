# Fix Supabase Functions TS Types - Replay

## Plan Steps
- [x] 1. Edit supabase/functions/_shared/replay.ts:\n  * Remove CDN PostgrestError import\n  * Replace PostgrestError cast with `any`
- [x] 2. Restart TypeScript server in VSCode (Cmd/Ctrl-Shift-P > TypeScript: Restart TS Server)
- [x] 3. Verify error gone, test function if needed (supabase functions deploy)

