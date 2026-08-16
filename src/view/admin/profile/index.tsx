import React from "react";
import {
  Mail,
  Shield,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Edit3,
  MapPin,
  Phone,
} from "lucide-react";

type UserRole = "supplier" | "import" | "export" | "logistic" | string;
type UserStatus = "active" | "inactive" | "pending" | string;

interface UserProfileProps {
  userData: {
    _id?: string;
    name?: string;
    fullName?: string;
    email: string;
    role?: UserRole;
    profileUrl?: string;
    phoneNumber?: string;
    phone?: string;
    country?: string;
    status?: UserStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  onEdit?: () => void;
}

export default function ViewProfile({ userData, onEdit }: UserProfileProps) {
  const {
    name,
    fullName,
    email,
    role = "User",
    profileUrl,
    phoneNumber,
    phone,
    country,
    status = "active",
    createdAt,
  } = userData || {};
  const displayName = name || fullName || "User";
  const displayPhone = phoneNumber || phone || "Not provided";

  const getStatusBadge = (status: UserStatus) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "inactive":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const formatDate = (dateString?: Date | string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl bg-white">
      <div className="h-48 w-full bg-gradient-to-r from-slate-100 via-blue-50 to-amber-50 border-b border-gray-100" />
      <div className="px-6 md:px-10 pb-10 relative -mt-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 justify-between rounded-2xl border border-gray-100 bg-white/95 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="w-28 h-28 shrink-0 rounded-2xl border-4 border-white bg-gray-100 shadow-md overflow-hidden flex items-center justify-center text-gray-400">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-300" />
              )}
            </div>

            <div className="mb-1">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {displayName}
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-0.5 capitalize">
                {role} Account
              </p>
            </div>
          </div>

          <div className="mb-1 flex flex-wrap items-center justify-center gap-3 sm:justify-end">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border capitalize ${getStatusBadge(
                status,
              )}`}
            >
              {status === "active" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              {status}
            </span>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Account Information
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Your personal details and account information.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 [&>div]:rounded-2xl [&>div]:border [&>div]:border-gray-100 [&>div]:bg-gray-50/70 [&>div]:p-4 [&>div]:transition-colors [&>div]:hover:bg-gray-50">
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400">
                  Full Name
                </span>
                <span className="block text-base font-medium text-gray-900 mt-0.5">
                  {displayName}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400">
                  Phone Number
                </span>
                <span className="block text-base font-medium text-gray-900 mt-0.5">
                  {displayPhone}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400">
                  Country
                </span>
                <span className="block text-base font-medium text-gray-900 mt-0.5">
                  {country || "Not provided"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="break-all">
                <span className="block text-xs font-medium text-gray-400">
                  Email Address
                </span>
                <span className="block text-base font-medium text-gray-900 mt-0.5">
                  {email}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400">
                  Business Role
                </span>
                <span className="block text-base font-medium text-gray-900 mt-0.5 capitalize">
                  {role}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400">
                  Member Since
                </span>
                <span className="block text-base font-medium text-gray-900 mt-0.5">
                  {formatDate(createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
