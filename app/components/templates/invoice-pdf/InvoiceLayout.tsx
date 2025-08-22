import { ReactNode } from "react";

// Types
import { InvoiceType } from "@/types";

type InvoiceLayoutProps = {
    data: InvoiceType;
    children: ReactNode;
};

export default function InvoiceLayout({ data, children }: InvoiceLayoutProps) {
    const { sender, receiver, details } = data;

    // Fonts are now loaded locally via npm packages
    const head = null;

    return (
        <>
            {head}
            <section style={{ fontFamily: "Outfit, sans-serif" }}>
                <div className="flex flex-col p-4 sm:p-10 bg-white rounded-xl min-h-[60rem]">
                    {children}
                </div>
            </section>
        </>
    );
}
