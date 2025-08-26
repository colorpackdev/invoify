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
                    headless: true,
                });
            }
        } catch (chromiumError) {
            console.log("Chromium strategy failed, trying fallback:", chromiumError);
            // Strategy 3: Fallback to regular puppeteer
            try {
                const puppeteer = await import("puppeteer");
                browser = await puppeteer.launch({
                    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
                    headless: true,
                });
            } catch (fallbackError) {
                console.log("Fallback strategy failed, trying system Chrome:", fallbackError);
                // Strategy 4: Try system Chrome paths
                const systemChromePaths = [
                    '/usr/bin/google-chrome-stable',
                    '/usr/bin/google-chrome',
                    '/usr/bin/chromium-browser',
                    '/usr/bin/chromium',
                    '/snap/bin/chromium',
                    '/opt/google/chrome/chrome',
                    '/usr/local/bin/chrome',
                    '/usr/bin/chrome',
                    process.env.CHROME_EXECUTABLE_PATH
                ].filter(Boolean);

                console.log('Trying system Chrome paths:', systemChromePaths);
                
                for (const chromePath of systemChromePaths) {
                    try {
                        console.log(`Attempting to launch Chrome from: ${chromePath}`);
                        const puppeteer = await import("puppeteer-core");
                        browser = await puppeteer.launch({
                            args: [
                                "--no-sandbox", 
                                "--disable-setuid-sandbox", 
                                "--disable-dev-shm-usage",
                                "--disable-extensions",
                                "--disable-plugins",
                                "--disable-default-apps"
                            ],
                            executablePath: chromePath,
                            headless: true,
                            ignoreHTTPSErrors: true,
                        });
                        console.log(`✅ Successfully launched Chrome from: ${chromePath}`);
                        break;
                    } catch (systemError) {
                        const errorMessage = systemError instanceof Error ? systemError.message : String(systemError);
                        console.log(`❌ Failed to launch Chrome from ${chromePath}: ${errorMessage}`);
                        continue;
                    }
                }

                if (!browser) {
                    console.error("❌ All browser launch strategies failed. Diagnostics:");
                    console.error("1. @sparticuz/chromium failed - bundled Chrome not found");
                    console.error("2. Local puppeteer failed - missing system libraries");
                    console.error("3. System Chrome paths failed - Chrome not installed or not accessible");
                    console.error("\n🔧 To fix this issue, install Chrome/Chromium:");
                    console.error("Ubuntu/Debian: sudo apt-get install -y chromium-browser");
                    console.error("CentOS/RHEL: sudo yum install -y chromium");
                    console.error("Or set CHROME_EXECUTABLE_PATH environment variable");
                    throw new Error("All browser launch strategies failed. Please install Chrome/Chromium or set CHROME_EXECUTABLE_PATH environment variable.");
                }
            }
        }

        if (!browser) {
            throw new Error("Failed to launch browser");
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
        if (page) {
            try {
                await page.close();
            } catch (e) {
                console.error("Error closing page:", e);
            }
        }
        if (browser) {
            try {
                const pages = await browser.pages();
                await Promise.all(pages.map((p) => p.close()));
                await browser.close();
            } catch (e) {
                console.error("Error closing browser:", e);
            }
        }
    }
}