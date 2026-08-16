import { useEffect, useState } from "react";
import { Headphones, Mail, MapPin, Phone, Save } from "lucide-react";
import { Input, Spin, message } from "antd";
import {
  useGetSupportSettingsQuery,
  useSaveSupportSettingsMutation,
} from "../../../../redux/features/common/index.js";

export default function SupportSettings() {
  const { data, isLoading } = useGetSupportSettingsQuery();
  const [saveSupport, { isLoading: isSaving }] =
    useSaveSupportSettingsMutation();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const support = data?.data;
    setEmail(support?.email ?? "");
    setPhoneNumber(support?.phoneNumber ?? "");
    setAddress(support?.address ?? "");
  }, [data]);

  const handleSave = async () => {
    if (!email.trim() || !phoneNumber.trim()) {
      message.warning("Support email and phone number are required.");
      return;
    }

    try {
      await saveSupport({
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        ...(address.trim() ? { address: address.trim() } : {}),
      }).unwrap();
      message.success("Support information saved successfully.");
    } catch (error) {
      message.error(
        (error as any)?.data?.message
          ?? "Unable to save support information.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex gap-3 border-b border-gray-100 pb-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Headphones className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Help & Support</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure the contact information shown to users who need help.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            Support Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="support@golfimprove.com"
            className="h-11 rounded-xl"
          />
        </div>
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            Support Phone
          </label>
          <Input
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+1 234 567 890"
            className="h-11 rounded-xl"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            Office Address
          </label>
          <Input.TextArea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter the support office address"
            rows={4}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={!email.trim() || !phoneNumber.trim() || isSaving}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Support Details"}
        </button>
      </div>
    </div>
  );
}
