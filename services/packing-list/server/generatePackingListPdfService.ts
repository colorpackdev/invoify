import { NextRequest, NextResponse } from "next/server";

// Chromium
import chromium from "@sparticuz/chromium";

// Helpers
import { getPackingListTemplate } from "@/lib/helpers";

// Variables
import { CHROMIUM_EXECUTABLE_PATH, ENV, TAILWIND_CDN } from "@/lib/variables";

// Types
import { PackingListType } from "@/lib/schemas/packingList";

/**
 * Generate a PDF document of a packing list based on the provided data.
 *
 * @async
 * @param {NextRequest} req - The Next.js request object.
 * @throws {Error} If there is an error during the PDF generation process.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object containing the generated PDF.
 */
export async function generatePackingListPdfService(req: NextRequest) {
    const body: PackingListType = await req.json();
    let browser;
    let page;

    try {
        const ReactDOMServer = (await import("react-dom/server")).default;
        const templateId = body.pdfTemplate || 1;
        const PackingListTemplate = await getPackingListTemplate(templateId);
        
        if (!PackingListTemplate) {
            throw new Error(`Failed to load packing list template ${templateId}`);
        }
        
        const htmlTemplate = ReactDOMServer.renderToStaticMarkup(PackingListTemplate(body));

        // Try multiple browser launch strategies
        try {
            // Strategy 1: Production with @sparticuz/chromium
            if (ENV === "production") {
                const puppeteer = await import("puppeteer-core");
                browser = await puppeteer.launch({
                    args: [...chromium.args, "--disable-dev-shm-usage"],
                    defaultViewport: chromium.defaultViewport,
                    executablePath: await chromium.executablePath(),
                    headless: true,
                    ignoreHTTPSErrors: true,
                });
            } else {
                // Strategy 2: Development with local puppeteer
                const puppeteer = await import("puppeteer");
                browser = await puppeteer.launch({
                    args: ["--no-sandbox", "--disable-setuid-sandbox"],
                    headless: "new",
                });
            }
        } catch (chromiumError) {
            console.log("Chromium strategy failed, trying fallback:", chromiumError);
            // Strategy 3: Fallback to regular puppeteer
            try {
                const puppeteer = await import("puppeteer");
                browser = await puppeteer.launch({
                    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
                    headless: "new",
                });
            } catch (fallbackError) {
                console.log("Fallback strategy failed, trying core without chromium:", fallbackError);
                // Strategy 4: Last resort - puppeteer-core without chromium.executablePath
                const puppeteer = await import("puppeteer-core");
                browser = await puppeteer.launch({
                    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
                    headless: true,
                    ignoreHTTPSErrors: true,
                });
            }
        }

        page = await browser.newPage();
        await page.setContent(htmlTemplate, {
            waitUntil: ["networkidle0", "load", "domcontentloaded"],
            timeout: 30000,
        });

        await page.addStyleTag({
            url: TAILWIND_CDN,
        });

        const pdfBuffer = await page.pdf({
            format: "a4",
            printBackground: true,
            preferCSSPageSize: true,
        });

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="packing-list-${body.packingListNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating packing list PDF:", error);
        return NextResponse.json(
            { error: "Failed to generate packing list PDF" },
            { status: 500 }
        );
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
}