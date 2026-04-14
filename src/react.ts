"use client";

import { initBasicRum } from "./init";
import type { BasicRumConfig } from "./types";

export type { BasicRumConfig } from "./types";

/**
 * React component that initializes BasicRUM beacon monitoring.
 *
 * Place this component in your root layout or `_app` to start
 * collecting Real User Monitoring data. The component renders nothing
 * and initializes the beacon only once using a module-level singleton.
 *
 * @param props - Beacon configuration options
 * @returns `null` — this component renders no visible output
 *
 * @example Next.js App Router (`app/layout.tsx`)
 * ```tsx
 * import { BasicRumBeacon } from "@basicrum/beacon-client/react";
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <BasicRumBeacon
 *           beaconUrl="https://beacon.example.com/beacon"
 *           siteId="my_website_1"
 *         />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example Next.js Pages Router (`pages/_app.tsx`)
 * ```tsx
 * import { BasicRumBeacon } from "@basicrum/beacon-client/react";
 * import type { AppProps } from "next/app";
 *
 * export default function App({ Component, pageProps }: AppProps) {
 *   return (
 *     <>
 *       <BasicRumBeacon
 *         beaconUrl={process.env.NEXT_PUBLIC_BEACON_URL!}
 *         siteId="my_website_1"
 *       />
 *       <Component {...pageProps} />
 *     </>
 *   );
 * }
 * ```
 */
let initialized = false;

export function BasicRumBeacon(props: BasicRumConfig) {
	if (!initialized) {
		initialized = true;
		initBasicRum(props);
	}

	return null;
}
