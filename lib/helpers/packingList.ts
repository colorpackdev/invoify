import { InvoiceType } from "@/types";
import { PackingListType, PackageType, PackageItemType } from "@/lib/schemas/packingList";

/**
 * Gera dados padrão para packing list baseado em uma invoice
 */
export function generatePackingListFromInvoice(invoice: InvoiceType): Partial<PackingListType> {
    const { sender, receiver, details } = invoice;
    
    // Converte itens da invoice em itens de embalagem
    const packageItems: PackageItemType[] = details.items.map((item, index) => ({
        itemName: item.name,
        description: item.description || "",
        quantity: item.quantity,
        unitWeight: item.physicalDetails?.unitWeight || 1, // Usa peso do physicalDetails se disponível
        totalWeight: item.quantity * (item.physicalDetails?.unitWeight || 1), // Peso total calculado
        hsCode: item.physicalDetails?.hsCode || "", // Usa HS code do physicalDetails se disponível
        countryOfOrigin: item.physicalDetails?.countryOfOrigin || sender.country,
    }));

    // Calcula peso total dos itens
    const totalItemWeight = packageItems.reduce((sum, item) => sum + item.totalWeight, 0);
    
    // Cria pacote padrão
    const defaultPackage: PackageType = {
        packageNumber: "PKG-001",
        packageType: "box",
        dimensions: {
            length: 50,
            width: 40,
            height: 30,
            unit: "cm",
        },
        grossWeight: totalItemWeight + (totalItemWeight * 0.1), // 10% adicional para embalagem
        netWeight: totalItemWeight,
        weightUnit: "kg",
        items: packageItems,
        marks: `${details.invoiceNumber}`,
        notes: "",
    };

    // Gera número do packing list baseado na invoice
    const packingListNumber = `PL-${details.invoiceNumber}`;
    
    return {
        invoiceNumber: details.invoiceNumber,
        invoiceDate: details.invoiceDate,
        packingListNumber,
        packingListDate: new Date().toISOString().split('T')[0],
        logo: details.invoiceLogo, // Include logo from invoice
        
        shipper: {
            name: sender.name,
            address: sender.address,
            city: `${sender.zipCode}, ${sender.city}`,
            country: sender.country,
            phone: sender.phone,
            email: sender.email,
        },
        
        consignee: {
            name: receiver.name,
            address: receiver.address,
            city: `${receiver.zipCode}, ${receiver.city}`,
            country: receiver.country,
            phone: receiver.phone,
            email: receiver.email,
        },
        
        shippingInfo: {
            carrier: "",
            trackingNumber: "",
            shippingMethod: "standard",
            incoterms: "EXW",
            portOfLoading: "",
            portOfDischarge: "",
            containerNumber: "",
            sealNumber: "",
        },
        
        packages: [defaultPackage],
        
        totals: {
            totalPackages: 1,
            totalGrossWeight: defaultPackage.grossWeight,
            totalNetWeight: defaultPackage.netWeight,
            totalVolume: calculateVolume(defaultPackage.dimensions),
            volumeUnit: "m3",
        },
        
        specialInstructions: "",
        certificateOfOrigin: false,
        exportLicense: "",
        notes: `Packing list generated from Invoice #${details.invoiceNumber}`,
    };
}

/**
 * Calcula volume baseado nas dimensões
 */
export function calculateVolume(dimensions: { length: number; width: number; height: number; unit: string }): number {
    const { length, width, height, unit } = dimensions;
    let volume = length * width * height;
    
    // Converte para metros cúbicos se necessário
    switch (unit) {
        case "cm":
            volume = volume / 1000000; // cm³ para m³
            break;
        case "in":
            volume = volume * 0.000016387; // in³ para m³
            break;
        case "ft":
            volume = volume * 0.028317; // ft³ para m³
            break;
        default: // m
            break;
    }
    
    return Math.round(volume * 1000) / 1000; // Arredonda para 3 casas decimais
}

/**
 * Calcula totais do packing list
 */
export function calculatePackingListTotals(packages: PackageType[]) {
    const totalPackages = packages.length;
    const totalGrossWeight = packages.reduce((sum, pkg) => sum + pkg.grossWeight, 0);
    const totalNetWeight = packages.reduce((sum, pkg) => sum + pkg.netWeight, 0);
    const totalVolume = packages.reduce((sum, pkg) => sum + calculateVolume(pkg.dimensions), 0);
    
    return {
        totalPackages,
        totalGrossWeight: Math.round(totalGrossWeight * 100) / 100,
        totalNetWeight: Math.round(totalNetWeight * 100) / 100,
        totalVolume: Math.round(totalVolume * 1000) / 1000,
        volumeUnit: "m3" as const,
    };
}

/**
 * Configurações padrão de embalagem por tipo de produto
 */
export const defaultPackagingConfigs = {
    electronics: {
        packageType: "box" as const,
        dimensions: { length: 40, width: 30, height: 25, unit: "cm" as const },
        weightRatio: 0.15, // 15% adicional para embalagem
    },
    clothing: {
        packageType: "bag" as const,
        dimensions: { length: 60, width: 40, height: 20, unit: "cm" as const },
        weightRatio: 0.05, // 5% adicional para embalagem
    },
    machinery: {
        packageType: "crate" as const,
        dimensions: { length: 120, width: 80, height: 100, unit: "cm" as const },
        weightRatio: 0.25, // 25% adicional para embalagem
    },
    food: {
        packageType: "box" as const,
        dimensions: { length: 50, width: 40, height: 30, unit: "cm" as const },
        weightRatio: 0.10, // 10% adicional para embalagem
    },
    default: {
        packageType: "box" as const,
        dimensions: { length: 50, width: 40, height: 30, unit: "cm" as const },
        weightRatio: 0.10, // 10% adicional para embalagem
    },
};