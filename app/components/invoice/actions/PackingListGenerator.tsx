"use client";

import React, { useState, useMemo } from "react";

// RHF
import { useFormContext, FormProvider, useForm, Controller } from "react-hook-form";

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
import { BaseButton, PackingListTemplateSelector, FormFile } from "@/app/components";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";
import { useInvoiceContext } from "@/contexts/InvoiceContext";

// Hooks
import useToasts from "@/hooks/useToasts";

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
import { Package, Download, Info, AlertTriangle, CheckCircle, Truck, Save } from "lucide-react";

// Variables
import { SHORT_DATE_OPTIONS } from "@/lib/variables";

export default function PackingListGenerator() {
    const { getValues } = useFormContext<InvoiceType>();
    const { _t } = useTranslationContext();
    const { generatePackingListPdf, packingListPdfLoading } = useInvoiceContext();
    const [isOpen, setIsOpen] = useState(false);
    const [packingListData, setPackingListData] = useState<PackingListType | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [savedPackingLists, setSavedPackingLists] = useState<PackingListType[]>([]);
    
    // Toasts
    const { saveInvoiceSuccess, modifiedInvoiceSuccess } = useToasts();
    
    // Form for packing list template selection
    const packingListForm = useForm<PackingListType>({
        defaultValues: {
            pdfTemplate: 1,
        }
    });

    // Load saved packing lists on component mount
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedPackingListsJSON = window.localStorage.getItem("savedPackingLists");
            const saved = savedPackingListsJSON ? JSON.parse(savedPackingListsJSON) : [];
            setSavedPackingLists(saved);
        }
    }, []);

    const handleGeneratePackingList = () => {
        // Get fresh data when opening the modal
        const currentInvoiceData = getValues();
        const generatedData = generatePackingListFromInvoice(currentInvoiceData) as PackingListType;
        setPackingListData(generatedData);
        
        // Check if there's already a saved packing list for this invoice
        const savedPackingListsJSON = localStorage.getItem("savedPackingLists");
        const existingSavedLists = savedPackingListsJSON ? JSON.parse(savedPackingListsJSON) : [];
        const existingSavedList = existingSavedLists.find(
            (pl: any) => pl.invoiceNumber === currentInvoiceData.details.invoiceNumber
        );

        if (existingSavedList) {
            // Load saved packing list data
            packingListForm.reset({
                ...existingSavedList,
                pdfTemplate: existingSavedList.pdfTemplate || 1,
                logo: existingSavedList.logo || currentInvoiceData.details.invoiceLogo, // Use saved logo or fallback to invoice logo
            });
            
            // Restore selected items if they exist
            if (existingSavedList._selectedItems) {
                setSelectedItems(existingSavedList._selectedItems);
            } else {
                // Fall back to physical items if no selection was saved
                const suggestedItems = currentInvoiceData.details.items
                    .map((_, index) => index.toString())
                    .filter((_, index) => classifyItem(currentInvoiceData.details.items[index]) === 'physical');
                setSelectedItems(suggestedItems);
            }
        } else {
            // No saved data, use defaults
            packingListForm.reset({
                ...generatedData,
                pdfTemplate: 1,
                logo: currentInvoiceData.details.invoiceLogo, // Use logo from current invoice
            });
            
            // Pre-select items that look like physical products (but user can change)
            const suggestedItems = currentInvoiceData.details.items
                .map((_, index) => index.toString())
                .filter((_, index) => classifyItem(currentInvoiceData.details.items[index]) === 'physical');
            setSelectedItems(suggestedItems);
        }
        
        setIsOpen(true);
    };

    const handleGeneratePackingListPdf = async () => {
        if (!packingListData || selectedItems.length === 0) return;

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
                ...formData,
                pdfTemplate: formData.pdfTemplate || 1,
            };
            
            // Use the context to generate PDF
            await generatePackingListPdf(finalPackingListData);
            setIsOpen(false);
        } catch (error) {
            console.error("Error generating packing list:", error);
        }
    };

    const toggleItemSelection = (index: string) => {
        setSelectedItems(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const savePackingList = () => {
        if (!packingListData || selectedItems.length === 0) return;

        // Get current form data
        const formData = packingListForm.getValues();
        
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

        // Generate complete packing list data
        const basePackingListData = generatePackingListFromInvoice(filteredInvoice) as PackingListType;
        
        const updatedDate = new Date().toLocaleDateString("en-US", SHORT_DATE_OPTIONS);
        
        const completePackingListData = {
            ...basePackingListData,
            ...formData,
            packingListDate: updatedDate,
            // Store the selected item indices so we can restore them when loading
            _selectedItems: selectedItems,
        };

        // Get existing packing lists from localStorage
        const savedPackingListsJSON = localStorage.getItem("savedPackingLists");
        const existingPackingLists = savedPackingListsJSON ? JSON.parse(savedPackingListsJSON) : [];

        // Check if packing list already exists (by packing list number or invoice number)
        const existingIndex = existingPackingLists.findIndex(
            (pl: PackingListType) => 
                pl.packingListNumber === completePackingListData.packingListNumber ||
                pl.invoiceNumber === completePackingListData.invoiceNumber
        );

        if (existingIndex !== -1) {
            // Update existing packing list
            existingPackingLists[existingIndex] = completePackingListData;
            modifiedInvoiceSuccess();
        } else {
            // Add new packing list
            existingPackingLists.push(completePackingListData);
            saveInvoiceSuccess();
        }

        // Save to localStorage
        localStorage.setItem("savedPackingLists", JSON.stringify(existingPackingLists));
        setSavedPackingLists(existingPackingLists);
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
                                        <Controller
                                            name="shippingInfo.carrier"
                                            control={packingListForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id="carrier"
                                                    placeholder={_t("packingList.shippingInfo.carrierPlaceholder")}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="trackingNumber">{_t("packingList.shippingInfo.trackingNumber")}</Label>
                                        <Controller
                                            name="shippingInfo.trackingNumber"
                                            control={packingListForm.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id="trackingNumber"
                                                    placeholder={_t("packingList.shippingInfo.trackingPlaceholder")}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Label>{_t("packingList.shippingInfo.shippingMethod")}</Label>
                                        <Controller
                                            name="shippingInfo.shippingMethod"
                                            control={packingListForm.control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Label>{_t("packingList.shippingInfo.incoterms")}</Label>
                                        <Controller
                                            name="shippingInfo.incoterms"
                                            control={packingListForm.control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                            )}
                                        />
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
                                            <Controller
                                                name="packages.0.packageType"
                                                control={packingListForm.control}
                                                defaultValue="box"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value} defaultValue="box">
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
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <Label>{_t("packingList.packageConfig.grossWeight")}</Label>
                                            <Controller
                                                name="packages.0.grossWeight"
                                                control={packingListForm.control}
                                                render={({ field }) => (
                                                    <Input {...field} type="number" placeholder="0.0" step="0.1" />
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <Label>{_t("packingList.packageConfig.netWeight")}</Label>
                                            <Controller
                                                name="packages.0.netWeight"
                                                control={packingListForm.control}
                                                render={({ field }) => (
                                                    <Input {...field} type="number" placeholder="0.0" step="0.1" />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label>{_t("packingList.packageConfig.dimensions")}</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Controller
                                                name="packages.0.dimensions.length"
                                                control={packingListForm.control}
                                                render={({ field }) => (
                                                    <Input {...field} type="number" placeholder={_t("packingList.packageConfig.dimensionsPlaceholder.length")} />
                                                )}
                                            />
                                            <Controller
                                                name="packages.0.dimensions.width"
                                                control={packingListForm.control}
                                                render={({ field }) => (
                                                    <Input {...field} type="number" placeholder={_t("packingList.packageConfig.dimensionsPlaceholder.width")} />
                                                )}
                                            />
                                            <Controller
                                                name="packages.0.dimensions.height"
                                                control={packingListForm.control}
                                                render={({ field }) => (
                                                    <Input {...field} type="number" placeholder={_t("packingList.packageConfig.dimensionsPlaceholder.height")} />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>{_t("packingList.packageConfig.specialInstructions")}</Label>
                                        <Controller
                                            name="specialInstructions"
                                            control={packingListForm.control}
                                            render={({ field }) => (
                                                <Textarea
                                                    {...field}
                                                    placeholder={_t("packingList.packageConfig.specialInstructionsPlaceholder")}
                                                    rows={3}
                                                />
                                            )}
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

                        {/* Logo */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{_t("packingList.logo.title")}</CardTitle>
                                <CardDescription>
                                    {_t("packingList.logo.description")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Controller
                                    name="logo"
                                    control={packingListForm.control}
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{_t("packingList.logo.label")}</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                            field.onChange(reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                            {field.value && (
                                                <img
                                                    src={field.value}
                                                    alt="Logo preview"
                                                    className="mt-2 max-h-20 max-w-40 object-contain"
                                                />
                                            )}
                                        </div>
                                    )}
                                />
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
                                variant="outline"
                                onClick={savePackingList}
                                disabled={!packingListData || selectedItems.length === 0}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {_t("packingList.buttons.save")}
                            </Button>
                            <Button 
                                onClick={handleGeneratePackingListPdf}
                                disabled={packingListPdfLoading || selectedItems.length === 0}
                            >
                                {packingListPdfLoading ? (
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