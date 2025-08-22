"use client";

import { useEffect, useState } from "react";

// RHF
import { FieldArrayWithId, useFormContext, useWatch } from "react-hook-form";

// DnD
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ShadCn
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Components
import { BaseButton, FormInput, FormTextarea } from "@/app/components";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

// Icons
import { ChevronDown, ChevronUp, GripVertical, Trash2, Package, ChevronRight } from "lucide-react";

// Types
import { ItemType, NameType } from "@/types";

type SingleItemProps = {
    name: NameType;
    index: number;
    fields: ItemType[];
    field: FieldArrayWithId<ItemType>;
    moveFieldUp: (index: number) => void;
    moveFieldDown: (index: number) => void;
    removeField: (index: number) => void;
};

const SingleItem = ({
    name,
    index,
    fields,
    field,
    moveFieldUp,
    moveFieldDown,
    removeField,
}: SingleItemProps) => {
    const { control, setValue, watch } = useFormContext();
    const [isPhysicalExpanded, setIsPhysicalExpanded] = useState(false);

    const { _t } = useTranslationContext();

    // Items
    const itemName = useWatch({
        name: `${name}[${index}].name`,
        control,
    });

    const rate = useWatch({
        name: `${name}[${index}].unitPrice`,
        control,
    });

    const quantity = useWatch({
        name: `${name}[${index}].quantity`,
        control,
    });

    const total = useWatch({
        name: `${name}[${index}].total`,
        control,
    });

    // Physical product configuration
    const isPhysicalProduct = useWatch({
        name: `${name}[${index}].isPhysicalProduct`,
        control,
    });

    // Currency
    const currency = useWatch({
        name: `details.currency`,
        control,
    });

    useEffect(() => {
        // Calculate total when rate or quantity changes
        if (rate != undefined && quantity != undefined) {
            const calculatedTotal = (rate * quantity).toFixed(2);
            setValue(`${name}[${index}].total`, calculatedTotal);
        }
    }, [rate, quantity]);

    // DnD
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const boxDragClasses = isDragging
        ? "border-2 bg-gray-200 border-blue-600 dark:bg-slate-900 z-10"
        : "border";

    const gripDragClasses = isDragging
        ? "opacity-0 group-hover:opacity-100 transition-opacity cursor-grabbing"
        : "cursor-grab";

    return (
        <div
            style={style}
            {...attributes}
            className={`${boxDragClasses} group flex flex-col gap-y-5 p-3 my-2 cursor-default rounded-xl bg-gray-50 dark:bg-slate-800 dark:border-gray-600`}
        >
            {/* {isDragging && <div className="bg-blue-600 h-1 rounded-full"></div>} */}
            <div className="flex flex-wrap justify-between">
                {itemName != "" ? (
                    <p className="font-medium">
                        #{index + 1} - {itemName}
                    </p>
                ) : (
                    <p className="font-medium">#{index + 1} - Empty name</p>
                )}

                <div className="flex gap-3">
                    {/* Drag and Drop Button */}
                    <div
                        className={`${gripDragClasses} flex justify-center items-center`}
                        ref={setNodeRef}
                        {...listeners}
                    >
                        <GripVertical className="hover:text-blue-600" />
                    </div>

                    {/* Up Button */}
                    <BaseButton
                        size={"icon"}
                        tooltipLabel="Move the item up"
                        onClick={() => moveFieldUp(index)}
                        disabled={index === 0}
                    >
                        <ChevronUp />
                    </BaseButton>

                    {/* Down Button */}
                    <BaseButton
                        size={"icon"}
                        tooltipLabel="Move the item down"
                        onClick={() => moveFieldDown(index)}
                        disabled={index === fields.length - 1}
                    >
                        <ChevronDown />
                    </BaseButton>
                </div>
            </div>
            <div
                className="flex flex-wrap justify-between gap-y-5 gap-x-2"
                key={index}
            >
                <FormInput
                    name={`${name}[${index}].name`}
                    label={_t("form.steps.lineItems.name")}
                    placeholder="Item name"
                    vertical
                />

                <FormInput
                    name={`${name}[${index}].quantity`}
                    type="number"
                    label={_t("form.steps.lineItems.quantity")}
                    placeholder={_t("form.steps.lineItems.quantity")}
                    className="w-[8rem]"
                    vertical
                />

                <FormInput
                    name={`${name}[${index}].unitPrice`}
                    type="number"
                    label={_t("form.steps.lineItems.rate")}
                    labelHelper={`(${currency})`}
                    placeholder={_t("form.steps.lineItems.rate")}
                    className="w-[8rem]"
                    vertical
                />

                <div className="flex flex-col gap-2">
                    <div>
                        <Label>{_t("form.steps.lineItems.total")}</Label>
                    </div>
                    <Input
                        value={`${total} ${currency}`}
                        readOnly
                        placeholder="Item total"
                        className="border-none font-medium text-lg bg-transparent"
                        size={10}
                    />
                </div>
            </div>
            <FormTextarea
                name={`${name}[${index}].description`}
                label={_t("form.steps.lineItems.description")}
                placeholder="Item description"
            />

            {/* Physical Product Configuration */}
            <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id={`physical-${index}`}
                            checked={isPhysicalProduct || false}
                            onCheckedChange={(checked) => {
                                setValue(`${name}[${index}].isPhysicalProduct`, checked);
                                if (checked) setIsPhysicalExpanded(true);
                            }}
                        />
                        <Label htmlFor={`physical-${index}`} className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {_t("physicalProduct.title")}
                        </Label>
                    </div>
                </div>

                {isPhysicalProduct && (
                    <Collapsible open={isPhysicalExpanded} onOpenChange={setIsPhysicalExpanded}>
                        <CollapsibleTrigger asChild>
                            <BaseButton variant="outline" size="sm" className="mb-3">
                                <ChevronRight className={`w-4 h-4 transition-transform ${isPhysicalExpanded ? 'rotate-90' : ''}`} />
                                {_t("physicalProduct.configureDetails")}
                            </BaseButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                {/* Weight Configuration */}
                                <div className="col-span-2">
                                    <h4 className="font-medium mb-2">{_t("physicalProduct.weightAndDimensions")}</h4>
                                </div>
                                
                                <div className="flex gap-2">
                                    <FormInput
                                        name={`${name}[${index}].physicalDetails.unitWeight`}
                                        type="number"
                                        label={_t("physicalProduct.unitWeight")}
                                        placeholder={_t("physicalProduct.unitPlaceholder")}
                                        step="0.1"
                                        className="flex-1"
                                        vertical
                                    />
                                    <div className="flex flex-col gap-2">
                                        <Label>{_t("physicalProduct.units.weight.kg")}</Label>
                                        <Select
                                            value={watch(`${name}[${index}].physicalDetails.weightUnit`) || "kg"}
                                            onValueChange={(value) => setValue(`${name}[${index}].physicalDetails.weightUnit`, value)}
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kg">{_t("physicalProduct.units.weight.kg")}</SelectItem>
                                                <SelectItem value="lb">{_t("physicalProduct.units.weight.lb")}</SelectItem>
                                                <SelectItem value="g">{_t("physicalProduct.units.weight.g")}</SelectItem>
                                                <SelectItem value="oz">{_t("physicalProduct.units.weight.oz")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Dimensions */}
                                <div className="col-span-2">
                                    <Label className="mb-2 block">{_t("physicalProduct.dimensionsLabel")}</Label>
                                    <div className="flex gap-2 items-end">
                                        <FormInput
                                            name={`${name}[${index}].physicalDetails.dimensions.length`}
                                            type="number"
                                            placeholder={_t("physicalProduct.dimensionsPlaceholders.length")}
                                            step="0.1"
                                            className="flex-1"
                                        />
                                        <span className="text-gray-400">×</span>
                                        <FormInput
                                            name={`${name}[${index}].physicalDetails.dimensions.width`}
                                            type="number"
                                            placeholder={_t("physicalProduct.dimensionsPlaceholders.width")}
                                            step="0.1"
                                            className="flex-1"
                                        />
                                        <span className="text-gray-400">×</span>
                                        <FormInput
                                            name={`${name}[${index}].physicalDetails.dimensions.height`}
                                            type="number"
                                            placeholder={_t("physicalProduct.dimensionsPlaceholders.height")}
                                            step="0.1"
                                            className="flex-1"
                                        />
                                        <Select
                                            value={watch(`${name}[${index}].physicalDetails.dimensions.unit`) || "cm"}
                                            onValueChange={(value) => setValue(`${name}[${index}].physicalDetails.dimensions.unit`, value)}
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cm">{_t("physicalProduct.units.dimensions.cm")}</SelectItem>
                                                <SelectItem value="in">{_t("physicalProduct.units.dimensions.in")}</SelectItem>
                                                <SelectItem value="m">{_t("physicalProduct.units.dimensions.m")}</SelectItem>
                                                <SelectItem value="ft">{_t("physicalProduct.units.dimensions.ft")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Customs Information */}
                                <div className="col-span-2">
                                    <h4 className="font-medium mb-2 mt-2">{_t("physicalProduct.customsAndLegal")}</h4>
                                </div>
                                
                                <FormInput
                                    name={`${name}[${index}].physicalDetails.hsCode`}
                                    label={_t("physicalProduct.hsCode")}
                                    placeholder={_t("physicalProduct.hsCodePlaceholder")}
                                    vertical
                                />
                                
                                <FormInput
                                    name={`${name}[${index}].physicalDetails.countryOfOrigin`}
                                    label={_t("physicalProduct.countryOfOrigin")}
                                    placeholder={_t("physicalProduct.countryPlaceholder")}
                                    vertical
                                />

                                {/* Special Handling */}
                                <div className="col-span-2">
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Checkbox 
                                            id={`special-${index}`}
                                            checked={watch(`${name}[${index}].physicalDetails.requiresSpecialHandling`) || false}
                                            onCheckedChange={(checked) => 
                                                setValue(`${name}[${index}].physicalDetails.requiresSpecialHandling`, checked)
                                            }
                                        />
                                        <Label htmlFor={`special-${index}`}>
                                            {_t("physicalProduct.requiresSpecialHandling")}
                                        </Label>
                                    </div>
                                    
                                    {watch(`${name}[${index}].physicalDetails.requiresSpecialHandling`) && (
                                        <FormTextarea
                                            name={`${name}[${index}].physicalDetails.handlingNotes`}
                                            label={_t("physicalProduct.handlingNotes")}
                                            placeholder={_t("physicalProduct.handlingNotesPlaceholder")}
                                            className="mt-2"
                                        />
                                    )}
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>

            <div>
                {/* Not allowing deletion for first item when there is only 1 item */}
                {fields.length > 1 && (
                    <BaseButton
                        variant="destructive"
                        onClick={() => removeField(index)}
                    >
                        <Trash2 />
                        {_t("form.steps.lineItems.removeItem")}
                    </BaseButton>
                )}
            </div>
        </div>
    );
};

export default SingleItem;
