import { Button, Form, Input, message } from "antd";
import { FaEnvelope, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from "../../../redux/features/auth/index.js";
import FormField from "../../../Components/form/index.js";
import loginImage from "../../../assets/login.jpg";
import Cookies from "js-cookie";
// import loginImage from "../../../assets/register.jpg";

export default function ForgotPassword() {
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (values: { email: string }) => {
    try {
      Cookies.set("email", values.email);
      const res = await forgotPassword(values).unwrap();

      const otpToken = res?.data?.token;
      if (otpToken) {
        Cookies.set("otpToken", otpToken, {
          expires: 1,
          secure: import.meta.env.PROD,
          sameSite: "Lax",
        });
      }

      message.success(res.message);

      navigate("/auth/verify-otp", {
        state: {
          email: values.email,
          type: "forgot",
          token: otpToken,
        },
      });
    } catch (error: any) {
      message.error(error?.data?.message || "Unable to send OTP.");
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${loginImage})`,
        }}
      />

      {/* Overlay */}
      <div className="fixed inset-0 -z-10 bg-black/30" />

      {/* Content */}
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-4xl font-bold text-white">
              Forgot Password
            </h1>

            <p className="text-gray-300">
              Enter your email address to receive an OTP for resetting your
              password.
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="email"
              label={
                <span className="text-sm font-medium text-white">
                  Email Address
                </span>
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

            <Button
              htmlType="submit"
              type="primary"
              size="large"
              loading={isLoading}
              className="w-full !rounded-xl !bg-primary text-lg font-semibold"
            >
              Send OTP
            </Button>

            <div className="mt-8 text-center text-gray-300">
              Remember your password?{" "}
              <Link
                to="/auth/login"
                className="font-semibold !text-secondary hover:!text-primary"
              >
                Back to Login
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
