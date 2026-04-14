# Changelog

All changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-04-14

### Fixed

- Add `"use client"` directive to React entry point so `<BasicRumBeacon />` hydrates in the browser under Next.js App Router
- Replace `useEffect`/`useRef` with a module-level singleton for simpler, earlier initialization

## [0.1.0] - 2026-04-12

### Added

- `initBasicRum()` function for vanilla JavaScript/TypeScript integration
- `<BasicRumBeacon />` React component for React/Next.js integration
- Bundled Boomerang v1.815.60 RUM library (injected inline by default)
- TypeScript support with full type definitions
- Support for external Boomerang script loading via `scriptUrl` option
- ResourceTiming collection enabled by default
- SSR-safe initialization (no-op on server)
- Automatic detection of pre-existing BOOMR global
