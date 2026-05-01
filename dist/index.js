// index.ts
import { Stagehand } from "@browserbasehq/stagehand";
import { MiniMaxClient } from "./lib/minimax-client.js";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
const ClinicSchema = z.object({
    name: z.string().describe("Clinic or doctor name"),
    address: z.string().nullable(),
    phone: z.string().nullable().optional(),
    rating: z.number().nullable().optional(),
    reviewsCount: z.number().nullable().optional(),
    website: z.string().nullable().optional(),
    googleMapsUrl: z.string().describe("Google Maps listing URL"),
});
const SEARCH_URLS = [
    "https://www.google.com/maps/search/dental+chambers+in+chittagong",
    "https://www.google.com/maps/search/dental+chambers+in+dhaka",
];
async function scrapeDentalClinics() {
    const stagehand = new Stagehand({
        env: "LOCAL",
        localBrowserLaunchOptions: {
            headless: false, // set to true when you're confident
            viewport: { width: 1440, height: 900 },
        },
        llmClient: new MiniMaxClient(), // using MiniMax M2.7
    });
    await stagehand.init();
    // Get the active page from the context
    const page = stagehand.context.activePage();
    if (!page) {
        throw new Error("No active page found. Make sure Chrome is running with debugging port enabled.");
    }
    const allClinics = [];
    for (const searchUrl of SEARCH_URLS) {
        console.log(`🌍 Searching: ${searchUrl}`);
        await page.goto(searchUrl);
        await page.waitForSelector("h1"); // results title
        // Scroll Google Maps results panel
        await stagehand.act("Scroll down the results panel for 3 seconds");
        await stagehand.act("Wait for new results to load");
        await stagehand.act("Scroll down the results panel for 3 seconds");
        await stagehand.act("Wait for new results to load");
        // Extract all dental chambers from the page using stagehand.extract
        const rawExtract = await stagehand.extract(`
        On this Google Maps page, there are several dental chambers/clinics in the side panel or map.
        For each dental chamber, extract:
        - Name of the clinic or doctor
        - Full address (city, area, road, house number, floor, landmark)
        - Phone number (if visible, otherwise null)
        - Google Maps rating (1-5) and number of reviews (if visible)
        - Clinic website URL (if shown)
        - The Google Maps URL for this dental chamber (link to its details page)

        Return an array of JSON objects, one per clinic.
        No extra text.
      `, z.array(ClinicSchema.pick({
            name: true,
            address: true,
            phone: true,
            rating: true,
            reviewsCount: true,
            website: true,
            googleMapsUrl: true,
        })));
        allClinics.push(...rawExtract);
    }
    // Save to JSON
    console.log(JSON.stringify(allClinics, null, 2));
    await stagehand.close();
}
scrapeDentalClinics().catch(console.error);
