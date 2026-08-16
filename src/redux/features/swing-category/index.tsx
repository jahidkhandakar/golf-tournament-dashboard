import { baseApi } from "../../api/index.js";

export type SwingCategoryDifficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export type SwingCategoryPayload = {
  name: string;
  difficulty?: SwingCategoryDifficulty;
  cameraAngles?: string[];
  isActive?: boolean;
  sortOrder?: number;
};

export type GetSwingCategoriesParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  difficulty?: SwingCategoryDifficulty;
  isActive?: boolean;
  sort?: string;
};

export const swingCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSwingCategories: builder.query<any, GetSwingCategoriesParams | void>({
      query: (params) => ({
        url: "/swing-category/get-all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.difficulty ? { difficulty: params.difficulty } : {}),
          ...(params?.isActive !== undefined
            ? { isActive: params.isActive }
            : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
        },
      }),
      providesTags: ["swingCategories"],
    }),
    getSwingCategoryById: builder.query<any, string>({
      query: (id) => ({
        url: `/swing-category/find/${id}`,
        method: "GET",
      }),
      providesTags: ["swingCategories"],
    }),
    createSwingCategory: builder.mutation<any, SwingCategoryPayload>({
      query: (body) => ({
        url: "/swing-category/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["swingCategories"],
    }),
    updateSwingCategory: builder.mutation<
      any,
      { id: string; body: Partial<SwingCategoryPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/swing-category/update/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["swingCategories"],
    }),
    deleteSwingCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/swing-category/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["swingCategories"],
    }),
    addSwingCategoryAngle: builder.mutation<
      any,
      { id: string; cameraAngle: string }
    >({
      query: ({ id, cameraAngle }) => ({
        url: `/swing-category/${id}/angles`,
        method: "POST",
        body: { cameraAngle },
      }),
      invalidatesTags: ["swingCategories"],
    }),
    removeSwingCategoryAngle: builder.mutation<
      any,
      { id: string; angle: string }
    >({
      query: ({ id, angle }) => ({
        url: `/swing-category/${id}/angles/${encodeURIComponent(angle)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["swingCategories"],
    }),
    getCameraSwingCategories: builder.query<any, void>({
      query: () => ({
        url: "/swing-category/camera",
        method: "GET",
      }),
      providesTags: ["swingCategories"],
    }),
    trackSwingCategoryUsage: builder.mutation<
      any,
      {
        categoryId: string;
        cameraAngle?: string;
        recordingMode?: "slow-mo" | "swing" | "video";
      }
    >({
      query: (body) => ({
        url: "/swing-category/track-usage",
        method: "POST",
        body,
      }),
      invalidatesTags: ["swingCategories"],
    }),
  }),
});

export const {
  useGetSwingCategoriesQuery,
  useGetSwingCategoryByIdQuery,
  useCreateSwingCategoryMutation,
  useUpdateSwingCategoryMutation,
  useDeleteSwingCategoryMutation,
  useAddSwingCategoryAngleMutation,
  useRemoveSwingCategoryAngleMutation,
  useGetCameraSwingCategoriesQuery,
  useTrackSwingCategoryUsageMutation,
} = swingCategoryApi;
