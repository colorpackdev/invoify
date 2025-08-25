"use client";

import { useState } from "react";

// RHF
import { useFormContext, useWatch } from "react-hook-form";

// Components
import { FormInput, Subheading } from "@/app/components";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

// Types
import { InvoiceType } from "@/types";

const PaymentInformation = () => {
    const { _t } = useTranslationContext();
    const { setValue, register } = useFormContext<InvoiceType>();
    
    // Watch the checkbox value
    const noExchangeRateCoverage = useWatch({
        name: "details.paymentInformation.noExchangeRateCoverage",
        defaultValue: false
    });

    const handleCheckboxChange = (checked: boolean) => {
        setValue("details.paymentInformation.noExchangeRateCoverage", checked);
        
        // Clear bank info when no payment exchange is expected
        if (checked) {
            setValue("details.paymentInformation.bankName", "");
            setValue("details.paymentInformation.accountName", "");
            setValue("details.paymentInformation.accountNumber", "");
        }
    };

    return (
        <section>
            <Subheading>{_t("form.steps.paymentInfo.heading")}:</Subheading>
            
            {/* Compliance Option */}
            <div className="mt-5 mb-6">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="noExchangeRateCoverage"
                        checked={noExchangeRateCoverage}
                        onCheckedChange={handleCheckboxChange}
                        {...register("details.paymentInformation.noExchangeRateCoverage")}
                    />
                    <Label 
                        htmlFor="noExchangeRateCoverage" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {_t("form.steps.paymentInfo.noExchangeRateCoverage")}
                    </Label>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-6">
                    {_t("form.steps.paymentInfo.noExchangeRateCoverageDescription")}
                </p>
            </div>

            {/* Bank Information - Only show if payment exchange is expected */}
            {!noExchangeRateCoverage && (
                <div className="flex flex-wrap gap-10">
                    <FormInput
                        name="details.paymentInformation.bankName"
                        label={_t("form.steps.paymentInfo.bankName")}
                        placeholder={_t("form.steps.paymentInfo.bankName")}
                        vertical
                    />
                    <FormInput
                        name="details.paymentInformation.accountName"
                        label={_t("form.steps.paymentInfo.accountName")}
                        placeholder={_t("form.steps.paymentInfo.accountName")}
                        vertical
                    />
                    <FormInput
                        name="details.paymentInformation.accountNumber"
                        label={_t("form.steps.paymentInfo.accountNumber")}
                        placeholder={_t("form.steps.paymentInfo.accountNumber")}
                        vertical
                    />
                </div>
            )}

            {/* Show record-keeping message when enabled */}
            {noExchangeRateCoverage && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center">
                        <div className="ml-3">
                            <p className="text-sm text-blue-800">
                                {_t("form.steps.paymentInfo.recordKeepingMessage")}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PaymentInformation;
