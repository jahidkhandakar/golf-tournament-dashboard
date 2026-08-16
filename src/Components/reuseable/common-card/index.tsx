import type React from "react";
import {
    Package,
    DollarSign,
    TriangleAlert,
    ShoppingCart,
    TrendingUp,
} from "lucide-react";


export const StatCard = ({ title, amount, icon, }: { title: string; amount: string, icon: React.ReactNode, }) => (
    <div className="rounded-xl border border-gray-100 bg-white p-6 border border-slate-200">
        <div className="flex items-center gap-4">
            <div className="text-3xl bg-primary/10 p-2 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-lg font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500">{amount}</p>
            </div>
        </div>
    </div>
);

export const SalesSummary = ({
    totalRevenue,
}: {
    totalRevenue: number;
}) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Sales Summary
            </h2>

            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 p-6">
                <p className="text-gray-500 mb-2">Today's Sales</p>
                <h3 className="text-3xl font-bold text-emerald-600">
                    ${totalRevenue}
                </h3>
                <p className="text-sm text-gray-400 mt-2">
                    +12% from yesterday
                </p>
            </div>
        </div>
    );
};