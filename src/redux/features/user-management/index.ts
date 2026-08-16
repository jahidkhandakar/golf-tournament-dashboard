import { baseApi } from "../../api/index.js";

export type IGetUsersParams = {
  page?: number | undefined;
  limit?: number | undefined;
  searchTerm?: string | undefined;
  status?: string | undefined;
  role?: string | undefined;
  sort?: string | undefined;
};

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, IGetUsersParams | void>({
      query: (params) => ({
        url: "/user/get-all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.role ? { role: params.role } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
        },
      }),
      providesTags: ["users"],
    }),
    getUserById: builder.query<any, string>({
      query: (id) => ({
        url: `/user/find/${id}`,
        method: "GET",
      }),
      providesTags: ["users"],
    }),
    changeUserStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/user/change-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["users"],
    }),
    deleteUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `/user/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users", "coaches"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useChangeUserStatusMutation,
  useDeleteUserMutation,
} = userApi;
