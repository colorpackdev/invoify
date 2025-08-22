import { z } from "zod";

// Enhanced item configuration for packing
const PackingItemConfigSchema = z.object({
    // Physical properties
    unitWeight: z.coerce.number().positive({ message: "Unit weight must be positive" }),
    weightUnit: z.enum(["kg", "lb", "g", "oz"]).default("kg"),
    
    // Dimensions per unit
    dimensions: z.object({
        length: z.coerce.number().positive(),
        width: z.coerce.number().positive(),
        height: z.coerce.number().positive(),
        unit: z.enum(["cm", "in", "m", "ft"]).default("cm"),
    }),
    
    // Legal and customs information
    hsCode: z.string().min(4, { message: "HS Code must be at least 4 digits" }).optional(),
    countryOfOrigin: z.string().min(1, { message: "Country of origin is required" }),
    customsValue: z.coerce.number().positive().optional(),
    customsValueCurrency: z.string().default("USD"),
    
    // Product classification
    productCategory: z.enum([
        "electronics",
        "machinery",
        "textiles",
        "food",
        "chemicals",
        "automotive",
        "medical",
        "furniture",
        "toys",
        "books",
        "jewelry",
        "art",
        "sports",
        "other"
    ]).default("other"),
    
    // Handling requirements
    fragile: z.boolean().default(false),
    hazardous: z.boolean().default(false),
    temperatureControlled: z.boolean().default(false),
    requiresSpecialHandling: z.boolean().default(false),
    
    // Documentation requirements
    requiresCertificateOfOrigin: z.boolean().default(false),
    requiresExportLicense: z.boolean().default(false),
    requiresHealthCertificate: z.boolean().default(false),
    additionalDocuments: z.array(z.string()).optional(),
    
    // Notes and descriptions
    packingInstructions: z.string().optional(),
    handlingNotes: z.string().optional(),
});

// Enhanced package item (item assigned to a package)
const EnhancedPackageItemSchema = z.object({
    // Reference to original invoice item
    invoiceItemId: z.string(), // Will use index or unique identifier
    itemName: z.string().min(1),
    description: z.string().optional(),
    
    // Quantity in this package
    quantityInPackage: z.coerce.number().positive(),
    
    // Configuration (can override defaults)
    config: PackingItemConfigSchema,
    
    // Calculated values
    totalWeight: z.coerce.number().positive(),
    totalVolume: z.coerce.number().positive(),
    totalCustomsValue: z.coerce.number().optional(),
});

// Package compatibility rules
const PackageCompatibilitySchema = z.object({
    maxWeight: z.coerce.number().positive().default(50), // kg
    maxVolume: z.coerce.number().positive().optional(), // m³
    allowMixedCategories: z.boolean().default(true),
    allowFragileWithNonFragile: z.boolean().default(false),
    allowHazardousWithOther: z.boolean().default(false),
    temperatureCompatible: z.boolean().default(true),
});

// Enhanced package schema
const EnhancedPackageSchema = z.object({
    packageId: z.string().min(1),
    packageNumber: z.string().min(1),
    packageType: z.enum([
        "box",
        "crate",
        "pallet",
        "drum",
        "bag",
        "bundle",
        "container",
        "envelope",
        "tube",
        "other"
    ]).default("box"),
    
    // Package specifications
    maxCapacity: PackageCompatibilitySchema,
    
    // Physical properties
    dimensions: z.object({
        length: z.coerce.number().positive(),
        width: z.coerce.number().positive(),
        height: z.coerce.number().positive(),
        unit: z.enum(["cm", "in", "m", "ft"]).default("cm"),
    }),
    
    // Weight breakdown
    emptyWeight: z.coerce.number().nonnegative().default(0.5), // kg
    contentWeight: z.coerce.number().nonnegative(),
    grossWeight: z.coerce.number().positive(),
    weightUnit: z.enum(["kg", "lb", "g", "oz"]).default("kg"),
    
    // Items in this package
    items: z.array(EnhancedPackageItemSchema),
    
    // Package markings and labels
    marks: z.string().optional(),
    labels: z.array(z.string()).optional(),
    barcodes: z.array(z.string()).optional(),
    
    // Special requirements
    requiresRefrigeration: z.boolean().default(false),
    stackable: z.boolean().default(true),
    fragileContents: z.boolean().default(false),
    
    // Insurance and value
    declaredValue: z.coerce.number().optional(),
    insured: z.boolean().default(false),
    
    // Notes
    packingNotes: z.string().optional(),
    handlingInstructions: z.string().optional(),
});

// Enhanced shipping information
const EnhancedShippingInfoSchema = z.object({
    // Carrier information
    carrier: z.string().optional(),
    carrierService: z.string().optional(), // Express, Standard, Economy
    trackingNumber: z.string().optional(),
    
    // Shipping method details
    shippingMethod: z.enum([
        "air_express",
        "air_standard",
        "sea_fcl", // Full Container Load
        "sea_lcl", // Less than Container Load
        "road_express",
        "road_standard",
        "rail",
        "multimodal"
    ]).optional(),
    
    // Terms
    incoterms: z.enum([
        "EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP",
        "FAS", "FOB", "CFR", "CIF"
    ]).optional(),
    
    // Route information
    portOfLoading: z.string().optional(),
    portOfDischarge: z.string().optional(),
    finalDestination: z.string().optional(),
    transitTime: z.string().optional(), // "5-7 business days"
    
    // Container/vehicle information
    containerNumber: z.string().optional(),
    containerType: z.string().optional(), // 20ft, 40ft, 40HC
    sealNumber: z.string().optional(),
    vehicleRegistration: z.string().optional(),
    
    // Insurance
    insuranceProvider: z.string().optional(),
    insurancePolicyNumber: z.string().optional(),
    insuranceValue: z.coerce.number().optional(),
    
    // Special services
    requiresSignature: z.boolean().default(false),
    requiresId: z.boolean().default(false),
    saturdayDelivery: z.boolean().default(false),
    residentialDelivery: z.boolean().default(false),
});

// Enhanced packing list schema
const EnhancedPackingListSchema = z.object({
    // Document identification
    packingListNumber: z.string().min(1),
    packingListDate: z.string(), // ISO date string
    version: z.string().default("1.0"),
    
    // Reference documents
    invoiceNumber: z.string().min(1),
    invoiceDate: z.string(),
    purchaseOrderNumber: z.string().optional(),
    contractNumber: z.string().optional(),
    
    // Parties information
    shipper: z.object({
        name: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        taxId: z.string().optional(),
        exporterLicense: z.string().optional(),
    }),
    
    consignee: z.object({
        name: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        taxId: z.string().optional(),
        importerLicense: z.string().optional(),
    }),
    
    notifyParty: z.object({
        name: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
    }).optional(),
    
    // Shipping details
    shippingInfo: EnhancedShippingInfoSchema,
    
    // Package configuration
    packages: z.array(EnhancedPackageSchema),
    
    // Item configurations (master list)
    itemConfigurations: z.record(z.string(), PackingItemConfigSchema),
    
    // Totals and summary
    totals: z.object({
        totalPackages: z.coerce.number().positive(),
        totalGrossWeight: z.coerce.number().positive(),
        totalNetWeight: z.coerce.number().positive(),
        totalVolume: z.coerce.number().positive(),
        totalCustomsValue: z.coerce.number().optional(),
        weightUnit: z.enum(["kg", "lb"]).default("kg"),
        volumeUnit: z.enum(["m3", "ft3", "cbm"]).default("m3"),
        currency: z.string().default("USD"),
    }),
    
    // Legal and customs
    exportInformation: z.object({
        exportLicenseRequired: z.boolean().default(false),
        exportLicenseNumber: z.string().optional(),
        exportControlClassification: z.string().optional(),
        certificateOfOriginRequired: z.boolean().default(false),
        freeTradeAgreement: z.string().optional(),
        customsNotes: z.string().optional(),
    }),
    
    // Documentation
    attachedDocuments: z.array(z.object({
        documentType: z.string(),
        documentNumber: z.string().optional(),
        description: z.string(),
        required: z.boolean().default(false),
    })).optional(),
    
    // Additional information
    specialInstructions: z.string().optional(),
    dangerousGoods: z.boolean().default(false),
    dangerousGoodsDeclaration: z.string().optional(),
    environmentalRequirements: z.string().optional(),
    
    // Internal notes
    preparerName: z.string().optional(),
    preparerSignature: z.string().optional(),
    internalNotes: z.string().optional(),
    
    // Metadata
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

// Export types
export type EnhancedPackingListType = z.infer<typeof EnhancedPackingListSchema>;
export type EnhancedPackageType = z.infer<typeof EnhancedPackageSchema>;
export type EnhancedPackageItemType = z.infer<typeof EnhancedPackageItemSchema>;
export type PackingItemConfigType = z.infer<typeof PackingItemConfigSchema>;
export type EnhancedShippingInfoType = z.infer<typeof EnhancedShippingInfoSchema>;

export {
    EnhancedPackingListSchema,
    EnhancedPackageSchema,
    EnhancedPackageItemSchema,
    PackingItemConfigSchema,
    EnhancedShippingInfoSchema,
};