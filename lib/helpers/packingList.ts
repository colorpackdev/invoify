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

    // Define dimensões padrão da embalagem
    const defaultDimensions = {
        length: 50,
        width: 40,
        height: 30,
        unit: "cm" as const,
    };

    // Define tipo de pacote padrão
    const defaultPackageType = "box" as const;

    // Calcula peso bruto usando a nova função realista
    const grossWeight = calculateGrossWeight(
        totalItemWeight,
        defaultPackageType,
        defaultDimensions,
        true // Inclui materiais de proteção
    );

    // Cria pacote padrão
    const defaultPackage: PackageType = {
        packageNumber: "PKG-001",
        packageType: defaultPackageType,
        dimensions: defaultDimensions,
        grossWeight: grossWeight,
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
            incoterms: details.shippingDetails?.incoterms || "EXW", // Usa Incoterms da invoice se disponível
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
 * Peso base da embalagem por tipo (em kg)
 * Esses valores são estimativas realistas baseadas em padrões da indústria
 */
export const packagingWeights = {
    box: {
        small: 0.5,      // Caixa pequena (< 30cm)
        medium: 1.5,     // Caixa média (30-60cm)
        large: 3.0,      // Caixa grande (> 60cm)
    },
    crate: {
        small: 5.0,      // Engradado pequeno
        medium: 15.0,    // Engradado médio
        large: 30.0,     // Engradado grande
    },
    pallet: {
        small: 15.0,     // Palete pequeno
        medium: 25.0,    // Palete médio (padrão)
        large: 35.0,     // Palete grande/reforçado
    },
    drum: {
        small: 8.0,      // Tambor pequeno (50L)
        medium: 15.0,    // Tambor médio (200L)
        large: 25.0,     // Tambor grande (400L)
    },
    bag: {
        small: 0.1,      // Saco pequeno
        medium: 0.3,     // Saco médio
        large: 0.5,      // Saco grande
    },
    bundle: {
        small: 1.0,      // Fardo pequeno
        medium: 2.5,     // Fardo médio
        large: 5.0,      // Fardo grande
    },
    container: {
        small: 2200,     // Container 20'
        medium: 3800,    // Container 40'
        large: 4800,     // Container 40' HC
    },
    other: {
        small: 1.0,
        medium: 3.0,
        large: 6.0,
    },
};

/**
 * Calcula o peso da embalagem baseado no tipo e dimensões
 */
export function calculatePackagingWeight(
    packageType: keyof typeof packagingWeights,
    dimensions: { length: number; width: number; height: number; unit: string }
): number {
    const { length, width, height, unit } = dimensions;

    // Converte tudo para cm para comparação
    let maxDimension = Math.max(length, width, height);
    switch (unit) {
        case "m":
            maxDimension *= 100;
            break;
        case "in":
            maxDimension *= 2.54;
            break;
        case "ft":
            maxDimension *= 30.48;
            break;
        default: // cm
            break;
    }

    // Determina o tamanho baseado na maior dimensão
    let size: "small" | "medium" | "large";
    if (maxDimension < 30) {
        size = "small";
    } else if (maxDimension < 100) {
        size = "medium";
    } else {
        size = "large";
    }

    // Retorna o peso da embalagem
    return packagingWeights[packageType][size];
}

/**
 * Calcula peso bruto realista baseado no peso líquido, tipo de embalagem e dimensões
 */
export function calculateGrossWeight(
    netWeight: number,
    packageType: keyof typeof packagingWeights,
    dimensions: { length: number; width: number; height: number; unit: string },
    includePackingMaterials: boolean = true
): number {
    // Peso da embalagem
    const packagingWeight = calculatePackagingWeight(packageType, dimensions);

    // Peso de materiais de proteção (bubble wrap, papelão, etc)
    // Estimativa: 3-7% do peso líquido, dependendo do tipo de embalagem
    let packingMaterialsWeight = 0;
    if (includePackingMaterials) {
        const materialRatios: Record<string, number> = {
            box: 0.05,
            crate: 0.03,
            pallet: 0.02,
            drum: 0.02,
            bag: 0.01,
            bundle: 0.02,
            container: 0.01,
            other: 0.04,
        };
        packingMaterialsWeight = netWeight * (materialRatios[packageType] || 0.04);
    }

    // Peso bruto = peso líquido + peso da embalagem + materiais de proteção
    const grossWeight = netWeight + packagingWeight + packingMaterialsWeight;

    return Math.round(grossWeight * 100) / 100; // Arredonda para 2 casas decimais
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