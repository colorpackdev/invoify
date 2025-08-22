import { NextRequest } from "next/server";

// Services
import { generatePackingListPdfService } from "@/services/packing-list/server/generatePackingListPdfService";

export async function POST(req: NextRequest) {
    const result = await generatePackingListPdfService(req);
    return result;
}