/**
 * Configuration options for Basicrum beacon initialization.
 *
 * @example
 * ```ts
 * const config: BasicRumConfig = {
 *   beaconUrl: "https://beacon.example.com/beacon",
 *   siteId: "my_website_1",
 * };
 * ```
 */
export interface BasicRumConfig {
	/**
	 * URL where beacons will be sent to the Basicrum backend.
	 *
	 * @example "https://beacon.example.com/beacon"
	 */
	beaconUrl: string;

	/**
	 * Unique identifier for your site. Used to distinguish beacons
	 * from different websites in the Basicrum dashboard.
	 *
	 * @example "my_website_1"
	 */
	siteId: string;

	/**
	 * Enable ResourceTiming data collection.
	 *
	 * When enabled, collects detailed performance data about resource loading
	 * (scripts, stylesheets, images, etc.) and clears the buffer after each beacon.
	 *
	 * @default true
	 */
	resourceTiming?: boolean;

	/**
	 * URL to load the boomerang script from externally.
	 *
	 * When provided, the boomerang script is loaded from this URL instead of
	 * using the version bundled with the package. This is useful when you want
	 * to serve `boomerang.min.js` from your own CDN or public directory for
	 * better caching.
	 *
	 * The bundled file can be copied from
	 * `node_modules/@basicrum/beacon-client/asset/boomerang.min.js`.
	 *
	 * @example "/boomerang.min.js"
	 */
	scriptUrl?: string;
}
