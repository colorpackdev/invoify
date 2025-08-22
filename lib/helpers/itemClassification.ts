import { InvoiceType, ItemType } from "@/types";

// Keywords that typically indicate services
const SERVICE_KEYWORDS = [
    'service', 'consultation', 'consulting', 'support', 'maintenance',
    'training', 'education', 'development', 'design', 'analysis',
    'audit', 'review', 'assessment', 'installation', 'setup',
    'configuration', 'implementation', 'management', 'administration',
    'monitoring', 'hosting', 'subscription', 'license', 'software',
    'digital', 'online', 'virtual', 'remote', 'cloud',
    'serviço', 'consultoria', 'suporte', 'manutenção', 'treinamento',
    'desenvolvimento', 'análise', 'auditoria', 'instalação',
    'configuração', 'administração', 'monitoramento', 'licença'
];

// Keywords that typically indicate physical products
const PRODUCT_KEYWORDS = [
    'box', 'piece', 'unit', 'item', 'product', 'goods', 'material',
    'equipment', 'device', 'machine', 'tool', 'component', 'part',
    'hardware', 'accessory', 'cable', 'adapter', 'battery',
    'caixa', 'peça', 'unidade', 'produto', 'mercadoria', 'material',
    'equipamento', 'dispositivo', 'máquina', 'ferramenta', 'componente',
    'parte', 'acessório', 'cabo', 'adaptador', 'bateria'
];

/**
 * Classifies an invoice item as physical product or service
 */
export function classifyItem(item: ItemType): 'physical' | 'service' | 'unknown' {
    // First check if user explicitly marked it as physical product
    if (item.isPhysicalProduct) {
        return 'physical';
    }
    
    // If explicitly marked as false, suggest as service
    if (item.isPhysicalProduct === false) {
        return 'service';
    }
    
    // If not explicitly set, use automatic classification as suggestion
    const searchText = `${item.name} ${item.description || ''}`.toLowerCase();
    
    // Check for service indicators
    const hasServiceKeywords = SERVICE_KEYWORDS.some(keyword => 
        searchText.includes(keyword.toLowerCase())
    );
    
    // Check for product indicators
    const hasProductKeywords = PRODUCT_KEYWORDS.some(keyword => 
        searchText.includes(keyword.toLowerCase())
    );
    
    // Digital/virtual items are usually services
    if (searchText.includes('digital') || searchText.includes('virtual') || 
        searchText.includes('online') || searchText.includes('software') ||
        searchText.includes('license') || searchText.includes('subscription')) {
        return 'service';
    }
    
    // If clear service indicators
    if (hasServiceKeywords && !hasProductKeywords) {
        return 'service';
    }
    
    // If clear product indicators
    if (hasProductKeywords && !hasServiceKeywords) {
        return 'physical';
    }
    
    // Additional heuristics
    
    // Items with very low unit price might be digital/services
    if (item.unitPrice < 1) {
        return 'service';
    }
    
    // Items with fractional quantities are often services (hours, etc.)
    if (item.quantity % 1 !== 0) {
        return 'service';
    }
    
    // Default to unknown if we can't determine
    return 'unknown';
}

/**
 * Gets all physical items from an invoice
 */
export function getPhysicalItems(invoice: InvoiceType): (ItemType & { index: number, classification: string })[] {
    return invoice.details.items
        .map((item, index) => ({
            ...item,
            index,
            classification: classifyItem(item)
        }))
        .filter(item => item.classification === 'physical');
}

/**
 * Gets all service items from an invoice
 */
export function getServiceItems(invoice: InvoiceType): (ItemType & { index: number, classification: string })[] {
    return invoice.details.items
        .map((item, index) => ({
            ...item,
            index,
            classification: classifyItem(item)
        }))
        .filter(item => item.classification === 'service');
}

/**
 * Gets all unknown classification items from an invoice
 */
export function getUnknownItems(invoice: InvoiceType): (ItemType & { index: number, classification: string })[] {
    return invoice.details.items
        .map((item, index) => ({
            ...item,
            index,
            classification: classifyItem(item)
        }))
        .filter(item => item.classification === 'unknown');
}

/**
 * Checks if an invoice has any physical items that can be packed
 */
export function hasPhysicalItems(invoice: InvoiceType): boolean {
    return getPhysicalItems(invoice).length > 0;
}

/**
 * Gets item classification summary for an invoice
 */
export function getItemClassificationSummary(invoice: InvoiceType) {
    const physical = getPhysicalItems(invoice);
    const services = getServiceItems(invoice);
    const unknown = getUnknownItems(invoice);
    
    return {
        physical: {
            count: physical.length,
            items: physical
        },
        services: {
            count: services.length,
            items: services
        },
        unknown: {
            count: unknown.length,
            items: unknown
        },
        total: invoice.details.items.length,
        hasPhysicalItems: physical.length > 0,
        hasOnlyServices: services.length === invoice.details.items.length,
        isMixed: physical.length > 0 && services.length > 0
    };
}

/**
 * Suggests default package configuration based on item types
 */
export function suggestPackageConfiguration(physicalItems: (ItemType & { index: number })[]): {
    suggestedPackages: number;
    estimatedWeight: number;
    itemCategories: string[];
} {
    if (physicalItems.length === 0) {
        return {
            suggestedPackages: 0,
            estimatedWeight: 0,
            itemCategories: []
        };
    }
    
    // Rough weight estimation based on item characteristics
    let estimatedWeight = 0;
    const categories = new Set<string>();
    
    physicalItems.forEach(item => {
        const searchText = `${item.name} ${item.description || ''}`.toLowerCase();
        
        // Categorize and estimate weight
        if (searchText.includes('electronic') || searchText.includes('computer') || 
            searchText.includes('phone') || searchText.includes('tablet')) {
            categories.add('electronics');
            estimatedWeight += item.quantity * 0.5; // 0.5kg average for electronics
        } else if (searchText.includes('book') || searchText.includes('document') || 
                   searchText.includes('paper')) {
            categories.add('books');
            estimatedWeight += item.quantity * 0.3; // 0.3kg average for books
        } else if (searchText.includes('clothing') || searchText.includes('textile') || 
                   searchText.includes('fabric')) {
            categories.add('textiles');
            estimatedWeight += item.quantity * 0.2; // 0.2kg average for clothing
        } else if (searchText.includes('machinery') || searchText.includes('equipment') || 
                   searchText.includes('tool')) {
            categories.add('machinery');
            estimatedWeight += item.quantity * 5; // 5kg average for machinery
        } else {
            categories.add('general');
            estimatedWeight += item.quantity * 1; // 1kg default
        }
    });
    
    // Suggest number of packages based on weight and item count
    const suggestedPackages = Math.max(1, Math.ceil(estimatedWeight / 20)); // Max 20kg per package
    
    return {
        suggestedPackages,
        estimatedWeight: Math.round(estimatedWeight * 100) / 100,
        itemCategories: Array.from(categories)
    };
}