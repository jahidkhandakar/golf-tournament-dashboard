import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  HelpCircle,
  Info,
  Shield,
  User,
} from "lucide-react";
import { Modal } from "antd";
import Loading from "../../../Components/reuseable/loading/index.js";
import { useGetMyProfileQuery } from "../../../redux/features/auth/index.js";
import ViewProfile from "../profile/index.js";
import EditProfile from "../profile/edit/index.js";
import AboutSettings from "./about/index.js";
import PrivacySettings from "./privacy/index.js";
import SupportSettings from "./support/index.js";
import TermsSettings from "./terms/index.js";

const SETTINGS_TABS = [
  { id: "profile", label: "Admin Profile", icon: User },
  { id: "support", label: "Help & Support", icon: HelpCircle },
  { id: "privacy", label: "Privacy Policy", icon: Shield },
  { id: "terms", label: "Terms & Conditions", icon: FileText },
  { id: "about", label: "About Us", icon: Info },
];

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const activeTab = SETTINGS_TABS.some((tab) => tab.id === tabFromUrl)
    ? (tabFromUrl as string)
    : "profile";
  const setActiveTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data, isLoading } = useGetMyProfileQuery();
  const userData = data?.data;
  const profileData = userData as typeof userData & {
    name?: string;
    phoneNumber?: string;
    country?: string;
  };

  if (isLoading || !profileData) {
    return <Loading title="Loading profile..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          Manage your admin profile and system configurations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        <div className="w-full lg:w-64 shrink-0">
          <nav className="space-y-1">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
          {activeTab === "profile" && (
            <ViewProfile
              userData={profileData}
              onEdit={() => setIsEditModalOpen(true)}
            />
          )}
          {activeTab === "support" && <SupportSettings />}
          {activeTab === "privacy" && <PrivacySettings />}
          {activeTab === "terms" && <TermsSettings />}
          {activeTab === "about" && <AboutSettings />}
        </div>
      </div>

      <Modal
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        title="Edit Admin Profile"
        width={560}
      >
        {isEditModalOpen && (
          <EditProfile
            userData={profileData}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
