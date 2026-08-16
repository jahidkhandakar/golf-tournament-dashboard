import { baseApi } from "../../api/index.js";

export type PlanType = "trial" | "standard" | "pro" | "elite";
export type PlanCurrency = "USD" | "EUR" | "GBP";
export type PlanBillingInterval =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type PlanFeature = {
  label: string;
  included?: boolean;
};

export type PlanPayload = {
  name: string;
  planType: PlanType;
  description?: string;
  price: number;
  currency?: PlanCurrency;
  billingInterval?: PlanBillingInterval;
  trialDays?: number;
  features?: PlanFeature[];
  tags?: string[];
};

export type GetPlansParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
  planType?: PlanType;
  billingInterval?: PlanBillingInterval;
  currency?: PlanCurrency;
};

export const planApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<any, GetPlansParams | void>({
      query: (params) => ({
        url: "/plan/get-all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.planType ? { planType: params.planType } : {}),
          ...(params?.billingInterval
            ? { billingInterval: params.billingInterval }
            : {}),
          ...(params?.currency ? { currency: params.currency } : {}),
        },
      }),
      providesTags: ["plans"],
    }),
    getPlanById: builder.query<any, string>({
      query: (id) => ({
        url: `/plan/find/${id}`,
        method: "GET",
      }),
      providesTags: ["plans"],
    }),
    createPlan: builder.mutation<any, PlanPayload>({
      query: (body) => ({
        url: "/plan/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["plans"],
    }),
    updatePlan: builder.mutation<
      any,
      { id: string; body: Partial<PlanPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/plan/update/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["plans"],
    }),
    deletePlan: builder.mutation<any, string>({
      query: (id) => ({
        url: `/plan/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["plans"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = planApi;
