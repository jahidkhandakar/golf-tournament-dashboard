import { baseApi } from "../../api/index.js";

export type AnalyticsRange = "Last 30 Days" | "Last Quarter" | "This Year";
export type DashboardChartRange = "Last 7 Days" | "Last 30 Days" | "This Year";

export const metaApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminStats: builder.query<any, void>({
            query: () => ({
                url: "/meta/stats",
                method: "GET",
            }),
            providesTags: ["dashboard"],
        }),
        getAdminAnalytics: builder.query<
            any,
            { range?: AnalyticsRange; viewAllCoaches?: boolean }
        >({
            query: ({ range = "Last 30 Days", viewAllCoaches = false } = {}) => ({
                url: "/meta/analytics",
                method: "GET",
                params: {
                    range,
                    viewAllCoaches: viewAllCoaches ? "true" : "false",
                },
            }),
            providesTags: ["dashboard"],
        }),
        getDashboardOverview: builder.query<
            any,
            { range?: DashboardChartRange } | void
        >({
            query: (args) => ({
                url: "/meta/dashboard-overview",
                method: "GET",
                params: {
                    range: args?.range ?? "Last 7 Days",
                },
            }),
            providesTags: ["dashboard"],
        }),
    }),
});

export const {
    useGetAdminStatsQuery,
    useGetAdminAnalyticsQuery,
    useGetDashboardOverviewQuery,
} = metaApi;
