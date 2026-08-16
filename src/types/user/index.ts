import Cookies from "js-cookie";

export type UserRole = "admin" | "manager" | "employee";

export type UserStatus =
    | "pending"
    | "active"
    | "inactive"
    | "suspended"
    | "deleted";

export interface IUser {
    _id: string;

    fullName: string;

    email: string;

    role: UserRole;

    dateOfBirth: string;

    phone: string;

    profileUrl?: string;

    coverImage?: Record<string, any>;

    gender?: string;

    fcmToken?: string;

    provider?: "google" | "apple";

    providerId?: string;

    isDeleted?: boolean;

    status?: UserStatus;

    createdAt?: string;

    updatedAt?: string;
}

export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export interface ILoginData {
    results: IUser;
    token: string;
}

export type ILoginResponse = IApiResponse<ILoginData>;

export interface IRegisterRequest {
    fullName: string;
    email: string;
    password: string;
    dateOfBirth: string;
    phone: string;
    gender?: string;
    role?: UserRole;
}

export interface IRegisterData {
    token: string;
}

export type IRegisterResponse = IApiResponse<IRegisterData>;


export interface IOtpVerifyRequest {
    otp: string;
}

export type IOtpVerifyResponse = IApiResponse<{
    user: IUser;
}>;

export interface IResendOtpRequest {
    email: string;
}

export type IResendOtpResponse = IApiResponse<null>;

export interface IForgotPasswordRequest {
    email: string;
}

export type IForgotPasswordResponse = IApiResponse<null>;

export interface IForgotOtpVerifyRequest {
    otp: string;
}

export interface IForgotOtpVerifyData {
    resetToken: string;
}

export type IForgotOtpVerifyResponse =
    IApiResponse<IForgotOtpVerifyData>;

export interface IResetPasswordRequest {
    password: string;
    confirmPassword: string;
}

export type IResetPasswordResponse = IApiResponse<null>;

export interface IChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export type IChangePasswordResponse = IApiResponse<null>;

export interface IAuthPayload {
    user: IUser;
    token: string;
}


export interface IInitialState {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
}

const storedToken = Cookies.get("token") || localStorage.getItem("token") || null;
const storedUser = localStorage.getItem("user");
const parsedUser: IUser | null = storedUser ? JSON.parse(storedUser) : null;

export const initialState: IInitialState = {
    user: parsedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
};
