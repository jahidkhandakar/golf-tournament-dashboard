import { useEffect, useMemo, useRef, useState } from "react";
import {
    Bell,
    Check,
    CheckCheck,
    CreditCard,
    Megaphone,
    RefreshCw,
    Search,
    Sparkles,
    Trophy,
} from "lucide-react";
import { Empty, Input, Select, Spin, Tag, message } from "antd";
import {
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    type NotificationItem,
    type NotificationType,
} from "../../../redux/features/notifications/index.js";

type ReadFilter = "all" | "unread" | "read";

const notificationTypeOptions = [
    { value: "all", label: "All types" },
    { value: "general", label: "General" },
    { value: "payment", label: "Payment" },
    { value: "tournament", label: "Tournament" },
    { value: "update", label: "Update" },
    { value: "subscription", label: "Subscription" },
];

const getNotificationIcon = (type?: NotificationType) => {
    if (type === "payment") return <CreditCard className="h-5 w-5" />;
    if (type === "tournament") return <Trophy className="h-5 w-5" />;
    if (type === "update") return <RefreshCw className="h-5 w-5" />;
    if (type === "subscription") return <Sparkles className="h-5 w-5" />;
    return <Megaphone className="h-5 w-5" />;
};

const getTypeColor = (type?: NotificationType) => {
    if (type === "payment") return "green";
    if (type === "tournament") return "gold";
    if (type === "update") return "blue";
    if (type === "subscription") return "purple";
    return "default";
};

const formatDate = (date?: string) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
};

export default function Notifications() {
    const [page, setPage] = useState(1);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [readFilter, setReadFilter] = useState<ReadFilter>("all");
    const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const limit = 10;

    const { data, isLoading, isFetching } = useGetNotificationsQuery({
        page,
        limit,
        ...(debouncedSearch ? { searchTerm: debouncedSearch } : {}),
        ...(typeFilter !== "all" ? { type: typeFilter } : {}),
        ...(readFilter !== "all" ? { isRead: readFilter === "read" } : {}),
    });
    const [markNotificationAsRead, { isLoading: isMarkingRead }] =
        useMarkNotificationAsReadMutation();

    const payload = data?.data ?? data;
    const meta = payload?.meta ?? {
        totalResult: 0,
        currentPage: page,
        limit,
        totalPage: 0,
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setNotifications([]);
            setPage(1);
            setDebouncedSearch(searchTerm.trim());
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const results: NotificationItem[] = payload?.results ?? [];
        setNotifications((current) => {
            if (page === 1) return results;
            const merged = [...current, ...results];
            return merged.filter(
                (notification, index) =>
                    merged.findIndex((item) => item._id === notification._id)
                    === index,
            );
        });
    }, [page, payload]);

    useEffect(() => {
        const target = loadMoreRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry?.isIntersecting
                    && !isFetching
                    && page < meta.totalPage
                ) {
                    setPage((current) => current + 1);
                }
            },
            { rootMargin: "160px" },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [isFetching, meta.totalPage, page]);

    const unreadVisibleCount = useMemo(
        () => notifications.filter((notification) => !notification.isRead).length,
        [notifications],
    );

    const changeReadFilter = (filter: ReadFilter) => {
        setNotifications([]);
        setPage(1);
        setReadFilter(filter);
    };

    const changeTypeFilter = (type: NotificationType | "all") => {
        setNotifications([]);
        setPage(1);
        setTypeFilter(type);
    };

    const handleMarkAsRead = async (notification: NotificationItem) => {
        if (notification.isRead) return;
        try {
            await markNotificationAsRead(notification._id).unwrap();
            setNotifications((current) =>
                current.map((item) =>
                    item._id === notification._id
                        ? { ...item, isRead: true }
                        : item,
                ),
            );
        } catch {
            message.error("Unable to mark notification as read.");
        }
    };

    const handleMarkVisibleAsRead = async () => {
        const unreadIds = notifications
            .filter((notification) => !notification.isRead)
            .map((notification) => notification._id);
        if (unreadIds.length === 0) return;

        try {
            await Promise.all(
                unreadIds.map((id) => markNotificationAsRead(id).unwrap()),
            );
            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    isRead: true,
                })),
            );
            message.success("Visible notifications marked as read.");
        } catch {
            message.error("Unable to mark all notifications as read.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Notifications
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Review account activity, updates, and system alerts.
                    </p>
                </div>
                <button
                    onClick={handleMarkVisibleAsRead}
                    disabled={unreadVisibleCount === 0 || isMarkingRead}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-black shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                    <CheckCheck className="h-4 w-4" />
                    Mark visible as read
                </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <Input
                        prefix={<Search className="h-4 w-4 text-gray-400" />}
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="h-10 flex-1 rounded-xl"
                        allowClear
                    />
                    <Select
                        value={typeFilter}
                        options={notificationTypeOptions}
                        onChange={changeTypeFilter}
                        className="h-10 w-full lg:w-44"
                    />
                    <div className="flex rounded-xl bg-gray-100 p-1">
                        {(["all", "unread", "read"] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => changeReadFilter(filter)}
                                className={`flex-1 rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-all cursor-pointer ${
                                    readFilter === filter
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-[var(--color-primary)]" />
                        <h2 className="font-bold text-gray-900">Notification inbox</h2>
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                        {meta.totalResult} total
                    </span>
                </div>

                {isLoading && notifications.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <Spin />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-16">
                        <Empty description="No notifications found" />
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <button
                                key={notification._id}
                                onClick={() => handleMarkAsRead(notification)}
                                className={`flex w-full items-start gap-4 px-5 py-5 text-left transition-colors hover:bg-gray-50 ${
                                    notification.isRead ? "bg-white" : "bg-blue-50/40"
                                }`}
                            >
                                <span className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                    notification.isRead
                                        ? "bg-gray-100 text-gray-500"
                                        : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                }`}>
                                    {getNotificationIcon(notification.type)}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-gray-900">
                                            {notification.title}
                                        </span>
                                        {!notification.isRead && (
                                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        )}
                                        <Tag color={getTypeColor(notification.type)}>
                                            {notification.type ?? "general"}
                                        </Tag>
                                    </span>
                                    <span className="mt-1 block text-sm leading-6 text-gray-600">
                                        {notification.body}
                                    </span>
                                    <span className="mt-2 block text-[11px] font-medium text-gray-400">
                                        {formatDate(notification.createdAt)}
                                    </span>
                                </span>
                                {notification.isRead && (
                                    <Check className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                <div ref={loadMoreRef} className="border-t border-gray-100 px-5 py-4 text-center">
                    {isFetching && page > 1 ? (
                        <Spin size="small" />
                    ) : page < meta.totalPage ? (
                        <span className="text-xs text-gray-400">
                            Scroll to load more notifications
                        </span>
                    ) : notifications.length > 0 ? (
                        <span className="text-xs text-gray-400">
                            Page {meta.currentPage} of {meta.totalPage} · All notifications loaded
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}