import React from "react";
import type { IDashboardTitleProps } from "../../../types/common/index.js";

export default function DashboardTitle({
    title,
    subtitle,
    children,
}: IDashboardTitleProps & { children?: React.ReactNode }) {

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {title}
                </h1>
                {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
            </div>

            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    );
}