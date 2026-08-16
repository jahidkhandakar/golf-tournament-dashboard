import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Ban,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    ShieldCheck,
} from "lucide-react";
import {
    Input,
    Table,
    Select,
    Dropdown,
    Button,
    Modal,
    Descriptions,
    Avatar,
    Tag,
    message,
    type MenuProps,
    type TableProps,
} from "antd";
import {
    useGetUsersQuery,
    useChangeUserStatusMutation,
} from "../../../redux/features/user-management/index.js";

const formatSubscription = (user: any) => {
    const sub = user?.subscription;
    if (!sub) return "None";
    if (sub.planType === "pro" || sub.planType === "elite") return "Premium";
    if (sub.planType === "standard") {
        return sub.billingInterval === "monthly" ? "Monthly" : "Basic";
    }
    if (sub.planType === "trial") return "Trial";
    return sub.planName || "Basic";
};

const formatStatus = (status?: string) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function Users() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [roleFilter, setRoleFilter] = useState<string | undefined>();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const queryArgs = useMemo(() => {
        const args: {
            page: number;
            limit: number;
            sort: string;
            searchTerm?: string;
            status?: string;
            role?: string;
        } = {
            page,
            limit,
            sort: "-createdAt",
        };
        if (debouncedSearch) args.searchTerm = debouncedSearch;
        if (statusFilter) args.status = statusFilter;
        if (roleFilter) args.role = roleFilter;
        return args;
    }, [page, limit, debouncedSearch, statusFilter, roleFilter]);

    const { data, isLoading, isFetching } = useGetUsersQuery(queryArgs);

    const [changeUserStatus, { isLoading: isUpdatingStatus }] =
        useChangeUserStatusMutation();

    const payload = data?.data ?? data;
    const users = payload?.results ?? [];
    const meta = payload?.meta ?? {
        totalResult: 0,
        currentPage: 1,
        limit: 10,
        totalPage: 1,
    };

    const handleStatusChange = async (user: any, status: string) => {
        try {
            await changeUserStatus({ id: user._id, status }).unwrap();
            message.success(
                `${user.name} has been ${status === "active" ? "activated" : "suspended"}.`,
            );
        } catch {
            message.error("Unable to update user status. Please try again.");
        }
    };

    const getActionItems = (user: any): MenuProps["items"] => [
        {
            key: "view",
            icon: <Eye className="w-4 h-4" />,
            label: "View Details",
            onClick: () => setSelectedUser(user),
        },
        { type: "divider" },
        {
            key: "active",
            icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
            label: "Activate User",
            disabled: user.status === "active",
            onClick: () => handleStatusChange(user, "active"),
        },
        {
            key: "suspended",
            icon: <Ban className="w-4 h-4 text-red-500" />,
            label: "Suspend User",
            disabled: user.status === "suspended",
            danger: true,
            onClick: () => handleStatusChange(user, "suspended"),
        },
    ];

    const columns: TableProps<any>["columns"] = useMemo(
        () => [
            {
                title: "User",
                key: "user",
                render: (_, user) => (
                    <div className="flex items-center gap-3">
                        <img
                            src={
                                user.profileUrl ||
                                `https://i.pravatar.cc/150?u=${user._id}`
                            }
                            alt=""
                            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                        />
                        <div>
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                    </div>
                ),
            },
            {
                title: "Handicap",
                key: "handicap",
                render: (_, user) => (
                    <span className="font-semibold text-gray-700">
                        {user.handicap != null ? user.handicap : "—"}
                    </span>
                ),
            },
            {
                title: "Role",
                key: "role",
                render: (_, user) => {
                    const role = String(user.role || "user");
                    const color =
                        role === "admin"
                            ? "purple"
                            : role === "coach"
                              ? "blue"
                              : "green";
                    return (
                        <Tag
                            color={color}
                            icon={
                                role === "admin" ? (
                                    <ShieldCheck className="w-3 h-3" />
                                ) : undefined
                            }
                            className="capitalize font-semibold"
                        >
                            {role}
                        </Tag>
                    );
                },
            },
            {
                title: "Coach",
                key: "coach",
                render: (_, user) => {
                    const coachName = user.coach?.name || "Unassigned";
                    const unassigned = !user.coach?.name;
                    return (
                        <span
                            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                unassigned
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-blue-50 text-blue-700"
                            }`}
                        >
                            {coachName}
                        </span>
                    );
                },
            },
            {
                title: "Subscription",
                key: "subscription",
                render: (_, user) => {
                    const sub = formatSubscription(user);
                    return (
                        <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                sub === "Premium"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {sub}
                        </span>
                    );
                },
            },
            {
                title: "Status",
                key: "status",
                render: (_, user) => {
                    const status = formatStatus(user.status);
                    if (status === "Active") {
                        return (
                            <span className="flex items-center text-green-600 text-xs font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />{" "}
                                Active
                            </span>
                        );
                    }
                    return (
                        <span className="flex items-center text-red-500 text-xs font-semibold">
                            <Ban className="w-3.5 h-3.5 mr-1" /> {status}
                        </span>
                    );
                },
            },
            {
                title: "Actions",
                key: "actions",
                align: "right",
                render: (_, user) => (
                    <Dropdown
                        menu={{ items: getActionItems(user) ?? [] }}
                        trigger={["click"]}
                        placement="bottomRight"
                        disabled={isUpdatingStatus}
                    >
                        <button
                            type="button"
                            aria-label={`Actions for ${user.name}`}
                            className="text-gray-400 hover:text-[var(--color-primary)] transition-colors p-1 cursor-pointer"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </Dropdown>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const from =
        meta.totalResult === 0 ? 0 : (meta.currentPage - 1) * meta.limit + 1;
    const to = Math.min(meta.currentPage * meta.limit, meta.totalResult);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        User Management
                    </h1>
                    <p className="mt-1 text-gray-500 text-sm">
                        Manage users, assign coaches, and view profiles.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative w-64">
                        <Input
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            placeholder="Search users..."
                            className="py-2 border-gray-200 rounded-xl text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFilters((prev) => !prev)}
                        className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4">
                    <Select
                        allowClear
                        placeholder="Status"
                        className="w-40"
                        value={statusFilter}
                        onChange={(value) => {
                            setStatusFilter(value);
                            setPage(1);
                        }}
                        options={[
                            { value: "active", label: "Active" },
                            { value: "pending", label: "Pending" },
                            { value: "suspended", label: "Suspended" },
                        ]}
                    />
                    <Select
                        allowClear
                        placeholder="Role"
                        className="w-40"
                        value={roleFilter}
                        onChange={(value) => {
                            setRoleFilter(value);
                            setPage(1);
                        }}
                        options={[
                            { value: "user", label: "User" },
                            { value: "coach", label: "Coach" },
                            { value: "admin", label: "Admin" },
                        ]}
                    />
                    <Button
                        danger 
                        onClick={() => {
                            setStatusFilter(undefined);
                            setRoleFilter(undefined);
                            setSearchTerm("");
                            setDebouncedSearch("");
                            setPage(1);
                        }}
                    >
                        Clear
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden users-table-wrap">
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={users}
                    loading={isLoading || isFetching}
                    pagination={
                        meta.totalPage > 1
                            ? {
                                  current: meta.currentPage,
                                  pageSize: limit,
                                  total: meta.totalResult,
                                  showSizeChanger: false,
                                  showQuickJumper: false,
                                  showTotal: () =>
                                      `Showing ${from} to ${to} of ${meta.totalResult} entries`,
                                  itemRender: (_page, type, originalElement) => {
                                      if (type === "prev") {
                                          return (
                                              <button
                                                  type="button"
                                                  aria-label="Previous page"
                                                  className="inline-flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                                              >
                                                  <ChevronLeft className="w-4 h-4" />
                                              </button>
                                          );
                                      }
                                      if (type === "next") {
                                          return (
                                              <button
                                                  type="button"
                                                  aria-label="Next page"
                                                  className="inline-flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                                              >
                                                  <ChevronRight className="w-4 h-4" />
                                              </button>
                                          );
                                      }
                                      return originalElement;
                                  },
                                  onChange: (nextPage) => setPage(nextPage),
                                  className: "users-pagination px-4 py-3",
                              }
                            : false
                    }
                    className="users-table"
                />
            </div>

            <Modal
                title="User Details"
                open={Boolean(selectedUser)}
                onCancel={() => setSelectedUser(null)}
                footer={[
                    <Button key="close" onClick={() => setSelectedUser(null)}>
                        Close
                    </Button>,
                ]}
                centered
                width={640}
            >
                {selectedUser && (
                    <div className="pt-3">
                        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                            <Avatar
                                size={64}
                                src={
                                    selectedUser.profileUrl ||
                                    `https://i.pravatar.cc/150?u=${selectedUser._id}`
                                }
                            />
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {selectedUser.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {selectedUser.email}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Tag
                                        color={
                                            selectedUser.role === "admin"
                                                ? "purple"
                                                : selectedUser.role === "coach"
                                                  ? "blue"
                                                  : "green"
                                        }
                                        className="capitalize"
                                    >
                                        {selectedUser.role || "user"}
                                    </Tag>
                                    <Tag
                                        color={
                                            selectedUser.status === "active"
                                                ? "success"
                                                : "error"
                                        }
                                        className="capitalize"
                                    >
                                        {formatStatus(selectedUser.status)}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                            <Descriptions.Item label="Handicap">
                                {selectedUser.handicap ?? "Not set"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Coach">
                                {selectedUser.coach?.name || "Unassigned"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Subscription">
                                {formatSubscription(selectedUser)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Gender">
                                {selectedUser.gender || "Not provided"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Country">
                                {selectedUser.country || "Not provided"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Joined">
                                {selectedUser.createdAt
                                    ? new Date(
                                          selectedUser.createdAt,
                                      ).toLocaleDateString()
                                    : "Unknown"}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
}
