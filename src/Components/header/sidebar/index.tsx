import { useState, type Dispatch, type SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { sidebarMenus, type MenuItem } from "../../../data/menu-items/index.js";
import NavItem from "../nav-menu/index.js";
import Logo from "../../shared/logo/index.js";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../redux/store.js";
import { logout } from "../../../redux/userSlice.js";
import { message } from "antd";

interface User {
    name: string;
    email: string;
    role: "admin";
}
const user = {
    name: "Admin",
    email: "admin@gmail.com",
    role: "admin",
}

interface SidebarProps {
    navOpened: boolean;
    setNavOpened: Dispatch<SetStateAction<boolean>>;
}



export default function Sidebar({ navOpened, setNavOpened }: SidebarProps) {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    // const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        message.success("Logout successfully");
        navigate("/auth/login");
    };

    const location = useLocation();

    const menuLinks = user ? sidebarMenus["admin"] : [];

    const closeAllSubmenus = (): void => {
        setOpenSubmenu(null);
    };

    const handleSubmenuToggle = (label: string): void => {
        setOpenSubmenu((prev) => (prev === label ? null : label));
    };

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${navOpened ? "opacity-100 block" : "opacity-0 hidden"
                    }`}
                onClick={() => setNavOpened(false)}
            ></div>
            <div className={`
        fixed top-0 left-0 z-30 h-screen w-64 overflow-y-auto border-e border-e-[#E5E7EB] bg-white transition-transform duration-300
        ${navOpened ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
    `}
            >
                <div className="flex h-full flex-col justify-between">

                    {/* Top */}
                    <div className="flex flex-col gap-5 pt-28 lg:pt-0">

                        <div className="hidden px-2 lg:flex items-center justify-center py-3">
                            <Logo />
                        </div>

                        <nav>
                            {menuLinks.map((item: MenuItem, index: number) => (
                                <NavItem
                                    key={index}
                                    href={item.href || "#"}
                                    icon={item.icon}
                                    label={item.label}
                                    submenu={item.submenu}
                                    openSubmenu={openSubmenu}
                                    handleSubmenuToggle={handleSubmenuToggle}
                                    setNavOpened={setNavOpened}
                                    closeAllSubmenus={closeAllSubmenus}
                                />
                            ))}
                        </nav>

                    </div>

                    {/* Bottom */}
                    <div className="border-t border-gray-200 px-2 py-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-5 py-3 text-red-600 transition hover:bg-red-50 cursor-pointer"
                        >
                            <MdLogout size={20} />
                            <span className="font-medium">Log Out</span>
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}