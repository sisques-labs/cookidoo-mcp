# Changelog

All notable changes to this project will be documented in this file.
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

