"use client";

// Debounce
import { useDebounce } from "use-debounce";

// RHF
import { useFormContext } from "react-hook-form";

// Components
import { TabbedPdfViewer, LivePreview } from "@/app/components";

// Contexts
import { useInvoiceContext } from "@/contexts/InvoiceContext";

// Types
import { InvoiceType } from "@/types";

const PdfViewer = () => {
    const { invoicePdf, packingListPdf } = useInvoiceContext();

    const { watch } = useFormContext<InvoiceType>();

    const [debouncedWatch] = useDebounce(watch, 1000);
    const formValues = debouncedWatch();

    const hasPdf = invoicePdf.size > 0 || packingListPdf.size > 0;

    return (
        <div className="my-3">
            {!hasPdf ? (
                <LivePreview data={formValues} />
            ) : (
                <TabbedPdfViewer />
            )}
        </div>
    );
};

export default PdfViewer;
