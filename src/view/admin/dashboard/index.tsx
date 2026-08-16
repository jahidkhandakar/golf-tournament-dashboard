import { useMemo, useState, type ComponentType } from "react";
import {
    Users,
    GraduationCap,
    Video,
    BrainCircuit,
    ClipboardList,
    Crown,
    Activity,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    MessageSquare,
    UserCheck,
} from "lucide-react";
import { Select, Spin } from "antd";
import ReactApexChart from "react-apexcharts";
import type { Props as ApexChartProps } from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
    useGetDashboardOverviewQuery,
    type DashboardChartRange,
} from "../../../redux/features/dashboard/index.js";

const Chart = ReactApexChart as unknown as ComponentType<ApexChartProps>;

const KPI_ICONS: Record<string, any> = {
    totalUsers: Users,
    activeCoaches: GraduationCap,
    totalSwings: Video,
    coachFeedback: MessageSquare,
    aiAnalyses: BrainCircuit,
    pendingReviews: ClipboardList,
    premiumSubscribers: Crown,
    todayActiveUsers: UserCheck,
};

const FALLBACK_KPIS = [
    { key: "totalUsers", title: "Total Users", value: "0", change: "0%" },
    { key: "activeCoaches", title: "Active Coaches", value: "0", change: "0%" },
    { key: "totalSwings", title: "Total Swings Recorded", value: "0", change: "0%" },
    { key: "coachFeedback", title: "Coach Total Feedback", value: "0", change: "0%" },
    { key: "aiAnalyses", title: "AI Analyses", value: "0", change: "0%" },
    { key: "pendingReviews", title: "Pending Coach Reviews", value: "0", change: "0%" },
    { key: "premiumSubscribers", title: "Premium Subscribers", value: "0", change: "0%" },
    { key: "todayActiveUsers", title: "Today Active User", value: "0", change: "0%" },
];

const StatCard = ({ title, value, icon: Icon, change }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <div className={`text-xs font-semibold mt-2 flex items-center ${String(change).startsWith('+') ? 'text-green-600' : String(change).startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
                {String(change).startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                {change} from last month
            </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl text-[var(--color-primary)]">
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

export default function Dashboard() {
    const [chartRange, setChartRange] = useState<DashboardChartRange>("Last 7 Days");
    const { data, isLoading, isFetching } = useGetDashboardOverviewQuery({
        range: chartRange,
    });

    const payload = data?.data ?? data;
    const kpiCards = (payload?.kpis?.length ? payload.kpis : FALLBACK_KPIS).map(
        (kpi: any) => ({
            ...kpi,
            icon: KPI_ICONS[kpi.key] || Users,
        }),
    );
    const recentActivity = payload?.recentActivity ?? [];
    const platformAnalytics = payload?.platformAnalytics;

    const chartOptions = useMemo<ApexOptions>(() => {
        const apiOptions = platformAnalytics?.options ?? {};
        return {
            colors: ["#2563eb", "#16a34a"],
            dataLabels: { enabled: false },
            stroke: { curve: "smooth", width: 2 },
            plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
            grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
            legend: { position: "top", horizontalAlign: "right" },
            ...apiOptions,
            chart: {
                ...(apiOptions.chart || {}),
                toolbar: { show: false },
                zoom: { enabled: false },
            },
            xaxis: {
                categories: apiOptions.xaxis?.categories ?? [],
                axisBorder: { show: false },
                axisTicks: { show: false },
                ...apiOptions.xaxis,
            },
        };
    }, [platformAnalytics?.options]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="mt-1 text-gray-500 text-sm">
                        Welcome back! Here's what's happening on GolfImprove today.
                    </p>
                </div>
                <div className="md:text-right">
                    <p className="text-sm text-gray-500 font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                    <h3 className="font-bold text-gray-900">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                </div>
            </div>

            <Spin spinning={isLoading || isFetching}>
                {/* KPI Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((stat: any, index: number) => {
                        const { key, ...cardProps } = stat;
                        return <StatCard key={key || index} {...cardProps} />;
                    })}
                </div>

                {/* Charts & Activity Section */}
                <div className="grid gap-6 lg:grid-cols-3 mt-8">
                    
                    {/* Platform Analytics Charts */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                                Platform Analytics
                            </h2>
                            <Select 
                                className="w-32 h-[34px]"
                                value={chartRange}
                                onChange={(value) => setChartRange(value as DashboardChartRange)}
                                options={[
                                    { value: 'Last 7 Days', label: 'Last 7 Days' },
                                    { value: 'Last 30 Days', label: 'Last 30 Days' },
                                    { value: 'This Year', label: 'This Year' },
                                ]}
                            />
                        </div>
                        <div className="flex-1 min-h-[280px]">
                            <Chart
                                options={chartOptions}
                                series={
                                    platformAnalytics?.series ?? [
                                        { name: "Daily Active Users", data: [] },
                                        { name: "Swings", data: [] },
                                    ]
                                }
                                type="bar"
                                height="100%"
                            />
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                            <button className="text-[var(--color-primary)] text-sm font-semibold hover:underline">View All</button>
                        </div>
                        <div className="space-y-6">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">No recent activity yet.</p>
                            ) : (
                                recentActivity.map((activity: any) => (
                                    <div key={activity.id} className="flex items-start gap-4">
                                        <img
                                            src={activity.avatar || `https://i.pravatar.cc/150?u=${activity.id}`}
                                            alt={activity.name}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-900 font-medium">
                                                <span className="font-bold">{activity.name}</span> {activity.action}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="w-full mt-6 py-2.5 bg-gray-50 text-[var(--color-primary)] rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                            Detailed Activity Log <ArrowUpRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    
                </div>
            </Spin>
        </div>
    );
}
