import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Checkbox, Form, Input, message } from "antd";
import { FcGoogle } from "react-icons/fc";
import { FaLock, FaUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../redux/store.js";
import { useLoginMutation } from "../../../redux/features/auth/index.js";
import { setCredentials } from "../../../redux/userSlice.js";
import Cookies from "js-cookie";
import loginImage from "../../../assets/login.jpg";
// import loginImage from "../../../assets/register.jpg";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [form] = Form.useForm();
  const [remember, setRemember] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const res = await login(values).unwrap();

      Cookies.set("token", res.data.token, {
        expires: 7, // 7 days
        secure: import.meta.env.PROD,
        sameSite: "Lax",
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.results));
      dispatch(
        setCredentials({
          user: res.data.results,
          token: res.data.token,
        }),
      );
      const loginUser = res.data.results;
      message.success(res.message);

      if (loginUser.role === "admin") {
        navigate(location.state?.from || "/admin", {
          replace: true,
        });
      } else {
        navigate(location.state?.from || "/", {
          replace: true,
        });
      }
    } catch (error: any) {
      message.error(error?.data?.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    // window.location.href = `${import.meta.env.VITE_PUBLIC_URL}/auth/google`;
    message.warning("Google login is upcoming soon...");
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-fixed bg-cover bg-center bg-no-repeat px-4 py-10"
      style={{
        backgroundImage: `url(${loginImage})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Login Card */}
      <div className="relative z-20 w-full max-w-lg rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-white">
            Hello, Welcome!
          </h1>

          <p className="text-gray-300">
            Please enter your details below to continue.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
        >
          <div className="space-y-4">
            {/* Email Field */}
            <Form.Item
              name="email"
              label={
                <span className="text-sm font-medium text-white">Email</span>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter your email.",
                },
                {
                  type: "email",
                  message: "Enter a valid email address.",
                },
              ]}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                size="large"
                prefix={<FaUser className="mr-2 text-gray-500" />}
                className="!bg-white/10 !text-white"
                classNames={{
                  input: "placeholder:!text-white/60",
                }}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              label={
                <span className="text-sm font-medium text-white">Password</span>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter your password.",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters.",
                },
              ]}
            >
              <Input.Password
                placeholder="Enter your password"
                size="large"
                prefix={<FaLock className="mr-2 text-gray-500" />}
                className="!bg-white/10 !text-white"
                classNames={{
                  input: "placeholder:!text-white/60",
                }}
              />
            </Form.Item>
          </div>

          <div className="mt-6 mb-8 flex items-center justify-between">
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            >
              <span className="text-gray-200">Remember me</span>
            </Checkbox>

            <Link
              to="/auth/forgot-password"
              className="text-sm font-semibold !text-primary hover:!text-primary/80"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={isLoading}
            className="w-full !rounded-xl !bg-primary hover:!bg-primary/90 text-lg font-semibold shadow-md mb-6"
          >
            Sign In
          </Button>

          <div className="relative mb-6 flex items-center">
            <div className="flex-1 border-t border-white/20"></div>

            <span className="mx-4 text-sm text-gray-300">Or</span>

            <div className="flex-1 border-t border-white/20"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 py-3 text-white transition-all hover:bg-secondary/10 cursor-pointer"
          >
            <FcGoogle size={22} />
            Continue With Google
          </button>

          <div className="mt-8 text-center text-sm text-gray-300">
            Don't have an account?{" "}
            <Link
              to="#"
              className="font-semibold !text-primary hover:!text-primary/80"
            >
              Sign Up
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
