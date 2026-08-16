"use client";
import { IoMdMenu } from "react-icons/io";
import { BsBellFill } from "react-icons/bs";
import { Bell, LogOut, Settings, UserRound } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dropdown, message, type MenuProps } from "antd";
import type { RootState } from "../../redux/store.js";
import { useGetUnreadNotificationCountQuery } from "../../redux/features/notifications/index.js";
import { logout } from "../../redux/userSlice.js";

export default function Header({ navOpened, setNavOpened }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: unreadData } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 60000,
  });
  const unreadCount = unreadData?.count ?? 0;
  const displayName =
    (user as { name?: string } | null)?.name ?? user?.fullName ?? "User";

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserRound className="h-4 w-4" />,
      label: "View Profile",
    },
    {
      key: "settings",
      icon: <Settings className="h-4 w-4" />,
      label: "Account Settings",
    },
    {
      key: "notifications",
      icon: <Bell className="h-4 w-4" />,
      label: (
        <span className="flex min-w-36 items-center justify-between gap-4">
          Notifications
          {unreadCount > 0 && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
      ),
    },
    { type: "divider" },
    {
      key: "logout",
      danger: true,
      icon: <LogOut className="h-4 w-4" />,
      label: "Sign Out",
    },
  ];

  const handleProfileMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "profile") {
      navigate("/admin/settings?tab=profile");
      return;
    }
    if (key === "settings") {
      navigate("/admin/settings?tab=profile");
      return;
    }
    if (key === "notifications") {
      navigate("/admin/notifications");
      return;
    }
    if (key === "logout") {
      dispatch(logout());
      message.success("Signed out successfully.");
      navigate("/auth/login");
    }
  };

  return (
    <div className="sticky inset-y-0 left-0 z-30 w-full border-b border-b-[#E5E7EB] h-20  bg-[#FFFFFF] [transition:0.5s]">
      <header className="flex items-center justify-between p-4">
        {/* left side  */}
        <div className="flex items-center justify-between w-full">
          <div
            onClick={() => setNavOpened(!navOpened)}
            className="md:hidden flex items-center justify-center cursor-pointer"
          >
            <IoMdMenu className=" w-10 h-10 rounded-full bg-primary/10 text-primary [transition:0.3s] hover:bg-primary hover:text-white text-center p-2" />
          </div>

          <div />
          <div className="flex items-center justify-center gap-x-5">
            <div
              onClick={() => setNavOpened(!navOpened)}
              className="hidden lg:hidden md:flex items-center justify-center cursor-pointer"
            >
              <IoMdMenu className=" w-10 h-10 rounded-full bg-yellow-50 [transition:0.3s] hover:bg-yellow-100 text-center p-1" />
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/notifications")}
              aria-label={`${unreadCount} unread notifications`}
              className="flex items-center justify-center cursor-pointer relative"
            >
              {unreadCount > 0 && (
                <span className="absolute -top-4 -right-3 bg-[#10B981] rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <BsBellFill size={22} color="#000" />
            </button>
            <Dropdown
              menu={{
                items: profileMenuItems,
                onClick: handleProfileMenuClick,
              }}
              trigger={["click"]}
              placement="bottomRight"
              popupRender={(menu) => (
                <div className="w-72 overflow-hidden rounded-2xl border border-gray-100 !bg-white !shadow-xl [&_.ant-dropdown-menu]:!border-0 [&_.ant-dropdown-menu]:!bg-transparent [&_.ant-dropdown-menu]:!shadow-none">
                  <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                    <img
                      src={
                        user?.profileUrl ??
                        "https://ui-avatars.com/api/?name=User"
                      }
                      alt={displayName}
                      className="h-12 w-12 rounded-full border border-gray-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {user?.email ?? "No email available"}
                      </p>
                    </div>
                  </div>
                  <div className="px-1.5 pb-1.5">{menu}</div>
                </div>
              )}
            >
              <button
                type="button"
                className="flex max-w-52 cursor-pointer items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-gray-50"
                aria-label="Open account menu"
              >
                <img
                  src={
                    user?.profileUrl ?? "https://ui-avatars.com/api/?name=User"
                  }
                  alt={displayName}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <span className="hidden truncate text-sm font-semibold text-gray-900 xl:block">
                  {displayName}
                </span>
              </button>
            </Dropdown>
          </div>
        </div>
      </header>
    </div>
  );
}
