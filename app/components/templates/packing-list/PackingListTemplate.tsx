import React from "react";

// Components
import PackingListLayout from "./PackingListLayout";

// Helpers
import { formatNumberWithCommas } from "@/lib/helpers";

// Types
import { PackingListType } from "@/lib/schemas/packingList";

const PackingListTemplate = (data: PackingListType) => {
    const { shipper, consignee, shippingInfo, packages, totals } = data;

    const calculateVolume = (pkg: any) => {
        const { length, width, height } = pkg.dimensions;
        return (length * width * height).toFixed(2);
    };

    return (
        <PackingListLayout data={data}>
            {/* Header */}
            <div className="flex justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">PACKING LIST</h1>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600">
                            Packing List No: <span className="font-semibold">{data.packingListNumber}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Date: <span className="font-semibold">{data.packingListDate}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Invoice No: <span className="font-semibold">{data.invoiceNumber}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Invoice Date: <span className="font-semibold">{data.invoiceDate}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Shipper and Consignee */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Shipper:</h3>
                    <div className="text-sm text-gray-700">
                        <p className="font-semibold">{shipper.name}</p>
                        <p>{shipper.address}</p>
                        <p>{shipper.zipCode ? `${shipper.zipCode}, ` : ''}{shipper.city}, {shipper.country}</p>
                        {shipper.phone && <p>Tel: {shipper.phone}</p>}
                        {shipper.email && <p>Email: {shipper.email}</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Consignee:</h3>
                    <div className="text-sm text-gray-700">
                        <p className="font-semibold">{consignee.name}</p>
                        <p>{consignee.address}</p>
                        <p>{consignee.zipCode ? `${consignee.zipCode}, ` : ''}{consignee.city}, {consignee.country}</p>
                        {consignee.phone && <p>Tel: {consignee.phone}</p>}
                        {consignee.email && <p>Email: {consignee.email}</p>}
                    </div>
                </div>
            </div>

            {/* Shipping Information */}
            {(shippingInfo.carrier || shippingInfo.trackingNumber || shippingInfo.shippingMethod) && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Shipping Information:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                        {shippingInfo.carrier && <p>Carrier: <span className="font-semibold">{shippingInfo.carrier}</span></p>}
                        {shippingInfo.trackingNumber && <p>Tracking No: <span className="font-semibold">{shippingInfo.trackingNumber}</span></p>}
                        {shippingInfo.shippingMethod && <p>Method: <span className="font-semibold">{shippingInfo.shippingMethod.toUpperCase()}</span></p>}
                        {shippingInfo.incoterms && <p>Incoterms: <span className="font-semibold">{shippingInfo.incoterms}</span></p>}
                        {shippingInfo.portOfLoading && <p>Port of Loading: <span className="font-semibold">{shippingInfo.portOfLoading}</span></p>}
                        {shippingInfo.portOfDischarge && <p>Port of Discharge: <span className="font-semibold">{shippingInfo.portOfDischarge}</span></p>}
                    </div>
                </div>
            )}

            {/* Package Details */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Package Details:</h3>
                
                {packages.map((pkg, index) => (
                    <div key={index} className="mb-6 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-800">
                                Package {pkg.packageNumber} - {pkg.packageType.toUpperCase()}
                            </h4>
                            <div className="text-sm text-gray-600">
                                Gross: {formatNumberWithCommas(pkg.grossWeight)} {pkg.weightUnit} | 
                                Net: {formatNumberWithCommas(pkg.netWeight)} {pkg.weightUnit}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                                <p className="text-gray-600">
                                    Dimensions: {pkg.dimensions.length} × {pkg.dimensions.width} × {pkg.dimensions.height} {pkg.dimensions.unit}
                                </p>
                                <p className="text-gray-600">
                                    Volume: {calculateVolume(pkg)} {pkg.dimensions.unit}³
                                </p>
                            </div>
                            {pkg.marks && (
                                <div>
                                    <p className="text-gray-600">Marks: {pkg.marks}</p>
                                </div>
                            )}
                        </div>

                        {/* Items in Package */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-semibold text-gray-700">Item</th>
                                        <th className="text-center py-2 font-semibold text-gray-700">Qty</th>
                                        <th className="text-center py-2 font-semibold text-gray-700">Unit Weight</th>
                                        <th className="text-center py-2 font-semibold text-gray-700">Total Weight</th>
                                        <th className="text-left py-2 font-semibold text-gray-700">HS Code</th>
                                        <th className="text-left py-2 font-semibold text-gray-700">Origin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pkg.items.map((item, itemIndex) => (
                                        <tr key={itemIndex} className="border-b border-gray-100">
                                            <td className="py-2">
                                                <div>
                                                    <p className="font-medium">{item.itemName}</p>
                                                    {item.description && (
                                                        <p className="text-gray-600 text-xs">{item.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2 text-center">{formatNumberWithCommas(item.quantity)}</td>
                                            <td className="py-2 text-center">{formatNumberWithCommas(item.unitWeight)} {pkg.weightUnit}</td>
                                            <td className="py-2 text-center">{formatNumberWithCommas(item.totalWeight)} {pkg.weightUnit}</td>
                                            <td className="py-2">{item.hsCode || "—"}</td>
                                            <td className="py-2">{item.countryOfOrigin || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pkg.notes && (
                            <div className="mt-3 text-sm text-gray-600">
                                <p><span className="font-semibold">Notes:</span> {pkg.notes}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p>Total Packages: <span className="font-semibold">{totals.totalPackages}</span></p>
                            <p>Total Gross Weight: <span className="font-semibold">{formatNumberWithCommas(totals.totalGrossWeight)} kg</span></p>
                            <p>Total Net Weight: <span className="font-semibold">{formatNumberWithCommas(totals.totalNetWeight)} kg</span></p>
                        </div>
                        <div>
                            {totals.totalVolume && (
                                <p>Total Volume: <span className="font-semibold">{formatNumberWithCommas(totals.totalVolume)} {totals.volumeUnit}</span></p>
                            )}
                            {data.certificateOfOrigin && (
                                <p>Certificate of Origin: <span className="font-semibold text-green-600">Required</span></p>
                            )}
                            {data.exportLicense && (
                                <p>Export License: <span className="font-semibold">{data.exportLicense}</span></p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Special Instructions */}
            {data.specialInstructions && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Special Instructions:</h3>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-gray-700">
                        {data.specialInstructions}
                    </div>
                </div>
            )}

            {/* Additional Notes */}
            {data.notes && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Notes:</h3>
                    <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded">
                        {data.notes}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                    <p>This packing list is generated automatically and serves as an official document for customs and shipping purposes.</p>
                    <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </PackingListLayout>
    );
};

export default PackingListTemplate;