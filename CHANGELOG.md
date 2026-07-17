# Changelog

All notable changes to this project will be documented in this file.
## [0.3.5] - 2026-07-17

### CI
- **labeler:** Auto-label PRs by changed files (301c757)
- **release-train:** Sync dependabot/updates after stable release (97cbcff)
- Parallelize lint/test/build via node-ci (37e3c77)
- **docker:** Block PR merge on CRITICAL image vulnerabilities (4f3d4a9)
- **release:** Scan Docker image for vulnerabilities with Trivy (63947e7)

### Chore
- Add CodeQL workflow for code analysis (ec8ea4e)
## [0.3.4] - 2026-07-17

### Bug Fixes
- **deps:** Update dependency @nestjs/platform-express to v11 (c570abe)
- **deps:** Update dependency @nestjs/common to v11 (50724d0)
- **deps:** Update dependency @nestjs/core to v11 (92db0bb)

### Chore
- **deps:** Update npm minor and patch updates (d42eb74)
- **deps:** Update node.js to v24 (8b28a4b)
- **deps:** Update node.js to v24 (2e5b3d7)
- **deps:** Lock file maintenance (1710399)
- **deps:** Update dependency @nestjs/testing to v11 (e9d4033)
- **deps:** Lock file maintenance (074bfee)
## [0.3.3] - 2026-07-17

### Chore
- Update extends property in renovate.json (9a53905)
## [0.3.2] - 2026-07-15

### Chore
- **deps:** Bump actions/checkout from 4 to 7 (42cc677)
- **deps:** Bump docker/setup-qemu-action from 3 to 4 (46382d1)
- **deps:** Bump docker/setup-buildx-action from 3 to 4 (2da28e6)
- **deps:** Bump docker/build-push-action from 6 to 7 (28b9766)
- **deps:** Bump tough-cookie from 5.1.2 to 6.0.2 (e425a8d)
- **deps-dev:** Bump jest and @types/jest (8c3409b)
- **deps:** Bump @nestjs/cqrs from 10.2.8 to 11.0.3 (62081e1)
- **deps-dev:** Bump prettier from 3.8.4 to 3.9.5 (94f1ac7)
- **deps-dev:** Bump @nestjs/schematics from 10.2.3 to 11.1.0 (c69f6df)
- **deps-dev:** Bump @nestjs/cli from 10.4.9 to 11.0.24 (40c7527)
- **deps-dev:** Bump eslint-config-prettier from 9.1.2 to 10.1.8 (6671cfc)
- **deps-dev:** Bump @types/supertest from 6.0.3 to 7.2.1 (c68f646)
- **deps-dev:** Bump @types/node from 20.19.43 to 26.1.1 (f9bef04)
- **deps:** Bump class-validator from 0.14.4 to 0.15.1 (e49c94a)
- **deps-dev:** Bump lint-staged from 15.5.2 to 17.0.8 (5d583e7)
- **deps-dev:** Bump @typescript-eslint/parser from 8.62.0 to 8.64.0 (aa8df15)

### Documentation
- **docker:** Add Docker Hub README for running the image (d08e08d)
## [0.3.1] - 2026-06-29

### Documentation
- Add architecture diagram for cookidoo-mcp (6f027ef)
- Translate architecture diagram to English (686bf97)
## [0.3.0] - 2026-06-27

### Features
- **docs:** Add a real SVG favicon for the web (c4e3614)
## [0.2.2] - 2026-06-26

### Documentation
- Document COOKIDOO_DEBUG and health endpoint, fix license (f480482)
## [0.2.1] - 2026-06-26

### Documentation
- Add minimalist bilingual project website for GitHub Pages (f413a69)
## [0.2.0] - 2026-06-26

### Chore
- **.gitignore:** Add .cookidoo-session.json to ignore list (d29843a)

### Features
- **cookidoo:** Add meal-planner calendar tools (8176f55)
- **cookidoo:** Migrate custom recipes, collections & shopping-list edits (5218f6a)
- **cookidoo:** Add optional session persistence (COOKIDOO_COOKIE_FILE) (a75d934)
## [0.1.1] - 2026-06-26

### Chore
- Add GNU GPL v3 license (0b0bb58)
## [0.1.0] - 2026-06-26

### Bug Fixes
- **cookidoo:** Don't send JSON Accept header on the login flow (fe39452)
- **cookidoo:** Follow OAuth redirects manually to persist session cookies (b2dea69)
- **cookidoo:** Diagnose login cookie failure; match upstream verify (365d684)
- **cookidoo:** Send browser navigation headers on the credentials POST (518e8a4)
- **cookidoo:** Detect cidaas invalid-credentials redirect (32530c1)

### Chore
- Initialize README with project title (dd81f1e)
- Add tests, health module and CI/CD infra (a1bfd52)
- Default localization to Spanish (es-ES) (fce24e6)
- **cookidoo:** Add standalone login diagnostic script (42e7cd9)
- **cookidoo:** Log credentials POST body + login form fields (81e18cc)
- **cookidoo:** Surface login form action + fields in auth error (af0fd58)
- Add codegraph (4496910)
- **cursor:** Add MCP client config for Cookidoo server (9ff7e72)

### Documentation
- **readme:** Document Docker run with env file or inline vars (65f83e7)

### Features
- NestJS MCP server for Cookidoo (core migration) (160ecdc)

### Refactor
- **cookidoo:** Quiet login failure diagnostics (ffa00b1)

