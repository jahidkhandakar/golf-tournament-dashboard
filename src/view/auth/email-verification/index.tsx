import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, message } from "antd";
import { MailCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../redux/store.js";
import { useVerifyOtpMutation } from "../../../redux/features/auth/index.js";
import { setCredentials } from "../../../redux/userSlice.js";
import Cookies from "js-cookie";

export default function EmailVerification() {
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();

    const targetEmail = location.state?.email || "your email address";

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [countdown, setCountdown] = useState<number>(59);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [verifyEmailOtp, { isLoading }] = useVerifyOtpMutation();
    const inputRefs = useRef<HTMLInputElement[]>([]);


    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const updatedOtp = [...otp];
        updatedOtp[index] = element.value;
        setOtp(updatedOtp);

        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (otp[index] === "" && index > 0) {

                const updatedOtp = [...otp];
                updatedOtp[index - 1] = "";
                setOtp(updatedOtp);
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current box
                const updatedOtp = [...otp];
                updatedOtp[index] = "";
                setOtp(updatedOtp);
            }
        }
    };

    // Handle copying and pasting 6-digit codes
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasteData = e.clipboardData.getData("text").trim();
        if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
            const updatedOtp = pasteData.split("");
            setOtp(updatedOtp);
            inputRefs.current[5]?.focus();
        }
        e.preventDefault();
    };

    const handleSubmit = async () => {
        const fullOtp = otp.join("");
        if (fullOtp.length < 6) {
            return message.error("Please enter the complete 6-digit OTP code.");
        }

        try {
            const res = await verifyEmailOtp({ otp: fullOtp }).unwrap();

            Cookies.set("token", res.data.token, {
                expires: 7, // 7 days
                secure: import.meta.env.PROD,
                sameSite: "Lax",
            });
            localStorage.setItem("user", JSON.stringify(res.data.results));
            dispatch(
                setCredentials({
                    user: res.data.results,
                    token: res.data.token,
                })
            );

            message.success(res.message || "Email verified successfully! Login to continue.");

            const role = res.data.results.role;
            if (role === "admin") {
                navigate("/admin", { replace: true });
            } else if (role === "manager") {
                navigate("/manager", { replace: true });
            } else if (role === "employee") {
                navigate("/employee", { replace: true });
            } else {
                navigate("/", { replace: true });
            }

        } catch (error: any) {
            message.error(error?.data?.message || "Invalid OTP code. Please try again.");
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;
        try {
            // Your Resend API mutation call goes here. Example:
            // await resendOtp({ email: targetEmail }).unwrap();

            message.success("A fresh activation code has been dispatched to your inbox.");
            setCountdown(59);
            setCanResend(false);
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            message.error(error?.data?.message || "Failed to resend code.");
        }
    };

    return (
        <div
            className="relative flex min-h-screen items-center justify-center bg-fixed bg-cover bg-center bg-no-repeat px-4 py-10"
            style={{
                backgroundImage: "url('/image/register.jpg')",
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-20 w-full max-w-lg rounded-2xl border border-white/10 bg-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-white border border-white/10">
                    <MailCheck className="h-8 w-8 text-secondary" />
                </div>

                <div className="mb-8">
                    <h1 className="mb-3 text-3xl font-bold text-white tracking-tight">
                        Verify Your Email
                    </h1>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        We have transmitted a security verification code to <br className="hidden sm:block" />
                        <span className="font-semibold text-white underline decoration-secondary decoration-2">{targetEmail}</span>
                    </p>
                </div>

                <Form layout="vertical" onFinish={handleSubmit}>

                    {/* OTP Digit Inputs */}
                    <div className="mb-8 flex items-center justify-center gap-2 sm:gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                value={digit}
                                ref={(el) => (inputRefs.current[index] = el as HTMLInputElement)}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                                className="h-12 w-11 sm:h-14 sm:w-14 rounded-xl border border-white/20 bg-white/10 text-center text-xl font-bold text-white transition-all focus:border-secondary focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/20"
                            />
                        ))}
                    </div>

                    <Button
                        htmlType="submit"
                        type="primary"
                        size="large"
                        loading={isLoading}
                        className="w-full !rounded-xl !bg-primary hover:!bg-primary/90 text-base font-semibold shadow-md mb-6 h-12"
                    >
                        Verify & Activate
                    </Button>

                    {/* Resend Configuration Block */}
                    <div className="mt-6 text-center text-sm text-gray-300">
                        Didn't receive the email?{" "}
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResendCode}
                                className="font-semibold !text-secondary hover:underline cursor-pointer transition-all bg-transparent border-none outline-none p-0"
                            >
                                Resend Code
                            </button>
                        ) : (
                            <span className="text-gray-400 font-medium">
                                Resend in <span className="text-secondary font-bold">{countdown}s</span>
                            </span>
                        )}
                    </div>
                </Form>
            </div>
        </div>
    );
}