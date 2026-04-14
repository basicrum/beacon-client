import { boomerangSource } from "./generated/boomerang-source";
import type { BasicRumConfig } from "./types";

const LOG_PREFIX = "[BasicRUM]";

interface BoomerangInstance {
	init(config: BoomerangInitConfig): void;
	addVar(vars: Record<string, string>): void;
}

interface BoomerangInitConfig {
	beacon_url: string;
	ResourceTiming?: {
		enabled: boolean;
		clearOnBeacon?: boolean;
	};
}

declare global {
	interface Window {
		BOOMR?: BoomerangInstance;
		/**
		 * Configuration object read by the `basic-rum-init-config` plugin
		 * bundled in the BasicRUM fork of Boomerang. When set before the
		 * Boomerang script executes, the plugin automatically calls
		 * `BOOMR.init()` with this config.
		 */
		basicRumBoomerangConfig?: BoomerangInitConfig;
	}
}

/**
 * Builds the Boomerang init config object from a BasicRumConfig.
 */
function buildBoomerangConfig(config: BasicRumConfig): BoomerangInitConfig {
	return {
		beacon_url: config.beaconUrl,
		ResourceTiming: {
			enabled: config.resourceTiming ?? true,
			clearOnBeacon: true,
		},
	};
}

/**
 * Returns a self-contained inline script string that loads Boomerang and
 * initializes BasicRUM. Useful for Next.js `beforeInteractive` `<Script>` tags
 * or any scenario where you need to inject the full setup as raw HTML.
 *
 * Sets `window.basicRumBoomerangConfig` before loading Boomerang so the
 * bundled `basic-rum-init-config` plugin auto-calls `BOOMR.init()`. Then
 * adds the `brum_site_id` variable after initialization.
 *
 * The returned string contains the entire Boomerang library + configuration,
 * so no external file hosting is needed.
 *
 * @param config - Beacon configuration options
 * @returns A JavaScript string ready to be used as inline script content
 *
 * @example Next.js `beforeInteractive`
 * ```tsx
 * import Script from "next/script";
 * import { getInlineScript } from "@basicrum/beacon-client";
 *
 * const script = getInlineScript({
 *   beaconUrl: process.env.NEXT_PUBLIC_BEACON_URL!,
 *   siteId: "my_website_1",
 * });
 *
 * <Script id="basicrum" strategy="beforeInteractive">
 *   {script}
 * </Script>
 * ```
 */
export function getInlineScript(config: BasicRumConfig): string {
	const boomrConfig = buildBoomerangConfig(config);
	return [
		`window.basicRumBoomerangConfig=${JSON.stringify(boomrConfig)};`,
		boomerangSource,
		`BOOMR.addVar(${JSON.stringify({ brum_site_id: config.siteId })});`,
	].join("\n");
}

/**
 * Configures an already-loaded BOOMR instance with the given BasicRUM config.
 * Used when BOOMR is already present (e.g. loaded by a tag manager) and the
 * `basic-rum-init-config` plugin has already run without a config.
 */
function configureBoomr(config: BasicRumConfig): void {
	const boomr = window.BOOMR;
	if (!boomr) return;

	boomr.init(buildBoomerangConfig(config));
	boomr.addVar({ brum_site_id: config.siteId });
}

/**
 * Initialize BasicRUM beacon monitoring.
 *
 * Loads the Boomerang RUM library and configures it to send performance
 * beacons to the specified URL. By default, the bundled Boomerang script
 * is injected inline — no additional file hosting required.
 *
 * Uses the `basic-rum-init-config` plugin built into the BasicRUM fork of
 * Boomerang: sets `window.basicRumBoomerangConfig` before injecting the
 * script, so Boomerang auto-initializes on load.
 *
 * If the Boomerang script is already loaded on the page (e.g. via a
 * `<script>` tag), it will be configured immediately without re-loading.
 *
 * @param config - Beacon configuration options
 * @returns A promise that resolves when initialization is complete
 *
 * @example
 * ```ts
 * import { initBasicRum } from "@basicrum/beacon-client";
 *
 * initBasicRum({
 *   beaconUrl: "https://beacon.example.com/beacon",
 *   siteId: "my_website_1",
 * });
 * ```
 *
 * @example Loading boomerang from your own server
 * ```ts
 * initBasicRum({
 *   beaconUrl: "https://beacon.example.com/beacon",
 *   siteId: "my_website_1",
 *   scriptUrl: "/boomerang.min.js",
 * });
 * ```
 */
export function initBasicRum(config: BasicRumConfig): Promise<void> {
	if (typeof window === "undefined") {
		return Promise.resolve();
	}

	if (window.BOOMR) {
		configureBoomr(config);
		console.log(LOG_PREFIX, "Initialized (existing BOOMR instance)");
		return Promise.resolve();
	}

	if (config.scriptUrl) {
		window.basicRumBoomerangConfig = buildBoomerangConfig(config);
		return new Promise<void>((resolve, reject) => {
			const script = document.createElement("script");
			script.src = config.scriptUrl as string;
			script.onload = () => {
				window.BOOMR?.addVar({ brum_site_id: config.siteId });
				console.log(LOG_PREFIX, "Initialized (external script)");
				resolve();
			};
			script.onerror = () => {
				const error = new Error(
					`Failed to load boomerang script from ${config.scriptUrl}`,
				);
				console.error(LOG_PREFIX, error.message);
				reject(error);
			};
			document.head.appendChild(script);
		});
	}

	window.basicRumBoomerangConfig = buildBoomerangConfig(config);
	const script = document.createElement("script");
	script.textContent = boomerangSource;
	document.head.appendChild(script);

	if (window.BOOMR) {
		// @ts-expect-error -- BOOMR may not be defined yet, but will be after the script loads
		window.BOOMR.addVar({ brum_site_id: config.siteId });
		console.log(LOG_PREFIX, "Initialized (inline)");
	} else {
		console.error(
			LOG_PREFIX,
			"Boomerang failed to initialize after inline injection",
		);
	}

	return Promise.resolve();
}
