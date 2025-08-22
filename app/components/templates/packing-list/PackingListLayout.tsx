import { ReactNode } from "react";

// Types
import { PackingListType } from "@/lib/schemas/packingList";

type PackingListLayoutProps = {
    data: PackingListType;
    children: ReactNode;
};

export default function PackingListLayout({ data, children }: PackingListLayoutProps) {
    const { shipper, consignee } = data;

    return (
        <section style={{ fontFamily: "Outfit, sans-serif" }}>
            <div className="flex flex-col p-4 sm:p-10 bg-white rounded-xl min-h-[60rem]">
                {children}
            </div>
        </section>
    );
}