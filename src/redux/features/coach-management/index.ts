import { baseApi } from "../../api/index.js";

export type IGetCoachesParams = {
    page?: number | undefined;
    limit?: number | undefined;
    searchTerm?: string | undefined;
    status?: string | undefined;
    sort?: string | undefined;
};

export type IGetCoachStatsParams = {
    coachId: string;
    page?: number | undefined;
    limit?: number | undefined;
    searchTerm?: string | undefined;
};

export type IGetCoachUsersParams = {
    coachId: string;
    page?: number | undefined;
    limit?: number | undefined;
    searchTerm?: string | undefined;
    sort?: string | undefined;
};

export type IAssignUsersToCoachPayload = {
    coachId: string;
    userId: string | string[];
    notes?: string | undefined;
};

export const coachApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Admin — all coaches with performance summary
        getCoaches: builder.query<any, IGetCoachesParams | void>({
            query: (params) => ({
                url: "/coach-users/coaches",
                method: "GET",
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 10,
                    ...(params?.searchTerm
                        ? { searchTerm: params.searchTerm }
                        : {}),
                    ...(params?.status ? { status: params.status } : {}),
                    ...(params?.sort ? { sort: params.sort } : {}),
                },
            }),
            providesTags: ["coaches"],
        }),

        // Admin — one coach profile + stats + assigned students
        getCoachStats: builder.query<any, IGetCoachStatsParams>({
            query: ({ coachId, page, limit, searchTerm }) => ({
                url: `/coach-users/coaches/${coachId}/stats`,
                method: "GET",
                params: {
                    page: page ?? 1,
                    limit: limit ?? 10,
                    ...(searchTerm ? { searchTerm } : {}),
                },
            }),
            providesTags: ["coaches"],
        }),

        // Admin — list users assigned to a coach
        getCoachUsers: builder.query<any, IGetCoachUsersParams>({
            query: ({ coachId, page, limit, searchTerm, sort }) => ({
                url: `/coach-users/coach/${coachId}/users`,
                method: "GET",
                params: {
                    page: page ?? 1,
                    limit: limit ?? 10,
                    ...(searchTerm ? { searchTerm } : {}),
                    ...(sort ? { sort } : {}),
                },
            }),
            providesTags: ["coaches"],
        }),

        // Admin — assign one or more users to a coach
        assignUsersToCoach: builder.mutation<any, IAssignUsersToCoachPayload>({
            query: (body) => ({
                url: "/coach-users/assign",
                method: "POST",
                body,
            }),
            invalidatesTags: ["coaches", "users"],
        }),

        // Admin — remove one or more users from a coach (comma-separated userIds)
        removeUsersFromCoach: builder.mutation<
            any,
            { coachId: string; userId: string | string[] }
        >({
            query: ({ coachId, userId }) => {
                const ids = Array.isArray(userId) ? userId.join(",") : userId;
                return {
                    url: `/coach-users/coach/${coachId}/users/${ids}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["coaches", "users"],
        }),
    }),
});

export const {
    useGetCoachesQuery,
    useGetCoachStatsQuery,
    useGetCoachUsersQuery,
    useAssignUsersToCoachMutation,
    useRemoveUsersFromCoachMutation,
} = coachApi;
