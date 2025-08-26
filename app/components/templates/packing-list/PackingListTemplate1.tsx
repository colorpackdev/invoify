import React from "react";

// Components
import PackingListLayout from "./PackingListLayout";
import { 
    SmartPdfContainer,
    InvoiceHeaderContainer,
    ItemsTableContainer,
    ItemRowContainer,
    TotalsContainer,
    PaymentInfoContainer
} from "@/app/components";

// Helpers
import { formatNumberWithCommas } from "@/lib/helpers";

// Variables
import { DATE_OPTIONS } from "@/lib/variables";

// Types
import { PackingListType } from "@/lib/schemas/packingList";

const PackingListTemplate1 = (data: PackingListType) => {
    const { shipper, consignee, shippingInfo, packages, totals } = data;

    const calculateVolume = (pkg: any) => {
        const { length, width, height } = pkg.dimensions;
        return (length * width * height).toFixed(2);
    };

    const estimatedContentHeight = 800 + (packages.length * 200) + packages.reduce((acc, pkg) => acc + (pkg.items.length * 30), 0);

    return (
        <PackingListLayout data={data}>
            <SmartPdfContainer estimatedContentHeight={estimatedContentHeight}>
                <InvoiceHeaderContainer>
                    <div className='flex justify-between'>
                <div>
                    {data.logo && (
                        <img
                            src={data.logo}
                            width={140}
                            height={100}
                            alt={`Logo of ${shipper.name}`}
                        />
                    )}
                    <h1 className='mt-2 text-lg md:text-xl font-semibold text-blue-600'>{shipper.name}</h1>
                </div>
                <div className='text-right'>
                    <h2 className='text-2xl md:text-3xl font-semibold text-gray-800'>Packing List #</h2>
                    <span className='mt-1 block text-gray-500'>{data.packingListNumber}</span>
                    <address className='mt-4 not-italic text-gray-800'>
                        {shipper.address}
                        <br />
                        {shipper.zipCode ? `${shipper.zipCode}, ` : ''}{shipper.city}
                        <br />
                        {shipper.country}
                        <br />
                    </address>
                </div>
                    </div>
                </InvoiceHeaderContainer>

            <div className='mt-6 grid sm:grid-cols-2 gap-3'>
                <div>
                    <h3 className='text-lg font-semibold text-gray-800'>Ship to:</h3>
                    <h3 className='text-lg font-semibold text-gray-800'>{consignee.name}</h3>
                    <address className='mt-2 not-italic text-gray-500'>
                        {consignee.address && consignee.address.length > 0 ? consignee.address : null}
                        <br />
                        {consignee.zipCode && consignee.zipCode.length > 0 ? `${consignee.zipCode}, ` : ''}{consignee.city}, {consignee.country}
                        <br />
                    </address>
                </div>
                <div className='sm:text-right space-y-2'>
                    <div className='grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2'>
                        <dl className='grid sm:grid-cols-6 gap-x-3'>
                            <dt className='col-span-3 font-semibold text-gray-800'>Packing date:</dt>
                            <dd className='col-span-3 text-gray-500'>
                                {new Date(data.packingListDate).toLocaleDateString("en-US", DATE_OPTIONS)}
                            </dd>
                        </dl>
                        <dl className='grid sm:grid-cols-6 gap-x-3'>
                            <dt className='col-span-3 font-semibold text-gray-800'>Invoice No:</dt>
                            <dd className='col-span-3 text-gray-500'>{data.invoiceNumber}</dd>
                        </dl>
                        <dl className='grid sm:grid-cols-6 gap-x-3'>
                            <dt className='col-span-3 font-semibold text-gray-800'>Invoice Date:</dt>
                            <dd className='col-span-3 text-gray-500'>
                                {new Date(data.invoiceDate).toLocaleDateString("en-US", DATE_OPTIONS)}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Shipping Information */}
            {(shippingInfo.carrier || shippingInfo.trackingNumber || shippingInfo.shippingMethod) && (
                <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                    <h3 className='text-lg font-semibold text-blue-800 mb-3'>Shipping Information</h3>
                    <div className='grid grid-cols-2 gap-4 text-sm text-gray-700'>
                        {shippingInfo.carrier && <p><span className='font-semibold'>Carrier:</span> {shippingInfo.carrier}</p>}
                        {shippingInfo.trackingNumber && <p><span className='font-semibold'>Tracking:</span> {shippingInfo.trackingNumber}</p>}
                        {shippingInfo.shippingMethod && <p><span className='font-semibold'>Method:</span> {shippingInfo.shippingMethod.toUpperCase()}</p>}
                        {shippingInfo.incoterms && <p><span className='font-semibold'>Incoterms:</span> {shippingInfo.incoterms}</p>}
                        {shippingInfo.portOfLoading && <p><span className='font-semibold'>Port of Loading:</span> {shippingInfo.portOfLoading}</p>}
                        {shippingInfo.portOfDischarge && <p><span className='font-semibold'>Port of Discharge:</span> {shippingInfo.portOfDischarge}</p>}
                    </div>
                </div>
            )}

                {/* Package Details */}
                <ItemsTableContainer className='mt-6'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Package Details</h3>
                    
                    {packages.map((pkg, index) => (
                        <div key={index} className='mb-6 border border-gray-200 rounded-lg overflow-hidden'>
                        <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
                            <div className='flex justify-between items-center'>
                                <h4 className='font-semibold text-gray-800 text-lg'>
                                    Package {pkg.packageNumber} - {pkg.packageType.toUpperCase()}
                                </h4>
                                <div className='text-sm text-gray-600 flex gap-4'>
                                    <span>Gross: <strong>{formatNumberWithCommas(pkg.grossWeight)} {pkg.weightUnit}</strong></span>
                                    <span>Net: <strong>{formatNumberWithCommas(pkg.netWeight)} {pkg.weightUnit}</strong></span>
                                </div>
                            </div>
                            <div className='mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600'>
                                <p>Dimensions: <strong>{pkg.dimensions.length} × {pkg.dimensions.width} × {pkg.dimensions.height} {pkg.dimensions.unit}</strong></p>
                                <p>Volume: <strong>{calculateVolume(pkg)} {pkg.dimensions.unit}³</strong></p>
                            </div>
                            {pkg.marks && (
                                <p className='mt-1 text-sm text-gray-600'>Marks: <strong>{pkg.marks}</strong></p>
                            )}
                        </div>

                        {/* Items Table */}
                        <div className='p-4'>
                            <div className='border border-gray-200 rounded-lg space-y-1 overflow-hidden'>
                                <div className='hidden sm:grid sm:grid-cols-6 bg-gray-50 p-2'>
                                    <div className='sm:col-span-2 text-xs font-medium text-gray-500 uppercase'>Item</div>
                                    <div className='text-center text-xs font-medium text-gray-500 uppercase'>Qty</div>
                                    <div className='text-center text-xs font-medium text-gray-500 uppercase'>Unit Weight</div>
                                    <div className='text-center text-xs font-medium text-gray-500 uppercase'>Total Weight</div>
                                    <div className='text-center text-xs font-medium text-gray-500 uppercase'>HS Code</div>
                                </div>
                                <div className='hidden sm:block border-b border-gray-200'></div>
                                <div className='grid grid-cols-3 sm:grid-cols-6 gap-y-1'>
                                    {pkg.items.map((item, itemIndex) => (
                                        <React.Fragment key={itemIndex}>
                                            <div className='col-span-full sm:col-span-2 border-b border-gray-300 p-2 print:break-inside-avoid'>
                                                <p className='font-medium text-gray-800'>{item.itemName}</p>
                                                {item.description && (
                                                    <p className='text-xs text-gray-600 mt-1'>{item.description}</p>
                                                )}
                                                {item.countryOfOrigin && (
                                                    <p className='text-xs text-gray-500 mt-1'>Origin: {item.countryOfOrigin}</p>
                                                )}
                                            </div>
                                            <div className='border-b border-gray-300 p-2 text-center print:break-inside-avoid'>
                                                <p className='text-gray-800'>{formatNumberWithCommas(item.quantity)}</p>
                                            </div>
                                            <div className='border-b border-gray-300 p-2 text-center print:break-inside-avoid'>
                                                <p className='text-gray-800'>{formatNumberWithCommas(item.unitWeight)} {pkg.weightUnit}</p>
                                            </div>
                                            <div className='border-b border-gray-300 p-2 text-center print:break-inside-avoid'>
                                                <p className='text-gray-800'>{formatNumberWithCommas(item.totalWeight)} {pkg.weightUnit}</p>
                                            </div>
                                            <div className='border-b border-gray-300 p-2 text-center print:break-inside-avoid'>
                                                <p className='text-gray-800'>{item.hsCode || "—"}</p>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {pkg.notes && (
                            <div className='px-4 pb-4'>
                                <div className='bg-yellow-50 border border-yellow-200 p-3 rounded text-sm'>
                                    <p><span className='font-semibold text-yellow-800'>Package Notes:</span> {pkg.notes}</p>
                                </div>
                            </div>
                        )}
                        </div>
                    ))}
                </ItemsTableContainer>

                {/* Summary */}
                <TotalsContainer className='mt-6 flex sm:justify-end'>
                    <div className='sm:text-right space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-3'>Summary</h3>
                    <div className='grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2'>
                        <dl className='grid sm:grid-cols-5 gap-x-3'>
                            <dt className='col-span-3 font-semibold text-gray-800'>Total Packages:</dt>
                            <dd className='col-span-2 text-gray-500'>{totals.totalPackages}</dd>
                        </dl>
                        <dl className='grid sm:grid-cols-5 gap-x-3'>
                            <dt className='col-span-3 font-semibold text-gray-800'>Total Gross Weight:</dt>
                            <dd className='col-span-2 text-gray-500'>{formatNumberWithCommas(totals.totalGrossWeight)} kg</dd>
                        </dl>
                        <dl className='grid sm:grid-cols-5 gap-x-3'>
                            <dt className='col-span-3 font-semibold text-gray-800'>Total Net Weight:</dt>
                            <dd className='col-span-2 text-gray-500'>{formatNumberWithCommas(totals.totalNetWeight)} kg</dd>
                        </dl>
                        {totals.totalVolume && (
                            <dl className='grid sm:grid-cols-5 gap-x-3'>
                                <dt className='col-span-3 font-semibold text-gray-800'>Total Volume:</dt>
                                <dd className='col-span-2 text-gray-500'>{formatNumberWithCommas(totals.totalVolume)} {totals.volumeUnit}</dd>
                            </dl>
                        )}
                        </div>
                    </div>
                </TotalsContainer>

            {/* Special Instructions */}
            {data.specialInstructions && (
                <div className='mt-6'>
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                        <h3 className='text-lg font-semibold text-yellow-800 mb-2'>Special Instructions</h3>
                        <p className='text-sm text-gray-700'>{data.specialInstructions}</p>
                    </div>
                </div>
            )}

            {/* Additional Notes */}
            {data.notes && (
                <div className='mt-4'>
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                        <h3 className='text-lg font-semibold text-blue-800 mb-2'>Additional Notes</h3>
                        <p className='text-sm text-gray-700'>{data.notes}</p>
                    </div>
                </div>
            )}

            {/* Compliance Information */}
            {(data.certificateOfOrigin || data.exportLicense) && (
                <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <h3 className='text-lg font-semibold text-green-800 mb-2'>Compliance & Certification</h3>
                    <div className='grid grid-cols-2 gap-4 text-sm text-gray-700'>
                        {data.certificateOfOrigin && (
                            <p><span className='font-semibold text-green-700'>Certificate of Origin:</span> Required</p>
                        )}
                        {data.exportLicense && (
                            <p><span className='font-semibold text-green-700'>Export License:</span> {data.exportLicense}</p>
                        )}
                    </div>
                </div>
            )}

                {/* Contact Information */}
                <PaymentInfoContainer className='mt-6'>
                <p className='text-gray-500 text-sm mb-2'>
                    For questions regarding this shipment, contact:
                </p>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <p className='block text-sm font-medium text-blue-600'>{shipper.email}</p>
                        <p className='block text-sm font-medium text-blue-600'>{shipper.phone}</p>
                    </div>
                    <div className='text-right text-xs text-gray-500'>
                        <p>Document generated on {new Date().toLocaleDateString("en-US", DATE_OPTIONS)}</p>
                        <p className='mt-1'>This is an official packing list for customs and shipping purposes</p>
                    </div>
                </div>
                </PaymentInfoContainer>
            </SmartPdfContainer>
        </PackingListLayout>
    );
};

export default PackingListTemplate1;