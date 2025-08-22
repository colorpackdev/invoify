import { PackingListType } from "@/lib/schemas/packingList";

/**
 * Generate a packing list PDF by sending data to the server.
 */
export async function generatePackingListPdf(data: PackingListType): Promise<Blob> {
    try {
        const response = await fetch("/api/packing-list/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Failed to generate packing list: ${response.statusText}`);
        }

        return await response.blob();
    } catch (error) {
        console.error("Error generating packing list PDF:", error);
        throw error;
    }
}

/**
 * Download the generated packing list PDF.
 */
export function downloadPackingListPdf(pdfBlob: Blob, filename: string) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate and download packing list PDF in one function.
 */
export async function generateAndDownloadPackingList(data: PackingListType) {
    try {
        const pdfBlob = await generatePackingListPdf(data);
        const filename = `packing-list-${data.packingListNumber}.pdf`;
        downloadPackingListPdf(pdfBlob, filename);
    } catch (error) {
        console.error("Error generating and downloading packing list:", error);
        throw error;
    }
}