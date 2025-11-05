"use client";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Components
import { ChargeInput } from "@/app/components";

// Contexts
import { useChargesContext } from "@/contexts/ChargesContext";
import { useTranslationContext } from "@/contexts/TranslationContext";

// Helpers
import { formatNumberWithCommas } from "@/lib/helpers";

// Types
import { InvoiceType } from "@/types";

const Charges = () => {
    const {
        formState: { errors },
        watch,
        setValue,
    } = useFormContext<InvoiceType>();

    const { _t } = useTranslationContext();

    const {
        discountSwitch,
        setDiscountSwitch,
        taxSwitch,
        setTaxSwitch,
        shippingSwitch,
        setShippingSwitch,
        discountType,
        setDiscountType,
        taxType,
        setTaxType,
        shippingType,
        setShippingType,
        totalInWordsSwitch,
        setTotalInWordsSwitch,
        currency,
        subTotal,
        totalAmount,
    } = useChargesContext();

    const switchAmountType = (
        type: string,
        setType: (type: string) => void
    ) => {
        if (type == "amount") {
            setType("percentage");
        } else {
            setType("amount");
        }
    };
    return (
        <>
            {/* Charges */}
            <div className="flex flex-col gap-3 min-w-[20rem]">
                {/* Switches */}
                <div className="flex justify-evenly pb-6">
                    <div>
                        <Label>{_t("form.steps.summary.discount")}</Label>

                        <div>
                            <div>
                                <Switch
                                    checked={discountSwitch}
                                    onCheckedChange={(value) => {
                                        setDiscountSwitch(value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>{_t("form.steps.summary.tax")}</Label>

                        <div>
                            <div>
                                <Switch
                                    checked={taxSwitch}
                                    onCheckedChange={(value) => {
                                        setTaxSwitch(value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>{_t("form.steps.summary.shipping")}</Label>

                        <div>
                            <div>
                                <Switch
                                    checked={shippingSwitch}
                                    onCheckedChange={(value) => {
                                        setShippingSwitch(value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center px-5 gap-y-3">
                    <div className="flex justify-between items-center">
                        <div>{_t("form.steps.summary.subTotal")}</div>

                        <div>
                            {formatNumberWithCommas(subTotal)} {currency}
                        </div>
                    </div>
                    {discountSwitch && (
                        <ChargeInput
                            label={_t("form.steps.summary.discount")}
                            name="details.discountDetails.amount"
                            switchAmountType={switchAmountType}
                            type={discountType}
                            setType={setDiscountType}
                            currency={currency}
                        />
                    )}

                    {taxSwitch && (
                        <ChargeInput
                            label={_t("form.steps.summary.tax")}
                            name="details.taxDetails.amount"
                            switchAmountType={switchAmountType}
                            type={taxType}
                            setType={setTaxType}
                            currency={currency}
                        />
                    )}

                    {shippingSwitch && (
                        <>
                            <ChargeInput
                                label={_t("form.steps.summary.shipping")}
                                name="details.shippingDetails.cost"
                                switchAmountType={switchAmountType}
                                type={shippingType}
                                setType={setShippingType}
                                currency={currency}
                            />
                            <div className="flex justify-between items-center gap-2">
                                <Label htmlFor="incoterms" className="whitespace-nowrap">
                                    Incoterms
                                </Label>
                                <Select
                                    value={watch("details.shippingDetails.incoterms") || ""}
                                    onValueChange={(value) => setValue("details.shippingDetails.incoterms", value as any)}
                                >
                                    <SelectTrigger id="incoterms" className="w-[180px]">
                                        <SelectValue placeholder="Select Incoterms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                                        <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                                        <SelectItem value="CPT">CPT - Carriage Paid To</SelectItem>
                                        <SelectItem value="CIP">CIP - Carriage and Insurance Paid</SelectItem>
                                        <SelectItem value="DAP">DAP - Delivered At Place</SelectItem>
                                        <SelectItem value="DPU">DPU - Delivered at Place Unloaded</SelectItem>
                                        <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                                        <SelectItem value="FAS">FAS - Free Alongside Ship</SelectItem>
                                        <SelectItem value="FOB">FOB - Free On Board</SelectItem>
                                        <SelectItem value="CFR">CFR - Cost and Freight</SelectItem>
                                        <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between items-center">
                        <div>{_t("form.steps.summary.totalAmount")}</div>

                        <div className="">
                            <p>
                                {formatNumberWithCommas(totalAmount)} {currency}
                            </p>

                            <small className="text-sm font-medium text-destructive">
                                {errors.details?.totalAmount?.message}
                            </small>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <p>{_t("form.steps.summary.includeTotalInWords")}</p>{" "}
                        <p>
                            {totalInWordsSwitch
                                ? _t("form.steps.summary.yes")
                                : _t("form.steps.summary.no")}
                        </p>
                        <Switch
                            checked={totalInWordsSwitch}
                            onCheckedChange={(value) => {
                                setTotalInWordsSwitch(value);
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Charges;
