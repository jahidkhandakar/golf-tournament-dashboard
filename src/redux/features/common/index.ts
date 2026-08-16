import { baseApi } from "../../api/index.js";

export type CommonContent = {
  _id: string;
  content: string;
  description?: string;
  published?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SupportSettings = {
  _id?: string;
  email: string;
  phoneNumber: string;
  address?: string;
};

type ContentPayload = { content: string };
type UpdateContentPayload = { id: string; content: string };

export const commonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAbout: builder.query<{ data: CommonContent[] }, void>({
      query: () => ({ url: "/common/about", method: "GET" }),
      providesTags: ["common"],
    }),
    createAbout: builder.mutation<any, ContentPayload>({
      query: (body) => ({
        url: "/common/about/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["common"],
    }),
    updateAbout: builder.mutation<any, UpdateContentPayload>({
      query: ({ id, content }) => ({
        url: `/common/about/update/${id}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: ["common"],
    }),
    getTerms: builder.query<{ data: CommonContent[] }, void>({
      query: () => ({ url: "/common/terms", method: "GET" }),
      providesTags: ["common"],
    }),
    createTerms: builder.mutation<any, ContentPayload>({
      query: (body) => ({
        url: "/common/terms/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["common"],
    }),
    updateTerms: builder.mutation<any, UpdateContentPayload>({
      query: ({ id, content }) => ({
        url: `/common/terms/update/${id}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: ["common"],
    }),
    getPrivacyPolicy: builder.query<{ data: CommonContent[] }, void>({
      query: () => ({ url: "/common/privacy-policy", method: "GET" }),
      providesTags: ["common"],
    }),
    createPrivacyPolicy: builder.mutation<any, ContentPayload>({
      query: (body) => ({
        url: "/common/privacy-policy/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["common"],
    }),
    updatePrivacyPolicy: builder.mutation<any, UpdateContentPayload>({
      query: ({ id, content }) => ({
        url: `/common/privacy-policy/update/${id}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: ["common"],
    }),
    getSupportSettings: builder.query<{ data: SupportSettings }, void>({
      query: () => ({ url: "/common/support", method: "GET" }),
      providesTags: ["common"],
    }),
    saveSupportSettings: builder.mutation<any, SupportSettings>({
      query: (body) => ({
        url: "/common/create-or-update",
        method: "POST",
        body,
      }),
      invalidatesTags: ["common"],
    }),
  }),
});

export const {
  useGetAboutQuery,
  useCreateAboutMutation,
  useUpdateAboutMutation,
  useGetTermsQuery,
  useCreateTermsMutation,
  useUpdateTermsMutation,
  useGetPrivacyPolicyQuery,
  useCreatePrivacyPolicyMutation,
  useUpdatePrivacyPolicyMutation,
  useGetSupportSettingsQuery,
  useSaveSupportSettingsMutation,
} = commonApi;
