import type { ILoginRequest, ILoginResponse, IRegisterRequest, IUser } from "../../../types/user/index.js";
import { baseApi } from "../../api/index.js";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<any, IRegisterRequest>({
            query: (body) => ({
                url: "/auth/register",
                method: "POST",
                body,
            }),
            invalidatesTags: ["auth"],
        }),

        login: builder.mutation<ILoginResponse, ILoginRequest>({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
            }),
            invalidatesTags: ["auth"],
        }),

        verifyOtp: builder.mutation({
            query: ({ otp, token }: { otp: string; token?: string }) => ({
                url: "/auth/verify-otp",
                method: "POST",
                body: { otp },
                headers: token
                    ? { authorization: `Bearer ${token}` }
                    : undefined,
            }),
        }),

        resendOtp: builder.mutation({
            query: (body) => ({
                url: "/auth/resend-otp",
                method: "POST",
                body,
            }),
        }),

        forgotPassword: builder.mutation({
            query: (body) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body,
            }),
        }),

        forgotOtpVerify: builder.mutation({
            query: ({ otp, token }: { otp: string; token?: string }) => ({
                url: "/auth/forgot-otp-verify",
                method: "POST",
                body: { otp },
                headers: token
                    ? { authorization: `Bearer ${token}` }
                    : undefined,
            }),
        }),

        resetPassword: builder.mutation({
            query: ({
                token,
                ...body
            }: {
                newPassword: string;
                confirmPassword: string;
                token?: string;
            }) => ({
                url: "/auth/reset-password",
                method: "POST",
                body,
                headers: token
                    ? { authorization: `Bearer ${token}` }
                    : undefined,
            }),
        }),

        changePassword: builder.mutation({
            query: (body) => ({
                url: "/auth/change-password",
                method: "POST",
                body,
            }),
            invalidatesTags: ["auth"],
        }),

        refreshToken: builder.mutation({
            query: () => ({
                url: "/auth/refresh-token",
                method: "POST",
            }),
        }),
        getMyProfile: builder.query<{ data: IUser }, void>({
            query: () => ({
                url: "/user/get-my-profile",
                method: "GET",
            }),
            providesTags: ["user"],
        }),
        updateMyProfile: builder.mutation<{ data: IUser }, FormData>({
            query: (body) => ({
                url: "/user/update-my-profile",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["user", "users"],
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useForgotPasswordMutation,
    useForgotOtpVerifyMutation,
    useResetPasswordMutation,
    useChangePasswordMutation,
    useRefreshTokenMutation,
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
} = authApi;