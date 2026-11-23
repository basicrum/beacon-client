import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getInlineScript, initBasicRum } from "./index";

const TEST_CONFIG = {
	beaconUrl: "https://beacon.example.com/beacon",
	siteId: "test_site_1",
};

describe("getInlineScript", () => {
	it("sets basicRumBoomerangConfig before boomerang source", () => {
		const script = getInlineScript(TEST_CONFIG);
		const configIndex = script.indexOf("window.basicRumBoomerangConfig=");
		const boomrIndex = script.indexOf("BOOMR_start=");
		expect(configIndex).toBeGreaterThanOrEqual(0);
		expect(boomrIndex).toBeGreaterThan(configIndex);
	});

	it("includes beacon_url in the config", () => {
		const script = getInlineScript(TEST_CONFIG);
		expect(script).toContain(
			'"beacon_url":"https://beacon.example.com/beacon"',
		);
	});

	it("includes brum_site_id addVar call", () => {
		const script = getInlineScript(TEST_CONFIG);
		expect(script).toContain('"brum_site_id":"test_site_1"');
	});

	it("enables ResourceTiming by default", () => {
		const script = getInlineScript(TEST_CONFIG);
		expect(script).toContain('"enabled":true');
	});

	it("disables ResourceTiming when configured", () => {
		const script = getInlineScript({ ...TEST_CONFIG, resourceTiming: false });
		expect(script).toContain('"enabled":false');
	});
});

describe("initBasicRum", () => {
	beforeEach(() => {
		delete window.BOOMR;
		delete window.basicRumBoomerangConfig;
	});

	afterEach(() => {
		for (const s of document.head.querySelectorAll("script")) {
			s.remove();
		}
	});

	it("resolves immediately in SSR (no window)", async () => {
		const origWindow = globalThis.window;
		// @ts-expect-error -- simulating SSR by removing window
		delete globalThis.window;
		try {
			await expect(initBasicRum(TEST_CONFIG)).resolves.toBeUndefined();
		} finally {
			globalThis.window = origWindow;
		}
	});

	it("configures existing BOOMR without injecting a script", async () => {
		const init = vi.fn();
		const addVar = vi.fn();
		window.BOOMR = { init, addVar };

		await initBasicRum(TEST_CONFIG);

		expect(init).toHaveBeenCalledWith(
			expect.objectContaining({ beacon_url: TEST_CONFIG.beaconUrl }),
		);
		expect(addVar).toHaveBeenCalledWith({ brum_site_id: TEST_CONFIG.siteId });
		expect(document.head.querySelector("script")).toBeNull();
	});

	it("sets basicRumBoomerangConfig and injects script tag", async () => {
		await initBasicRum(TEST_CONFIG);

		expect(window.basicRumBoomerangConfig).toEqual(
			expect.objectContaining({ beacon_url: TEST_CONFIG.beaconUrl }),
		);
		expect(document.head.querySelector("script")).not.toBeNull();
	});
});
