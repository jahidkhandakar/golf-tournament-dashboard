import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_PUBLIC_URL,
    credentials: "include",
    prepareHeaders: (headers: any) => {
      const token =
        Cookies.get("otpToken") ||
        Cookies.get("token") ||
        localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "auth",
    "product",
    "sales",
    "purchase",
    "expense",
    "user",
    "users",
    "coaches",
    "swingCategories",
    "plans",
    "notifications",
    "common",
    "dashboard",
  ],
  endpoints: (builder: any) => {
    return {};
  },
});
