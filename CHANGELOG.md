# Changelog

All notable changes to Comfy are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-17

### Added

- Comfy (light) and Comfy Night (dark), 281 workbench colours each, 30 tokenColor rules
  across 91 TextMate scopes, 15 semantic token colours, and the full 16-colour ANSI set.
- Both variants generated from `palette/comfy.json` by `scripts/build.mjs`, which fails the
  build if any colour drops below 4.5:1 or the ink band spreads beyond 1.5 points.
