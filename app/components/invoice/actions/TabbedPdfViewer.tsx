"use client";

import { useState } from "react";

// ShadCn
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import { BaseButton, SendPdfToEmailModal, Subheading } from "@/app/components";

// Contexts
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useTranslationContext } from "@/contexts/TranslationContext";

// Icons
import {
    BookmarkIcon,
    DownloadCloudIcon,
    Eye,
    Mail,
    MoveLeft,
    Printer,
    FileText,
    Package,
} from "lucide-react";

export default function TabbedPdfViewer() {
    const {
        pdfUrl,
        packingListPdfUrl,
        packingListData,
        activeTab,
        setActiveTab,
        removeFinalPdf,
        removePackingListPdf,
        previewPdfInTab,
        previewPackingListPdfInTab,
        downloadPdf,
        downloadPackingListPdf,
        printPdf,
        printPackingListPdf,
        saveInvoice,
        sendPdfToMail,
        sendPackingListPdfToMail,
    } = useInvoiceContext();
    
    const { _t } = useTranslationContext();

    const hasInvoicePdf = pdfUrl && pdfUrl.length > 0;
    const hasPackingListPdf = packingListPdfUrl && packingListPdfUrl.length > 0;

    if (!hasInvoicePdf && !hasPackingListPdf) {
        return null;
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value as "invoice" | "packing-list");
    };

    const renderInvoiceContent = () => (
        <div className="space-y-4">
            <div className="flex items-center mb-3">
                <BaseButton
                    variant={"ghost"}
                    size="sm"
                    onClick={removeFinalPdf}
                >
                    <MoveLeft className="w-5 h-5" />
                    {_t("packingList.pdf.backToPreview")}
                </BaseButton>
            </div>

            {/* Invoice Buttons */}
            <div className="flex flex-wrap gap-2 my-1">
                <BaseButton
                    tooltipLabel={_t("packingList.pdf.tooltips.previewInvoice")}
                    onClick={previewPdfInTab}
                    size="sm"
                    variant={"outline"}
                >
                    <Eye className="w-5 h-5" />
                    {_t("packingList.buttons.preview")}
                </BaseButton>
                <BaseButton
                    tooltipLabel={_t("packingList.pdf.tooltips.downloadInvoice")}
                    onClick={downloadPdf}
                    size="sm"
                    variant={"outline"}
                >
                    <DownloadCloudIcon className="w-5 h-5" />
                    {_t("packingList.buttons.download")}
                </BaseButton>

                <BaseButton
                    tooltipLabel={_t("packingList.pdf.tooltips.printInvoice")}
                    onClick={printPdf}
                    size="sm"
                    variant={"outline"}
                >
                    <Printer className="w-5 h-5" />
                    {_t("packingList.buttons.print")}
                </BaseButton>

                <BaseButton
                    tooltipLabel={_t("packingList.pdf.tooltips.saveInvoice")}
                    onClick={saveInvoice}
                    size="sm"
                    variant={"outline"}
                >
                    <BookmarkIcon className="w-5 h-5" />
                    {_t("packingList.buttons.save")}
                </BaseButton>

                <SendPdfToEmailModal sendPdfToMail={sendPdfToMail}>
                    <BaseButton
                        tooltipLabel={_t("packingList.pdf.tooltips.sendInvoiceToMail")}
                        size="sm"
                        variant={"outline"}
                    >
                        <Mail className="w-5 h-5" />
                        {_t("packingList.buttons.sendToMail")}
                    </BaseButton>
                </SendPdfToEmailModal>
            </div>
            
            <AspectRatio ratio={1 / 1.4}>
                <iframe
                    className="h-full w-full rounded-xl"
                    src={`${pdfUrl}#toolbar=0`}
                />
            </AspectRatio>
        </div>
    );

    const renderPackingListContent = () => (
        <div className="space-y-4">
            <div className="flex items-center mb-3">
                <BaseButton
                    variant={"ghost"}
                    size="sm"
                    onClick={removePackingListPdf}
                >
                    <MoveLeft className="w-5 h-5" />
                    {_t("packingList.pdf.removePackingListPdf")}
                </BaseButton>
            </div>

            {/* Packing List Buttons */}
            <div className="flex flex-wrap gap-2 my-1">
                <BaseButton
                    tooltipLabel={_t("packingList.pdf.tooltips.previewPackingList")}
                    onClick={previewPackingListPdfInTab}
                    size="sm"
                    variant={"outline"}
                >
                    <Eye className="w-5 h-5" />
                    {_t("packingList.buttons.preview")}
                </BaseButton>
                <BaseButton
                    tooltipLabel={_t("packingList.pdf.tooltips.downloadPackingList")}
                    onClick={downloadPackingListPdf}
                    size="sm"
                    variant={"outline"}
                >
                    <DownloadCloudIcon className="w-5 h-5" />
                    {_t("packingList.buttons.download")}
                </BaseButton>

                <BaseButton
                    tooltipLabel={_t("packingList.pdf.tooltips.printPackingList")}
                    onClick={printPackingListPdf}
                    size="sm"
                    variant={"outline"}
                >
                    <Printer className="w-5 h-5" />
                    {_t("packingList.buttons.print")}
                </BaseButton>

                <SendPdfToEmailModal sendPdfToMail={sendPackingListPdfToMail}>
                    <BaseButton
                        tooltipLabel={_t("packingList.pdf.tooltips.sendPackingListToMail")}
                        size="sm"
                        variant={"outline"}
                    >
                        <Mail className="w-5 h-5" />
                        {_t("packingList.buttons.sendToMail")}
                    </BaseButton>
                </SendPdfToEmailModal>
            </div>
            
            <AspectRatio ratio={1 / 1.4}>
                <iframe
                    className="h-full w-full rounded-xl"
                    src={`${packingListPdfUrl}#toolbar=0`}
                />
            </AspectRatio>
        </div>
    );

    // If only one PDF exists, show it without tabs
    if (hasInvoicePdf && !hasPackingListPdf) {
        return (
            <>
                <Subheading>{_t("packingList.pdf.tabs.invoicePdf")}</Subheading>
                {renderInvoiceContent()}
            </>
        );
    }

    if (!hasInvoicePdf && hasPackingListPdf) {
        return (
            <>
                <Subheading>{_t("packingList.pdf.tabs.packingListPdf")}</Subheading>
                {renderPackingListContent()}
            </>
        );
    }

    // Both PDFs exist, show tabbed interface
    return (
        <>
            <Subheading>{_t("packingList.pdf.tabs.pdfDocuments")}</Subheading>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="invoice" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {_t("packingList.pdf.tabs.invoice")}
                    </TabsTrigger>
                    <TabsTrigger value="packing-list" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {_t("packingList.pdf.tabs.packingList")}
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="invoice" className="mt-4">
                    {renderInvoiceContent()}
                </TabsContent>
                
                <TabsContent value="packing-list" className="mt-4">
                    {renderPackingListContent()}
                </TabsContent>
            </Tabs>
        </>
    );
}