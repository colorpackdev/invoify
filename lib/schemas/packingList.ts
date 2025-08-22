import { z } from "zod";

// Package dimensions schema
const PackageDimensionsSchema = z.object({
    length: z.coerce.number().positive({ message: "Length must be positive" }),
    width: z.coerce.number().positive({ message: "Width must be positive" }),
    height: z.coerce.number().positive({ message: "Height must be positive" }),
    unit: z.enum(["cm", "in", "m", "ft"]).default("cm"),
});

// Package item schema
const PackageItemSchema = z.object({
    itemName: z.string().min(1, { message: "Item name is required" }),
    description: z.string().optional(),
    quantity: z.coerce.number().positive({ message: "Quantity must be positive" }),
    unitWeight: z.coerce.number().positive({ message: "Weight must be positive" }),
    totalWeight: z.coerce.number().positive(),
    hsCode: z.string().optional(), // Harmonized System Code for customs
    countryOfOrigin: z.string().optional(),
});

// Individual package schema
const PackageSchema = z.object({
    packageNumber: z.string().min(1, { message: "Package number is required" }),
    packageType: z.enum([
        "box",
        "crate",
        "pallet",
        "drum",
        "bag",
        "bundle",
        "container",
        "other"
    ]).default("box"),
    dimensions: PackageDimensionsSchema,
    grossWeight: z.coerce.number().positive({ message: "Gross weight must be positive" }),
    netWeight: z.coerce.number().positive({ message: "Net weight must be positive" }),
    weightUnit: z.enum(["kg", "lb", "g", "oz"]).default("kg"),
    items: z.array(PackageItemSchema),
    marks: z.string().optional(), // Shipping marks
    notes: z.string().optional(),
});

// Shipping information schema
const ShippingInfoSchema = z.object({
    carrier: z.string().optional(),
    trackingNumber: z.string().optional(),
    shippingMethod: z.enum([
        "air",
        "sea",
        "road",
        "rail",
        "express",
        "standard"
    ]).optional(),
    incoterms: z.enum([
        "EXW",
        "FCA",
        "CPT",
        "CIP",
        "DAP",
        "DPU",
        "DDP",
        "FAS",
        "FOB",
        "CFR",
        "CIF"
    ]).optional(),
    portOfLoading: z.string().optional(),
    portOfDischarge: z.string().optional(),
    containerNumber: z.string().optional(),
    sealNumber: z.string().optional(),
});

// Complete packing list schema
const PackingListSchema = z.object({
    // Reference to invoice
    invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
    invoiceDate: z.string(),
    
    // Document info
    packingListNumber: z.string().min(1, { message: "Packing list number is required" }),
    packingListDate: z.date().transform((date) =>
        new Date(date).toLocaleDateString("en-US")
    ),
    
    // Parties
    shipper: z.object({
        name: z.string().min(1),
        address: z.string().min(1),
        zipCode: z.string().optional(),
        city: z.string().min(1),
        country: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
    }),
    
    consignee: z.object({
        name: z.string().min(1),
        address: z.string().min(1),
        zipCode: z.string().optional(),
        city: z.string().min(1),
        country: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
    }),
    
    // Shipping details
    shippingInfo: ShippingInfoSchema,
    
    // Packages
    packages: z.array(PackageSchema),
    
    // Totals
    totals: z.object({
        totalPackages: z.coerce.number().positive(),
        totalGrossWeight: z.coerce.number().positive(),
        totalNetWeight: z.coerce.number().positive(),
        totalVolume: z.coerce.number().optional(),
        volumeUnit: z.enum(["m3", "ft3", "cbm"]).optional(),
    }),
    
    // Additional info
    specialInstructions: z.string().optional(),
    certificateOfOrigin: z.boolean().default(false),
    exportLicense: z.string().optional(),
    notes: z.string().optional(),
    
    // Template
    pdfTemplate: z.coerce.number().default(1),
    logo: z.string().optional(),
});

export type PackingListType = z.infer<typeof PackingListSchema>;
export type PackageType = z.infer<typeof PackageSchema>;
export type PackageItemType = z.infer<typeof PackageItemSchema>;
export type ShippingInfoType = z.infer<typeof ShippingInfoSchema>;

export { PackingListSchema, PackageSchema, PackageItemSchema };