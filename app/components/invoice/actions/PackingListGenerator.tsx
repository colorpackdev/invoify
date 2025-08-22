"use client";

import { useState, useMemo } from "react";

// RHF
import { useFormContext, FormProvider, useForm } from "react-hook-form";

// ShadCn
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Components
import { BaseButton, PackingListTemplateSelector } from "@/app/components";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

// Services
import { generateAndDownloadPackingList } from "@/services/packing-list/client/generatePackingList";

// Helpers
import { generatePackingListFromInvoice, calculatePackingListTotals } from "@/lib/helpers/packingList";
import { 
    hasPhysicalItems, 
    getItemClassificationSummary, 
    suggestPackageConfiguration,
    classifyItem
} from "@/lib/helpers/itemClassification";

// Types
import { InvoiceType } from "@/types";
import { PackingListType } from "@/lib/schemas/packingList";

// Icons
import { Package, Download, Info, AlertTriangle, CheckCircle, Truck } from "lucide-react";

export default function PackingListGenerator() {
    const { getValues } = useFormContext<InvoiceType>();
    const { _t } = useTranslationContext();
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [packingListData, setPackingListData] = useState<PackingListType | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    
    // Form for packing list template selection
    const packingListForm = useForm<PackingListType>({
        defaultValues: {
            pdfTemplate: 1,
        }
    });

    const handleGeneratePackingList = () => {
        // Get fresh data when opening the modal
        const currentInvoiceData = getValues();
        const generatedData = generatePackingListFromInvoice(currentInvoiceData) as PackingListType;
        setPackingListData(generatedData);
        
        // Update form with generated data
        packingListForm.reset({
            ...generatedData,
            pdfTemplate: 1,
        });
        
        // Pre-select items that look like physical products (but user can change)
        const suggestedItems = currentInvoiceData.details.items
            .map((_, index) => index.toString())
            .filter((_, index) => classifyItem(currentInvoiceData.details.items[index]) === 'physical');
        setSelectedItems(suggestedItems);
        setIsOpen(true);
    };

    const handleDownloadPackingList = async () => {
        if (!packingListData || selectedItems.length === 0) return;

        setIsGenerating(true);
        try {
            // Get current invoice data and filter selected items
            const currentInvoiceData = getValues();
            const selectedInvoiceItems = selectedItems.map(index => 
                currentInvoiceData.details.items[parseInt(index)]
            ).filter(Boolean);

            // Create a filtered invoice with only selected items
            const filteredInvoice = {
                ...currentInvoiceData,
                details: {
                    ...currentInvoiceData.details,
                    items: selectedInvoiceItems
                }
            };

            // Generate packing list with filtered data and include template selection
            const basePackingListData = generatePackingListFromInvoice(filteredInvoice) as PackingListType;
            const formData = packingListForm.getValues();
            
            const finalPackingListData = {
                ...basePackingListData,
                pdfTemplate: formData.pdfTemplate || 1,
            };
            
            await generateAndDownloadPackingList(finalPackingListData);
        } catch (error) {
            console.error("Error generating packing list:", error);
        } finally {
            setIsGenerating(false);
            setIsOpen(false);
        }
    };

    const toggleItemSelection = (index: string) => {
        setSelectedItems(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const getClassificationBadge = (classification: string) => {
        switch (classification) {
            case 'physical':
                return <Badge variant="default" className="bg-green-100 text-green-800">{_t("packingList.selectItems.badges.physicalProduct")}</Badge>;
            case 'service':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{_t("packingList.selectItems.badges.service")}</Badge>;
            default:
                return <Badge variant="outline">{_t("packingList.selectItems.badges.unknown")}</Badge>;
        }
    };

    return (
        <>
            <BaseButton
                tooltipLabel={_t("actions.packingList")}
                onClick={handleGeneratePackingList}
                size="sm"
                variant={"outline"}
            >
                <Package className="w-5 h-5" />
                {_t("actions.packingList")}
            </BaseButton>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            {_t("packingList.title")}
                        </DialogTitle>
                        <DialogDescription>
                            {_t("packingList.description")}
                        </DialogDescription>
                    </DialogHeader>

                    <FormProvider {...packingListForm}>

                    <div className="space-y-6">
                        {/* Items Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{_t("packingList.selectItems.title")}</CardTitle>
                                <CardDescription>
                                    {_t("packingList.selectItems.description")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {getValues().details.items.map((item, index) => {
                                        const classification = classifyItem(item);
                                        const isSelected = selectedItems.includes(index.toString());
                                        
                                        return (
                                            <div 
                                                key={index} 
                                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => toggleItemSelection(index.toString())}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleItemSelection(index.toString())}
                                                                className="w-4 h-4"
                                                            />
                                                            <h4 className="font-semibold">{item.name}</h4>
                                                            {getClassificationBadge(classification)}
                                                        </div>
                                                        {item.description && (
                                                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                                        )}
                                                        <div className="text-sm text-gray-500">
                                                            Quantity: {item.quantity} | Unit Price: ${item.unitPrice}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {selectedItems.length === 0 && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <div className="flex">
                                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                            <div className="ml-3">
                                                <p className="text-sm text-yellow-800">
                                                    {_t("packingList.selectItems.noItemsSelected")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Shipping Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{_t("packingList.shippingInfo.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="carrier">{_t("packingList.shippingInfo.carrier")}</Label>
                                        <Input
                                            id="carrier"
                                            placeholder={_t("packingList.shippingInfo.carrierPlaceholder")}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="trackingNumber">{_t("packingList.shippingInfo.trackingNumber")}</Label>
                                        <Input
                                            id="trackingNumber"
                                            placeholder={_t("packingList.shippingInfo.trackingPlaceholder")}
                                        />
                                    </div>
                                    <div>
                                        <Label>{_t("packingList.shippingInfo.shippingMethod")}</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder={_t("packingList.shippingInfo.shippingMethodPlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="air">{_t("packingList.shippingInfo.methods.air")}</SelectItem>
                                                <SelectItem value="sea">{_t("packingList.shippingInfo.methods.sea")}</SelectItem>
                                                <SelectItem value="road">{_t("packingList.shippingInfo.methods.road")}</SelectItem>
                                                <SelectItem value="express">{_t("packingList.shippingInfo.methods.express")}</SelectItem>
                                                <SelectItem value="standard">{_t("packingList.shippingInfo.methods.standard")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>{_t("packingList.shippingInfo.incoterms")}</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder={_t("packingList.shippingInfo.incotermsPlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EXW">{_t("packingList.shippingInfo.incotermsList.EXW")}</SelectItem>
                                                <SelectItem value="FOB">{_t("packingList.shippingInfo.incotermsList.FOB")}</SelectItem>
                                                <SelectItem value="CIF">{_t("packingList.shippingInfo.incotermsList.CIF")}</SelectItem>
                                                <SelectItem value="DDP">{_t("packingList.shippingInfo.incotermsList.DDP")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Package Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{_t("packingList.packageConfig.title")}</CardTitle>
                                <CardDescription>
                                    {_t("packingList.packageConfig.description")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>{_t("packingList.packageConfig.packageType")}</Label>
                                            <Select defaultValue="box">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="box">{_t("packingList.packageConfig.types.box")}</SelectItem>
                                                    <SelectItem value="crate">{_t("packingList.packageConfig.types.crate")}</SelectItem>
                                                    <SelectItem value="pallet">{_t("packingList.packageConfig.types.pallet")}</SelectItem>
                                                    <SelectItem value="bag">{_t("packingList.packageConfig.types.bag")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>{_t("packingList.packageConfig.grossWeight")}</Label>
                                            <Input type="number" placeholder="0.0" step="0.1" />
                                        </div>
                                        <div>
                                            <Label>{_t("packingList.packageConfig.netWeight")}</Label>
                                            <Input type="number" placeholder="0.0" step="0.1" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label>{_t("packingList.packageConfig.dimensions")}</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input type="number" placeholder={_t("packingList.packageConfig.dimensionsPlaceholder.length")} />
                                            <Input type="number" placeholder={_t("packingList.packageConfig.dimensionsPlaceholder.width")} />
                                            <Input type="number" placeholder={_t("packingList.packageConfig.dimensionsPlaceholder.height")} />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>{_t("packingList.packageConfig.specialInstructions")}</Label>
                                        <Textarea
                                            placeholder={_t("packingList.packageConfig.specialInstructionsPlaceholder")}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Template Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{_t("packingList.template.title") || "Template Selection"}</CardTitle>
                                <CardDescription>
                                    {_t("packingList.template.description") || "Choose the layout for your packing list"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PackingListTemplateSelector />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Generate Button */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-600">
                            {selectedItems.length} {_t("packingList.selectItems.itemsSelected")}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                {_t("packingList.buttons.cancel")}
                            </Button>
                            <Button 
                                onClick={handleDownloadPackingList}
                                disabled={isGenerating || selectedItems.length === 0}
                            >
                                {isGenerating ? (
                                    _t("packingList.buttons.generating")
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        {_t("packingList.buttons.generatePdf")}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    </FormProvider>
                </DialogContent>
            </Dialog>
        </>
    );
}