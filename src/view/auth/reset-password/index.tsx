import { Button, Form, Input, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import Cookies from "js-cookie";
import FormField from "../../../Components/form/index.js";
import { useResetPasswordMutation } from "../../../redux/features/auth/index.js";
import loginImage from "../../../assets/reset-pass.jpg";

// import loginImage from "../../../assets/register.jpg";

export default function ResetPassword() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const token = location.state?.token || Cookies.get("otpToken");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      message.error(
        "Reset token missing. Please restart the forgot password process.",
      );
      navigate("/auth/forgot-password");
      return;
    }

    try {
      await resetPassword({
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
        token,
      }).unwrap();

      Cookies.remove("otpToken");
      Cookies.remove("email");

      message.success("Password reset successfully.");
      navigate("/auth/login");
    } catch (error: any) {
      message.error(error?.data?.message || "Unable to reset password.");
    }
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: `url(${loginImage})`,
        }}
      />

      <div className="fixed inset-0 -z-10 bg-black/30" />

      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white">Reset Password</h1>

            <p className="mt-2 text-gray-300">Enter your new password.</p>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="password"
              label={
                <span className="text-sm font-medium text-white">
                  New Password
                </span>
              }
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please enter your new password.",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters.",
                },
              ]}
            >
              <Input.Password
                placeholder="Enter your new password"
                size="large"
                prefix={<FaLock className="mr-2 text-gray-500" />}
                className="!bg-white/10 !text-white"
                classNames={{
                  input: "placeholder:!text-white/60",
                }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              label={
                <span className="text-sm font-medium text-white">
                  Confirm Password
                </span>
              }
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your new password.",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match."),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Re-enter your new password"
                size="large"
                prefix={<FaLock className="mr-2 text-gray-500" />}
                className="!bg-white/10 !text-white"
                classNames={{
                  input: "placeholder:!text-white/60",
                }}
              />
            </Form.Item>

            <Button
              htmlType="submit"
              loading={isLoading}
              type="primary"
              size="large"
              className="mt-6 w-full !rounded-xl !bg-primary"
            >
              Reset Password
            </Button>

            <div className="mt-8 text-center text-gray-300">
              <Link to="/auth/login" className="font-semibold !text-secondary">
                Back to Login
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
