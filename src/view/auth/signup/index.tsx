import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { Button, Form, Input, message } from "antd";
import { FaLock, FaUser } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import type { IRegisterRequest } from "../../../types/user/index.js";
import { useRegisterMutation } from "../../../redux/features/auth/index.js";
import Cookies from "js-cookie";
import registerImage from "../../../assets/register.jpg";

export default function SignUp() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [registerUser, { isLoading }] = useRegisterMutation();

  const onSubmit = async (values: IRegisterRequest) => {
    try {
      const res = await registerUser(values).unwrap();

      if (res.data?.token) {
        Cookies.set("token", res.data.token, {
          expires: 1,
          secure: import.meta.env.PROD,
          sameSite: "Lax",
        });
      }

      message.success(res.message || "Registration successful!");

      // Automatically pass email state to the OTP page
      navigate("/auth/email-verification", {
        replace: true,
        state: { email: values.email },
      });
    } catch (error: any) {
      message.error(
        error?.data?.message || "Registration failed. Please try again.",
      );
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
        backgroundImage: `url(${registerImage})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Register Card */}
      <div className="relative z-20 w-full max-w-lg rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-white">Create Account</h1>
          <p className="text-gray-300">
            Fill in your details below to create your account.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          autoComplete="off"
          requiredMark={false}
          initialValues={{ role: "employee" }}
        >
          <div className="space-y-4">
            {/* Full Name Field */}
            <Form.Item
              name="fullName"
              label={
                <span className="text-sm font-medium text-white">
                  Full Name
                </span>
              }
              rules={[
                { required: true, message: "Please enter your full name." },
              ]}
            >
              <Input
                placeholder="Enter your full name"
                size="large"
                prefix={<FaUser className="mr-2 text-gray-400" />}
                className="!bg-white/10 !text-white hover:border-white/30 focus:border-white/50"
                classNames={{ input: "placeholder:!text-white/60" }}
              />
            </Form.Item>

            {/* Email Field */}
            <Form.Item
              name="email"
              label={
                <span className="text-sm font-medium text-white">Email</span>
              }
              rules={[
                { required: true, message: "Please enter your email." },
                { type: "email", message: "Enter a valid email address." },
              ]}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                size="large"
                prefix={<MdMail className="mr-2 text-gray-400" />}
                className="!bg-white/10 !text-white hover:border-white/30 focus:border-white/50"
                classNames={{ input: "placeholder:!text-white/60" }}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              label={
                <span className="text-sm font-medium text-white">Password</span>
              }
              rules={[
                { required: true, message: "Please enter your password." },
                { min: 6, message: "Password must be at least 6 characters." },
              ]}
            >
              <Input.Password
                placeholder="Enter your password"
                size="large"
                prefix={<FaLock className="mr-2 text-gray-400" />}
                className="!bg-white/10 !text-white hover:border-white/30 focus:border-white/50"
                classNames={{ input: "placeholder:!text-white/60" }}
              />
            </Form.Item>
          </div>

          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={isLoading}
            className="mt-8 w-full !rounded-xl !bg-primary hover:!bg-primary/90 text-lg font-semibold shadow-md"
          >
            Create Account
          </Button>

          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="mx-4 text-sm text-gray-300">Or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/20 py-3 text-white transition hover:bg-secondary/10"
          >
            <FcGoogle size={22} />
            Continue With Google
          </button>

          <div className="mt-8 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-semibold !text-secondary hover:!text-primary/80"
            >
              Sign In
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
