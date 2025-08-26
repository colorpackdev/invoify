import React from 'react';
import { 
    PaginationOptions, 
    DEFAULT_PAGINATION_OPTIONS, 
    getAutoResizeStyles,
    shouldAutoResize,
    PAGINATION_CSS_VARS 
} from '@/lib/helpers/smartPagination';

interface SmartPdfContainerProps {
    children: React.ReactNode;
    estimatedContentHeight?: number; // in pixels or relative units
    paginationOptions?: Partial<PaginationOptions>;
    className?: string;
    testMode?: boolean; // for development/testing
}

export const SmartPdfContainer: React.FC<SmartPdfContainerProps> = ({
    children,
    estimatedContentHeight = 0,
    paginationOptions = {},
    className = '',
    testMode = false,
}) => {
    const options = { ...DEFAULT_PAGINATION_OPTIONS, ...paginationOptions };
    
    const resizeInfo = (() => {
        if (!estimatedContentHeight) return { shouldResize: false, resizePercent: 0 };
        
        // Convert A4 height to pixels (approximate)
        const a4HeightPx = 842; // 29.7cm at 72dpi
        
        return shouldAutoResize(estimatedContentHeight, a4HeightPx, options);
    })();
    
    const containerStyles = (() => {
        if (!resizeInfo.shouldResize) return {};
        return getAutoResizeStyles(resizeInfo.resizePercent);
    })();
    
    return (
        <>
            {/* Inject pagination CSS */}
            <style dangerouslySetInnerHTML={{ __html: PAGINATION_CSS_VARS }} />
            
            <div 
                className={`smart-page-container auto-resize-container ${className}`}
                style={containerStyles}
            >
                {testMode && resizeInfo.shouldResize && (
                    <div 
                        style={{ 
                            position: 'fixed', 
                            top: 0, 
                            left: 0, 
                            background: 'orange', 
                            color: 'white', 
                            padding: '4px 8px', 
                            fontSize: '12px', 
                            zIndex: 9999 
                        }}
                    >
                        Auto-resized by {resizeInfo.resizePercent.toFixed(1)}%
                    </div>
                )}
                
                {children}
            </div>
        </>
    );
};

// Specific containers for different sections
export const InvoiceHeaderContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
    children, 
    className = '' 
}) => (
    <div className={`invoice-header print:break-after-avoid ${className}`}>
        {children}
    </div>
);

export const ItemsTableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
    children, 
    className = '' 
}) => (
    <div className={`items-table print:break-inside-auto ${className}`}>
        {children}
    </div>
);

export const ItemRowContainer: React.FC<{ 
    children: React.ReactNode; 
    className?: string;
    isLast?: boolean;
}> = ({ 
    children, 
    className = '', 
    isLast = false 
}) => (
    <div className={`item-row print:break-inside-avoid ${isLast ? 'print:break-after-avoid' : ''} ${className}`}>
        {children}
    </div>
);

export const TotalsContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
    children, 
    className = '' 
}) => (
    <div className={`totals-section print:break-inside-avoid print:break-before-avoid-page ${className}`}>
        {children}
    </div>
);

export const PaymentInfoContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
    children, 
    className = '' 
}) => (
    <div className={`payment-section details-block print:break-inside-avoid print:break-before-avoid ${className}`}>
        {children}
    </div>
);

export const SignatureContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
    children, 
    className = '' 
}) => (
    <div className={`signature-section print:break-inside-avoid print:break-before-avoid ${className}`}>
        {children}
    </div>
);

export default SmartPdfContainer;