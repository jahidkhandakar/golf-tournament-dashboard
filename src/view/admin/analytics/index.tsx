import { useMemo, useState, type ComponentType } from "react";
import { TrendingUp, Activity, Calendar, Download } from "lucide-react";
import { Select, Spin, Button } from "antd";
import ReactApexChart from "react-apexcharts";
import type { Props as ApexChartProps } from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
    useGetAdminAnalyticsQuery,
    type AnalyticsRange,
} from "../../../redux/features/dashboard/index.js";

// react-apexcharts default export is a function component; its .d.ts types it as a
// class, which breaks under module: nodenext + verbatimModuleSyntax.
const Chart = ReactApexChart as unknown as ComponentType<ApexChartProps>;

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
    { value: "Last 30 Days", label: "Last 30 Days" },
    { value: "Last Quarter", label: "Last Quarter" },
    { value: "This Year", label: "This Year" },
];

const formatMoney = (value: number) =>
    `$${Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatChange = (changePercent?: number, trend?: string) => {
    const value = Number(changePercent ?? 0);
    const sign = value > 0 ? "+" : "";
    const color =
        trend === "down"
            ? "text-red-500"
            : trend === "up"
              ? "text-green-600"
              : "text-gray-500";
    return { text: `${sign}${value}%`, color };
};

const mergeChartOptions = (
    apiOptions: ApexOptions | undefined,
    fallback: ApexOptions,
): ApexOptions => ({
    ...fallback,
    ...apiOptions,
    chart: { ...fallback.chart, ...apiOptions?.chart, toolbar: { show: false } },
    xaxis: { ...fallback.xaxis, ...apiOptions?.xaxis },
});

export default function Analytics() {
    const [range, setRange] = useState<AnalyticsRange>("Last 30 Days");
    const [viewAllCoaches, setViewAllCoaches] = useState(false);

    const { data, isLoading, isFetching } = useGetAdminAnalyticsQuery({
        range,
        viewAllCoaches,
    });

    const payload = data?.data ?? data;
    const kpis = payload?.kpis;
    const charts = payload?.charts;
    const halfYearLabel = payload?.range?.halfYear;

    const revenueOptions = useMemo(
        () =>
            mergeChartOptions(charts?.revenueGrowth?.options, {
                colors: ["#16a34a"],
                dataLabels: { enabled: false },
                stroke: { curve: "smooth", width: 3 },
                fill: {
                    type: "gradient",
                    gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
                },
                grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
            }),
        [charts?.revenueGrowth?.options],
    );

    const userGrowthOptions = useMemo(
        () =>
            mergeChartOptions(charts?.userGrowth?.options, {
                colors: ["#2563eb", "#93c5fd"],
                dataLabels: { enabled: false },
                plotOptions: { bar: { borderRadius: 5, columnWidth: "48%" } },
                grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
                legend: { position: "top", horizontalAlign: "right" },
            }),
        [charts?.userGrowth?.options],
    );

    const aiUsageOptions = useMemo(
        () =>
            mergeChartOptions(charts?.aiUsageByCategory?.options, {
                colors: ["#7c3aed", "#2563eb", "#06b6d4", "#f59e0b"],
                dataLabels: { enabled: false },
                legend: { position: "bottom" },
                plotOptions: {
                    pie: {
                        donut: {
                            size: "68%",
                            labels: { show: true, total: { show: true, label: "Total" } },
                        },
                    },
                },
                stroke: { colors: ["#ffffff"], width: 3 },
            }),
        [charts?.aiUsageByCategory?.options],
    );

    const coachPerformanceOptions = useMemo(
        () =>
            mergeChartOptions(charts?.coachPerformance?.options, {
                colors: ["#0f766e"],
                dataLabels: { enabled: false },
                plotOptions: {
                    bar: { borderRadius: 5, horizontal: true, barHeight: "55%" },
                },
                grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
            }),
        [charts?.coachPerformance?.options],
    );

    const revenueChange = formatChange(
        kpis?.totalRevenue?.changePercent,
        kpis?.totalRevenue?.trend,
    );
    const usersChange = formatChange(
        kpis?.newUsers?.changePercent,
        kpis?.newUsers?.trend,
    );
    const aiChange = formatChange(
        kpis?.aiAnalyses?.changePercent,
        kpis?.aiAnalyses?.trend,
    );
    const coachesChange = formatChange(
        kpis?.activeCoaches?.changePercent,
        kpis?.activeCoaches?.trend,
    );

    const totalCoaches = charts?.coachPerformance?.totalCoaches ?? 0;
    const showingAll = Boolean(charts?.coachPerformance?.viewAll);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Analytics & Reports
                    </h1>
                    <p className="mt-1 text-gray-500 text-sm">
                        View platform performance, user engagement, and revenue metrics.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <Select
                            className="w-36"
                            variant="borderless"
                            value={range}
                            options={RANGE_OPTIONS}
                            onChange={(value) => setRange(value as AnalyticsRange)}
                        />
                    </div>
                    <button
                        type="button"
                        className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            <Spin spinning={isLoading || isFetching}>
                {/* Top Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {formatMoney(kpis?.totalRevenue?.value ?? 0)}
                        </h3>
                        <p
                            className={`text-xs font-semibold mt-2 flex items-center ${revenueChange.color}`}
                        >
                            <TrendingUp className="w-3 h-3 mr-1" /> {revenueChange.text}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">New Users</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {(kpis?.newUsers?.value ?? 0).toLocaleString()}
                        </h3>
                        <p
                            className={`text-xs font-semibold mt-2 flex items-center ${usersChange.color}`}
                        >
                            <TrendingUp className="w-3 h-3 mr-1" /> {usersChange.text}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">AI Analyses</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {(kpis?.aiAnalyses?.value ?? 0).toLocaleString()}
                        </h3>
                        <p
                            className={`text-xs font-semibold mt-2 flex items-center ${aiChange.color}`}
                        >
                            <TrendingUp className="w-3 h-3 mr-1" /> {aiChange.text}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Active Coaches</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {(kpis?.activeCoaches?.value ?? 0).toLocaleString()}
                        </h3>
                        <p
                            className={`text-xs font-semibold mt-2 flex items-center ${coachesChange.color}`}
                        >
                            <Activity className="w-3 h-3 mr-1" /> {coachesChange.text}
                        </p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Revenue Chart — half year months */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Revenue Growth</h3>
                            {halfYearLabel && (
                                <span className="text-xs text-gray-400 font-medium">
                                    {halfYearLabel}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-h-0">
                            <Chart
                                options={revenueOptions}
                                series={
                                    charts?.revenueGrowth?.series ?? [
                                        { name: "Revenue", data: [0, 0, 0, 0, 0, 0] },
                                    ]
                                }
                                type="area"
                                height="100%"
                            />
                        </div>
                    </div>

                    {/* User Growth Chart — half year months */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">
                                User Growth & Retention
                            </h3>
                            {halfYearLabel && (
                                <span className="text-xs text-gray-400 font-medium">
                                    {halfYearLabel}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-h-0">
                            <Chart
                                options={userGrowthOptions}
                                series={
                                    charts?.userGrowth?.series ?? [
                                        { name: "New Users", data: [0, 0, 0, 0, 0, 0] },
                                        { name: "Active Users", data: [0, 0, 0, 0, 0, 0] },
                                    ]
                                }
                                type="bar"
                                height="100%"
                            />
                        </div>
                    </div>

                    {/* AI Usage Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px] flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-4">
                            AI Usage by Category
                        </h3>
                        <div className="flex-1 min-h-0">
                            <Chart
                                options={aiUsageOptions}
                                series={charts?.aiUsageByCategory?.series ?? [0]}
                                type="donut"
                                height="100%"
                            />
                        </div>
                    </div>

                    {/* Coach Performance — top 5, View all */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[350px] flex flex-col">
                        <div className="flex items-center justify-between mb-4 gap-2">
                            <h3 className="font-bold text-gray-900">Coach Performance</h3>
                            <Button
                                type="link"
                                className="px-0"
                                onClick={() => setViewAllCoaches((prev) => !prev)}
                                disabled={totalCoaches <= 5 && !showingAll}
                            >
                                {showingAll
                                    ? "Show top 5"
                                    : `View all${totalCoaches ? ` (${totalCoaches})` : ""}`}
                            </Button>
                        </div>
                        <div className="flex-1 min-h-0">
                            <Chart
                                options={coachPerformanceOptions}
                                series={
                                    charts?.coachPerformance?.series ?? [
                                        { name: "Performance", data: [] },
                                    ]
                                }
                                type="bar"
                                height="100%"
                            />
                        </div>
                    </div>
                </div>
            </Spin>
        </div>
    );
}
