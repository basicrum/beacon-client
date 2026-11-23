# @basicrum/beacon-client

Client-side Real User Monitoring (RUM) beacon for [Basicrum](https://github.com/basicrum/basicrum). Ships a pre-built [Boomerang](https://github.com/basicrum/boomerang) library (Basicrum's fork of [akamai/boomerang](https://github.com/akamai/boomerang)) and provides a simple API to start collecting performance data with zero configuration.

## Installation

```bash
npm install @basicrum/beacon-client
# or
pnpm add @basicrum/beacon-client
```

## Quick Start

### Vanilla JavaScript / TypeScript

```ts
import { initBasicRum } from "@basicrum/beacon-client";

initBasicRum({
  beaconUrl: "https://your-basicrum-server.com/beacon",
  siteId: "my_website_1",
});
```

That's it. The bundled Boomerang script is injected inline and configured automatically.

### React / Next.js

#### App Router (`app/layout.tsx`)

```tsx
import { BasicRumBeacon } from "@basicrum/beacon-client/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <BasicRumBeacon
          beaconUrl="https://your-basicrum-server.com/beacon"
          siteId="my_website_1"
        />
        {children}
      </body>
    </html>
  );
}
```

#### Pages Router (`pages/_app.tsx`)

```tsx
import { BasicRumBeacon } from "@basicrum/beacon-client/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <BasicRumBeacon
        beaconUrl="https://your-basicrum-server.com/beacon"
        siteId="my_website_1"
      />
      <Component {...pageProps} />
    </>
  );
}
```

`<BasicRumBeacon />` renders nothing and initializes only once. It includes a `"use client"` directive, so it works directly in Server Component layouts.

## Bundled Plugins

The bundled `boomerang.min.js` is built from the [basicrum/boomerang](https://github.com/basicrum/boomerang) fork using the `cutting-edge` flavor, which includes these plugins:

| Plugin | Description |
|--------|-------------|
| **Continuity** | Time to Interactive, page busy, frame rate, long tasks |
| **RT** | Round-trip / page load timing |
| **PaintTiming** | First Paint, First Contentful Paint, Largest Contentful Paint |
| **NavigationTiming** | Full Navigation Timing API data |
| **ResourceTiming** | Resource waterfall data (scripts, images, CSS, etc.) |
| **EventTiming** | Interaction to Next Paint (INP) |
| **BFCache** | Back/forward cache navigation detection |
| **Memory** | `performance.memory` and DOM size metrics |
| **Mobile** | Connection type, effective type, save-data |
| **Compression** | Beacon payload compression utilities |
| **MQ** | Message queue for deferred API calls |
| **BasicRumInitConfig** | Auto-calls `BOOMR.init()` from `window.basicRumBoomerangConfig` |

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `beaconUrl` | `string` | **required** | URL where beacons are sent to your Basicrum backend |
| `siteId` | `string` | **required** | Unique identifier for your site |
| `resourceTiming` | `boolean` | `true` | Collect ResourceTiming data (scripts, images, etc.) |
| `scriptUrl` | `string` | `undefined` | Load Boomerang from this URL instead of using the bundled version |

## Advanced Usage

### External Boomerang Script

By default, the Boomerang library (~100 KB) is bundled and injected inline. If you prefer to serve it as a separate, cacheable file:

1. Copy the file to your public directory:

```bash
cp node_modules/@basicrum/beacon-client/asset/boomerang.min.js public/
```

2. Use the `scriptUrl` option:

```ts
initBasicRum({
  beaconUrl: "https://your-basicrum-server.com/beacon",
  siteId: "my_website_1",
  scriptUrl: "/boomerang.min.js",
});
```

### Next.js `beforeInteractive` Strategy

If you need the script to load before React hydration (for capturing the earliest performance data), use `getInlineScript` with Next.js `<Script>`:

```tsx
import Script from "next/script";
import { getInlineScript } from "@basicrum/beacon-client";

const rumScript = getInlineScript({
  beaconUrl: process.env.NEXT_PUBLIC_BEACON_URL!,
  siteId: "my_website_1",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Script id="basicrum" strategy="beforeInteractive">
          {rumScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
```

The returned string contains the entire Boomerang library + configuration inline, so no external file hosting is needed.

### Pre-existing Boomerang

If Boomerang is already loaded on the page (e.g., by a tag manager), `initBasicRum` detects the existing `BOOMR` global and configures it without re-injecting the script.

## API Reference

### `initBasicRum(config: BasicRumConfig): Promise<void>`

Initializes Basicrum beacon monitoring. Loads the Boomerang library (inline or from URL) and configures it.

- **SSR-safe**: Returns immediately on the server (no `window` access).
- **Idempotent**: If BOOMR is already loaded, it configures without re-loading.
- Returns a `Promise` that resolves when initialization is complete.

### `getInlineScript(config: BasicRumConfig): string`

Returns a self-contained JavaScript string with the full Boomerang library + initialization. Use this for Next.js `beforeInteractive` scripts or any raw `<script>` injection where you need everything inline.

### `<BasicRumBeacon />` (React Component)

A zero-render React component that calls `initBasicRum` on mount. Accepts the same props as `BasicRumConfig`.

Import from `@basicrum/beacon-client/react`.

### `BasicRumConfig` (TypeScript Type)

Exported from both `@basicrum/beacon-client` and `@basicrum/beacon-client/react`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes and version history.

### Contributing Changelog Entries

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. When making changes:

1. Add an entry under the `[Unreleased]` section in `CHANGELOG.md`
2. Use one of these categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`
3. On release, the `[Unreleased]` section is renamed to the new version with the release date

## Development

```bash
# Install dependencies
pnpm install

# Generate boomerang source + build
pnpm --filter @basicrum/beacon-client build

# Generate boomerang source only
pnpm --filter @basicrum/beacon-client generate
```

### Updating Boomerang

The bundled `boomerang.min.js` comes from the [basicrum/boomerang](https://github.com/basicrum/boomerang) fork.
To update:

1. Build a new `boomerang.min.js` from the fork (see its README for `grunt clean build`)
2. Replace `asset/boomerang.min.js` with the new build
3. Update the `"boomerang"` field in `package.json` with the new version and commit hash
4. Run `pnpm --filter @basicrum/beacon-client build` — the generate script will warn if the version doesn't match
