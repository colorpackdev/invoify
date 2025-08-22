"use client";

import Image from "next/image";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Components
import {
    BaseButton,
    PackingListTemplate1,
    PackingListTemplate2,
} from "@/app/components";

// Template images
import template1 from "@/public/assets/img/packing-list-1-example.png";
import template2 from "@/public/assets/img/packing-list-2-example.png";

// Icons
import { Check } from "lucide-react";

// Types
import { PackingListType } from "@/lib/schemas/packingList";

const PackingListTemplateSelector = () => {
    const { watch, setValue } = useFormContext<PackingListType>();
    const formValues = watch();
    
    const templates = [
        {
            id: 1,
            name: "Template 1",
            description: "Professional blue theme with organized sections",
            img: template1,
            component: <PackingListTemplate1 {...formValues} />,
        },
        {
            id: 2,
            name: "Template 2",
            description: "Clean minimalist design with clear structure", 
            img: template2,
            component: <PackingListTemplate2 {...formValues} />,
        },
    ];

    return (
        <>
            <div>
                <Label>Choose Packing List Template:</Label>

                <div>
                    <Card>
                        <CardHeader>
                            Packing List Templates
                            <CardDescription>
                                Select one of the predefined templates for your packing list
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="">
                            <div className="flex overflow-x-auto gap-6">
                                {templates.map((template, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col flex-shrink-0 gap-y-3 min-w-[300px]"
                                    >
                                        <div className="text-center">
                                            <p className="font-semibold text-lg">{template.name}</p>
                                            <p className="text-sm text-gray-600">{template.description}</p>
                                        </div>

                                        <div className="relative">
                                            {formValues.pdfTemplate === template.id && (
                                                <div className="shadow-lg absolute right-2 top-2 rounded-full bg-blue-500 p-2 z-10">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                            
                                            <Image
                                                src={template.img}
                                                alt={template.name}
                                                width={300}
                                                height={400}
                                                placeholder="blur"
                                                className="cursor-pointer rounded-lg border-2 hover:border-blue-600"
                                                onClick={() => setValue("pdfTemplate", template.id)}
                                            />
                                        </div>

                                        <BaseButton
                                            onClick={() => setValue("pdfTemplate", template.id)}
                                            variant={formValues.pdfTemplate === template.id ? "default" : "outline"}
                                            className="w-full"
                                        >
                                            {formValues.pdfTemplate === template.id ? "Selected" : "Select"}
                                        </BaseButton>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Section */}
                {formValues && (
                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold">Live Preview</h3>
                                <CardDescription>
                                    Preview of your packing list with current data
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg p-4 bg-white max-h-[500px] overflow-y-auto">
                                    {templates.find(t => t.id === formValues.pdfTemplate)?.component}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
};

export default PackingListTemplateSelector;