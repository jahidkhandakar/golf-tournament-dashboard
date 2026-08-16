import { useEffect, useRef, useState } from "react";
import { Button, Form, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import {
  useForgotOtpVerifyMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "../../../redux/features/auth/index.js";
import loginImage from "../../../assets/register.jpg";
import Cookies from "js-cookie";

export default function VerifyOtp() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const email = Cookies.get("email") || location.state?.email;
  const type = location.state?.type || "forgot";
  const [otpToken, setOtpToken] = useState<string | undefined>(
    () => Cookies.get("otpToken") || location.state?.token,
  );

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [forgotVerify, { isLoading: isForgotLoading }] =
    useForgotOtpVerifyMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const saveOtpToken = (token?: string) => {
    if (!token) return;
    setOtpToken(token);
    Cookies.set("otpToken", token, {
      expires: 1,
      secure: import.meta.env.PROD,
      sameSite: "Lax",
    });
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const updateOtpValue = (nextOtp: string[]) => {
    setOtp(nextOtp);
    form.setFieldsValue({ otp: nextOtp.join("") });
  };

  const handleChange = (value: string, index: number) => {
    if (value && !/^\d$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    updateOtpValue(nextOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const nextOtp = [...otp];
        nextOtp[index] = "";
        updateOtpValue(nextOtp);
        return;
      }

      if (index > 0) {
        const nextOtp = [...otp];
        nextOtp[index - 1] = "";
        updateOtpValue(nextOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (!pasteData) return;

    const nextOtp = Array(6)
      .fill("")
      .map((_, index) => pasteData[index] || "");
    updateOtpValue(nextOtp);
    inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const fullOtp = otp.join("");

    if (fullOtp.length !== 6) {
      message.error("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      let res;
      const token = otpToken || Cookies.get("otpToken");

      if (!token) {
        message.error("Verification token missing. Please request a new OTP.");
        return;
      }

      if (type === "forgot") {
        res = await forgotVerify({ otp: fullOtp, token }).unwrap();
        message.success(res.message);
        navigate("/auth/reset-password", {
          state: {
            email,
            token,
          },
        });
      } else {
        res = await verifyOtp({ otp: fullOtp, token }).unwrap();
        message.success(res.message);
        Cookies.remove("otpToken");
        navigate("/auth/login");
      }
    } catch (error: any) {
      message.error(error?.data?.message || "OTP verification failed.");
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      message.error("Email address is missing. Please restart the process.");
      return;
    }

    try {
      const res = await resendOtp({ email }).unwrap();
      saveOtpToken(res?.data?.token);
      message.success(res.message || "A new OTP has been sent to your email.");
      updateOtpValue(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to resend OTP.");
    }
  };

  const title =
    type === "forgot" ? "Verify Reset Code" : "Verify Your Account";
  const displayEmail = email || "your email address";

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
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-primary/20 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <h1 className="text-4xl font-bold text-white">{title}</h1>

            <p className="mt-3 text-sm leading-7 text-gray-300 sm:text-base">
              {type === "forgot" ? (
                <>
                  Enter the 6-digit security code we just sent to{" "}
                  <span className="break-all font-semibold text-primary">
                    {displayEmail}
                  </span>{" "}
                  to reset your password and secure your account.
                </>
              ) : (
                <>
                  Enter the 6-digit verification code we just sent to{" "}
                  <span className="break-all font-semibold text-primary">
                    {displayEmail}
                  </span>{" "}
                  to confirm your account.
                </>
              )}
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="otp"
              rules={[
                {
                  validator: async () => {
                    if (otp.join("").length !== 6) {
                      return Promise.reject(
                        new Error("Please enter the complete 6-digit OTP."),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              className="!mb-2"
            >
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleChange(e.target.value.slice(-1), index)
                    }
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    aria-label={`OTP digit ${index + 1}`}
                    className="h-14 w-10 border-0 border-b-2 border-slate-200/60 bg-transparent text-center text-2xl font-semibold text-white outline-none transition focus:border-primary sm:h-16 sm:w-12 sm:text-3xl"
                  />
                ))}
              </div>
            </Form.Item>

            <Button
              htmlType="submit"
              loading={isLoading || isForgotLoading}
              type="primary"
              size="large"
              className="mt-8 w-full !rounded-xl !bg-primary text-lg font-semibold"
            >
              Verify OTP
            </Button>

            <div className="mt-6 text-center text-sm text-gray-300">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || !email}
                className="cursor-pointer border-none bg-transparent p-0 font-semibold !text-primary outline-none transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            </div>

            <div className="mt-8 text-center text-gray-300">
              Back to{" "}
              <Link
                to="/auth/login"
                className="font-semibold !text-primary hover:!text-primary/80"
              >
                Login
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
