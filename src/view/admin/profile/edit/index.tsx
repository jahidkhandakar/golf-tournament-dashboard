import { useState } from "react";
import { Camera, Save, User } from "lucide-react";
import { Input, Select, message } from "antd";
import { useUpdateMyProfileMutation } from "../../../../redux/features/auth/index.js";

type EditableProfile = {
  name?: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: string;
  profileUrl?: string;
};

type EditProfileProps = {
  userData: EditableProfile;
  onCancel: () => void;
};

export default function EditProfile({
  userData,
  onCancel,
}: EditProfileProps) {
  const [formName, setFormName] = useState(
    userData.name || userData.fullName || "",
  );
  const [formPhone, setFormPhone] = useState(
    userData.phoneNumber || userData.phone || "",
  );
  const [formCountry, setFormCountry] = useState(userData.country || "");
  const [formDateOfBirth, setFormDateOfBirth] = useState(
    userData.dateOfBirth || "",
  );
  const [formGender, setFormGender] = useState(userData.gender || "");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState(
    userData.profileUrl || "",
  );
  const [updateMyProfile, { isLoading: isUpdating }] =
    useUpdateMyProfileMutation();

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async () => {
    if (!formName.trim()) return;

    const formData = new FormData();
    formData.append("name", formName.trim());
    if (formPhone.trim()) formData.append("phoneNumber", formPhone.trim());
    if (formCountry.trim()) formData.append("country", formCountry.trim());
    if (formDateOfBirth) formData.append("dateOfBirth", formDateOfBirth);
    if (formGender) formData.append("gender", formGender);
    if (profileFile) formData.append("profile", profileFile);

    try {
      await updateMyProfile(formData).unwrap();
      message.success("Profile updated successfully.");
      onCancel();
    } catch (error) {
      message.error(
        (error as any)?.data?.message
          ?? "Unable to update profile. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-5 pt-3">
      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-sm">
          {profilePreview ? (
            <img
              src={profilePreview}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <User className="h-9 w-9" />
            </div>
          )}
        </div>
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50">
            <Camera className="h-4 w-4" />
            Change photo
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-[11px] text-gray-400">
            JPG, PNG or WebP recommended.
          </p>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">
          Full Name
        </label>
        <Input
          value={formName}
          onChange={(event) => setFormName(event.target.value)}
          placeholder="Enter your full name"
          className="h-11 rounded-xl"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">
          Email Address
        </label>
        <Input value={userData.email} disabled className="h-11 rounded-xl" />
        <p className="mt-1.5 text-[11px] text-gray-400">
          Contact support to change your account email.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">
            Phone Number
          </label>
          <Input
            value={formPhone}
            onChange={(event) => setFormPhone(event.target.value)}
            placeholder="Enter phone number"
            className="h-11 rounded-xl"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">
            Country
          </label>
          <Input
            value={formCountry}
            onChange={(event) => setFormCountry(event.target.value)}
            placeholder="Enter country"
            className="h-11 rounded-xl"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">
            Date of Birth
          </label>
          <Input
            type="date"
            value={formDateOfBirth}
            onChange={(event) => setFormDateOfBirth(event.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">
            Gender
          </label>
          <Select
            value={formGender || null}
            onChange={(value) => setFormGender(value ?? "")}
            placeholder="Select gender"
            className="h-11 w-full"
            allowClear
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpdateProfile}
          disabled={!formName.trim() || isUpdating}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
