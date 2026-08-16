import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Video,
  FileText,
  BarChart,
  Bell,
  CreditCard,
  Settings,
} from "lucide-react";
import { TbMatrix, TbBulb } from "react-icons/tb";
import { MdDashboardCustomize } from "react-icons/md";
import { TbCategory, TbReportAnalytics, TbDiscount } from "react-icons/tb";
import { FaHistory } from "react-icons/fa";

export interface SubmenuItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

export interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  submenu?: SubmenuItem[];
}

export interface MenuGroup {
  menu: MenuItem[];
}

export interface MenuData {
  linkData: MenuGroup[];
}

export const sidebarMenus = {
  admin: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Coach Management",
      href: "/admin/coaches",
      icon: GraduationCap,
    },
    {
      label: "Swing Categories",
      href: "/admin/swing-categories",
      icon: Video,
    },
    // {
    //   label: "Content Management",
    //   href: "/admin/content",
    //   icon: FileText,
    // },
    {
      label: "Analytics & Reports",
      href: "/admin/analytics",
      icon: BarChart,
    },
    {
      label: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      label: "Subscription Plans",
      href: "/admin/subscriptions",
      icon: CreditCard,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ],
};

export const navLinks: MenuItem[] = [
  {
    label: "Products",
    href: "/products",
  },
  {
    label: "Services",
    href: "/services",
  },
  {
    label: "About Us",
    href: "/about-us",
  },
  {
    label: "Contact Us",
    href: "/contact-us",
  },
];
