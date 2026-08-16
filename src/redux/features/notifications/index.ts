import { baseApi } from "../../api/index.js";

export type NotificationType =
  | "payment"
  | "general"
  | "tournament"
  | "update"
  | "subscription";

export type NotificationItem = {
  _id: string;
  title: string;
  body: string;
  type?: NotificationType;
  linkId?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type GetNotificationsParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type?: NotificationType;
  isRead?: boolean;
};

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any, GetNotificationsParams | void>({
      query: (params) => ({
        url: "/notification/get-all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          sort: "-createdAt",
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.type ? { type: params.type } : {}),
          ...(params?.isRead !== undefined ? { isRead: params.isRead } : {}),
        },
      }),
      providesTags: ["notifications"],
    }),
    getUnreadNotificationCount: builder.query<{ count: number }, void>({
      query: () => ({
        url: "/notification/unread-count",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["notifications"],
    }),
    markNotificationAsRead: builder.mutation<any, string>({
      query: (id) => ({
        url: "/notification/mark-as-read",
        method: "PATCH",
        params: { id },
      }),
      invalidatesTags: ["notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
} = notificationApi;
