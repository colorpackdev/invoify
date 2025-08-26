// Smart pagination utilities for PDF generation
// Helps prevent bad page breaks and optimize page usage

export interface PaginationOptions {
    maxHeight: string; // e.g., '29.7cm' for A4
    minSecondPageThreshold: number; // percentage (0-100) - if overflow is less than this, try to fit on one page
    allowAutoResize: boolean; // whether to allow font/spacing reduction to fit content
    maxAutoResizePercent: number; // maximum percentage to reduce (e.g., 10 for 10% reduction)
}

export const DEFAULT_PAGINATION_OPTIONS: PaginationOptions = {
    maxHeight: '29.7cm', // A4 height
    minSecondPageThreshold: 5, // if less than 5% overflow, try to fit on one page
    allowAutoResize: true,
    maxAutoResizePercent: 8, // up to 8% reduction
};

// CSS classes for preventing page breaks
export const PAGINATION_CLASSES = {
    // Prevents page breaks inside this element
    keepTogether: 'print:break-inside-avoid',
    
    // Prevents page breaks before this element
    keepWithPrevious: 'print:break-before-avoid',
    
    // Prevents page breaks after this element  
    keepWithNext: 'print:break-after-avoid',
    
    // Forces a page break before this element
    pageBreakBefore: 'print:break-before-page',
    
    // Forces a page break after this element
    pageBreakAfter: 'print:break-after-page',
    
    // Container with smart page break handling
    smartContainer: 'print:break-inside-auto',
    
    // Critical blocks that should never be split (like totals section)
    criticalBlock: 'print:break-inside-avoid print:break-before-avoid-page',
    
    // Item rows that should stay together
    itemRow: 'print:break-inside-avoid',
    
    // Header sections
    headerSection: 'print:break-after-avoid',
    
    // Footer sections  
    footerSection: 'print:break-before-avoid',
};

// CSS for auto-resize when content barely overflows
export const getAutoResizeStyles = (resizePercent: number) => {
    if (resizePercent === 0) return {};
    
    const scaleFactor = 1 - (resizePercent / 100);
    
    return {
        fontSize: `${scaleFactor * 100}%`,
        lineHeight: `${scaleFactor * 1.2}`,
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'top left',
        width: `${100 / scaleFactor}%`, // Compensate for transform scale
    };
};

// Utility functions for CSS class generation
export const getSmartContainerClasses = (className?: string) => 
    `${PAGINATION_CLASSES.smartContainer} ${className || ''}`;

export const getCriticalBlockClasses = (className?: string) => 
    `${PAGINATION_CLASSES.criticalBlock} ${className || ''}`;

export const getItemRowClasses = (className?: string) => 
    `${PAGINATION_CLASSES.itemRow} ${className || ''}`;

// Calculate if content should be auto-resized based on overflow
export const shouldAutoResize = (
    estimatedHeight: number, 
    maxHeight: number, 
    options: PaginationOptions
): { shouldResize: boolean; resizePercent: number } => {
    if (!options.allowAutoResize || estimatedHeight <= maxHeight) {
        return { shouldResize: false, resizePercent: 0 };
    }
    
    const overflowPercent = ((estimatedHeight - maxHeight) / maxHeight) * 100;
    
    // If overflow is small (less than threshold), try to fit by resizing
    if (overflowPercent <= options.minSecondPageThreshold) {
        const neededReduction = Math.min(overflowPercent + 1, options.maxAutoResizePercent);
        return { shouldResize: true, resizePercent: neededReduction };
    }
    
    return { shouldResize: false, resizePercent: 0 };
};

// CSS custom properties for dynamic pagination
export const PAGINATION_CSS_VARS = `
    :root {
        --page-height: 29.7cm;
        --page-width: 21cm;
        --page-margin-top: 1.5cm;
        --page-margin-bottom: 1.5cm;
        --page-margin-left: 1.5cm;
        --page-margin-right: 1.5cm;
        --content-height: calc(var(--page-height) - var(--page-margin-top) - var(--page-margin-bottom));
        --content-width: calc(var(--page-width) - var(--page-margin-left) - var(--page-margin-right));
        --min-second-page-content: 5%;
    }
    
    .smart-page-container {
        max-width: var(--content-width);
        margin: 0 auto;
        padding: var(--page-margin-top) var(--page-margin-right) var(--page-margin-bottom) var(--page-margin-left);
    }
    
    .auto-resize-container {
        transition: all 0.2s ease-in-out;
    }
    
    /* Enhanced print styles for better pagination */
    @media print {
        @page {
            size: A4;
            margin-top: var(--page-margin-top);
            margin-bottom: var(--page-margin-bottom);  
            margin-left: var(--page-margin-left);
            margin-right: var(--page-margin-right);
            
            /* Ensure consistent margins on all pages */
            @top-left { margin: 0; }
            @top-center { margin: 0; }
            @top-right { margin: 0; }
            @bottom-left { margin: 0; }
            @bottom-center { margin: 0; }
            @bottom-right { margin: 0; }
        }
        
        /* Override container padding as @page margins handle this */
        .smart-page-container {
            padding: 0;
            margin: 0;
            max-width: none;
        }
        
        /* Critical content blocks that must stay together */
        .details-block,
        .payment-section,
        .totals-section,
        .signature-section,
        .notes-section,
        .additional-notes,
        .payment-terms,
        .special-instructions,
        .compliance-info {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            orphans: 3;
            widows: 3;
        }
        
        /* Keep invoice header together */
        .invoice-header {
            break-after: avoid;
            page-break-after: avoid;
        }
        
        /* Keep item groups together when possible */
        .item-group,
        .package-group {
            break-inside: avoid;
            page-break-inside: avoid;
            orphans: 2;
            widows: 2;
        }
        
        /* Individual item rows should stay together */
        .item-row {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            orphans: 2;
            widows: 2;
        }
        
        /* Smart table handling */
        table {
            break-inside: auto;
        }
        
        thead {
            break-after: avoid;
            page-break-after: avoid;
        }
        
        tbody tr {
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        /* Specific elements that should be kept with following content */
        .keep-with-next {
            break-after: avoid;
            page-break-after: avoid;
        }
        
        /* Specific elements that should be kept with previous content */  
        .keep-with-previous {
            break-before: avoid;
            page-break-before: avoid;
        }
        
        /* Force page break before specific elements when needed */
        .page-break-before {
            break-before: page;
            page-break-before: always;
        }
        
        /* Prevent page breaks for small content blocks */
        .no-break-small {
            break-inside: avoid;
            page-break-inside: avoid;
            min-height: 2em;
        }
    }
`;