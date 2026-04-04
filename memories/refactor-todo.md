# Refactor ToDo

## Completed
- [x] Replace app entry with new bootstrap/router/state structure
- [x] Introduce shared config, auth, error, response, pagination utilities
- [x] Add new auth, user, post, comment, media, setting, theme backend modules
- [x] Replace database schema with new v0.2-oriented initial migration
- [x] Rebuild default theme templates to match new payload structure
- [x] Verify backend compiles against fresh schema and initializes `inkforge.db`
- [x] Add admin-side APIs for categories and tags management
- [x] Implement theme zip upload
- [x] Adapt admin frontend to the new API contract
- [x] Add admin-side category/tag update UI bindings in the frontend
- [x] Verify admin frontend builds against the new backend payloads

## Next
- [ ] Tighten theme service fallback behavior and add more manifest validation
- [ ] Add tests for auth, comments, media, post, and theme upload flows
- [ ] Update README and deployment notes
