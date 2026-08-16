import React, { useState, useEffect } from "react";
import { 
    Search, Filter, MoreVertical, Star, Users, ClipboardCheck, Clock, 
    X, Shield, Edit2, Trash2, UserPlus, ArrowRightLeft, AlertTriangle, 
    Check, Eye, Sparkles, User, BadgeAlert, Plus, CheckCircle2
} from "lucide-react";
import {
    Drawer,
    Dropdown,
    Input,
    Modal,
    Select,
    Switch,
    message,
    type MenuProps,
} from "antd";
import {
    useAssignUsersToCoachMutation,
    useGetCoachesQuery,
    useGetCoachStatsQuery,
    useRemoveUsersFromCoachMutation,
} from "../../../redux/features/coach-management/index.js";
import {
    useDeleteUserMutation,
    useGetUsersQuery,
} from "../../../redux/features/user-management/index.js";

interface Coach {
    id: string;
    name: string;
    email: string;
    rating: number;
    pendingReviews: number;
    totalReviews: number;
    status: "Active" | "On Leave" | "Suspend";
    avatar: string;
    studentsCount?: number;
}

interface Student {
    id: string;
    name: string;
    email: string;
    avatar: string;
    handicap: number | string;
    assignedDate: string;
    status: "Active" | "Pending Review";
    subType: "Premium" | "Basic" | "Monthly";
    coachId: string | null; // null if unassigned
}

const INITIAL_COACHES: Coach[] = [];

const INITIAL_STUDENTS: Student[] = [];

const formatSubscription = (subscription: any): Student["subType"] => {
    if (subscription?.planType === "pro" || subscription?.planType === "elite") return "Premium";
    if (subscription?.planType === "standard" && subscription?.billingInterval === "monthly") return "Monthly";
    return "Basic";
};

const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

export default function Coaches() {
    const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES);
    const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Sidebar Drawer state
    const [selectedCoachForStudents, setSelectedCoachForStudents] = useState<Coach | null>(null);
    const [studentSearchTerm, setStudentSearchTerm] = useState("");
    const [studentFilter, setStudentFilter] = useState<"All" | "Active" | "Pending Review" | "Premium" | "Beginner">("All");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    // Modals
    const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
    const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
    const [coachFormName, setCoachFormName] = useState("");
    const [coachFormEmail, setCoachFormEmail] = useState("");
    const [coachFormStatus, setCoachFormStatus] = useState<"Active" | "On Leave" | "Suspend">("Active");

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignSearch, setAssignSearch] = useState("");
    const [assignFilter, setAssignFilter] = useState<"All" | "Unassigned" | "Assigned">("All");
    const [selectedAssignStudentIds, setSelectedAssignStudentIds] = useState<string[]>([]);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [coachToDelete, setCoachToDelete] = useState<Coach | null>(null);

    const [isCoachProfileModalOpen, setIsCoachProfileModalOpen] = useState(false);
    const [profileCoach, setProfileCoach] = useState<Coach | null>(null);

    const [isStudentProfileModalOpen, setIsStudentProfileModalOpen] = useState(false);
    const [profileStudent, setProfileStudent] = useState<Student | null>(null);

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [studentsToTransfer, setStudentsToTransfer] = useState<Student[]>([]);
    const [transferTargetCoachId, setTransferTargetCoachId] = useState<string | null>(null);

    const { data: coachesResponse } = useGetCoachesQuery({
        page: 1,
        limit: 100,
        searchTerm: debouncedSearch || undefined,
        sort: "-createdAt",
    });
    const coachesPayload = coachesResponse?.data ?? coachesResponse;
    const overview = coachesPayload?.overview;

    const { data: coachStatsResponse } = useGetCoachStatsQuery(
        {
            coachId: selectedCoachForStudents?.id ?? "",
            page: 1,
            limit: 100,
            searchTerm: studentSearchTerm || undefined,
        },
        { skip: !selectedCoachForStudents?.id },
    );

    const { data: usersResponse } = useGetUsersQuery({
        page: 1,
        limit: 100,
        role: "user",
        searchTerm: assignSearch || undefined,
        sort: "-createdAt",
    });
    const [assignUsersToCoach, { isLoading: isAssigning }] =
        useAssignUsersToCoachMutation();
    const [removeUsersFromCoach, { isLoading: isRemoving }] =
        useRemoveUsersFromCoachMutation();
    const [deleteUser, { isLoading: isDeletingCoach }] =
        useDeleteUserMutation();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const apiCoaches = coachesPayload?.results;
        if (!Array.isArray(apiCoaches)) return;
        setCoaches(apiCoaches.map((coach: any) => ({
            id: String(coach._id),
            name: coach.name ?? "Unknown Coach",
            email: coach.email ?? "",
            rating: Number(((coach.performanceScore ?? 0) / 20).toFixed(1)),
            pendingReviews: coach.pendingReviews ?? 0,
            totalReviews: coach.totalReviews ?? 0,
            status: coach.status === "active"
                ? "Active"
                : coach.status === "suspended"
                    ? "Suspend"
                    : "On Leave",
            avatar: coach.profileUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(coach.name ?? "Coach")}`,
            studentsCount: coach.studentsCount ?? 0,
        })));
    }, [coachesPayload]);

    useEffect(() => {
        const statsPayload = coachStatsResponse?.data ?? coachStatsResponse;
        const apiStudents = statsPayload?.students?.results;
        if (!selectedCoachForStudents || !Array.isArray(apiStudents)) return;
        if (
            statsPayload?.coach?._id
            && String(statsPayload.coach._id) !== selectedCoachForStudents.id
        ) return;
        const mappedStudents: Student[] = apiStudents.map((assignment: any) => {
            const student = assignment.student ?? {};
            return {
                id: String(student._id),
                name: student.name ?? "Unknown Student",
                email: student.email ?? "",
                avatar: student.profileUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name ?? "Student")}`,
                handicap: student.handicap ?? "N/A",
                assignedDate: formatDate(assignment.assignedDate),
                status: student.status === "active" ? "Active" : "Pending Review",
                subType: formatSubscription(student.subscription),
                coachId: selectedCoachForStudents.id,
            };
        });
        setStudents(mappedStudents);
        if (isTransferModalOpen && studentsToTransfer.length === 0) {
            setStudentsToTransfer(mappedStudents);
        }
    }, [
        coachStatsResponse,
        isTransferModalOpen,
        selectedCoachForStudents,
        studentsToTransfer.length,
    ]);

    // Get current student count dynamically
    const getStudentCount = (coachId: string) => {
        return coaches.find((coach) => coach.id === coachId)?.studentsCount
            ?? students.filter(s => s.coachId === coachId).length;
    };

    // Filtered Coaches
    const filteredCoaches = coaches.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Save Coach Form
    const handleSaveCoach = () => {
        if (!coachFormName.trim() || !coachFormEmail.trim()) return;

        if (editingCoach) {
            setCoaches(coaches.map(c => c.id === editingCoach.id ? {
                ...c,
                name: coachFormName.trim(),
                email: coachFormEmail.trim(),
                status: coachFormStatus
            } : c));
        } else {
            setCoaches([...coaches, {
                id: String(Date.now()),
                name: coachFormName.trim(),
                email: coachFormEmail.trim(),
                rating: 5.0,
                pendingReviews: 0,
                totalReviews: 0,
                status: coachFormStatus,
                avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
            }]);
        }
        setIsCoachModalOpen(false);
    };

    // Delete Coach
    const handleConfirmDeleteCoach = async () => {
        if (coachToDelete) {
            try {
                await deleteUser(coachToDelete.id).unwrap();
                // Keep the existing local cleanup so the UI updates immediately.
                setStudents(students.map(s => s.coachId === coachToDelete.id ? { ...s, coachId: null } : s));
                setCoaches(coaches.filter(c => c.id !== coachToDelete.id));
                setIsDeleteConfirmOpen(false);
                setCoachToDelete(null);
                message.success("Coach deleted successfully.");
            } catch {
                message.error("Unable to delete coach. Please try again.");
            }
        }
    };

    // Open Add Coach Modal
    const openAddCoach = () => {
        setEditingCoach(null);
        setCoachFormName("");
        setCoachFormEmail("");
        setCoachFormStatus("Active");
        setIsCoachModalOpen(true);
    };

    // Open Edit Coach Modal
    const openEditCoach = (coach: Coach) => {
        setEditingCoach(coach);
        setCoachFormName(coach.name);
        setCoachFormEmail(coach.email);
        setCoachFormStatus(coach.status);
        setIsCoachModalOpen(true);
    };

    // Change Coach Status directly
    const handleChangeCoachStatus = (coachId: string, status: "Active" | "On Leave" | "Suspend") => {
        setCoaches(coaches.map(c => c.id === coachId ? { ...c, status } : c));
    };

    const getCoachMenuItems = (coach: Coach): NonNullable<MenuProps["items"]> => [
        {
            key: "profile",
            icon: <Eye className="w-4 h-4 text-gray-400" />,
            label: "View Coach Profile",
            onClick: () => {
                setProfileCoach(coach);
                setIsCoachProfileModalOpen(true);
            },
        },
        { type: "divider" },
        {
            key: "assign",
            icon: <UserPlus className="w-4 h-4 text-gray-400" />,
            label: "Assign Students",
            onClick: () => {
                setSelectedCoachForStudents(coach);
                openAssignStudentModal();
            },
        },
        {
            key: "transfer",
            icon: <ArrowRightLeft className="w-4 h-4 text-gray-400" />,
            label: "Transfer Students",
            onClick: () => {
                setStudentsToTransfer([]);
                setTransferTargetCoachId(coaches.find(c => c.id !== coach.id)?.id || null);
                setSelectedCoachForStudents(coach);
                setIsTransferModalOpen(true);
            },
        },  
        { type: "divider" },
        {
            key: "delete",
            danger: true,
            icon: <Trash2 className="w-4 h-4" />,
            label: "Delete Coach",
            onClick: () => {
                setCoachToDelete(coach);
                setIsDeleteConfirmOpen(true);
            },
        },
    ];

    // Remove single student from coach
    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedCoachForStudents) return;
        try {
            await removeUsersFromCoach({
                coachId: selectedCoachForStudents.id,
                userId: studentId,
            }).unwrap();
            setStudents(students.filter(s => s.id !== studentId));
            setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
            message.success("Student removed from coach.");
        } catch {
            message.error("Unable to remove student. Please try again.");
        }
    };

    // Open Assign Student Modal (multi-select)
    const openAssignStudentModal = () => {
        setSelectedAssignStudentIds([]);
        setAssignSearch("");
        setAssignFilter("All");
        setIsAssignModalOpen(true);
    };

    // Submit multi-select assignment
    const handleAssignStudentSubmit = async () => {
        if (selectedCoachForStudents && selectedAssignStudentIds.length > 0) {
            try {
                const sourceCoachGroups = registeredUsers
                    .filter((student) =>
                        selectedAssignStudentIds.includes(student.id)
                        && student.coachId
                        && student.coachId !== selectedCoachForStudents.id
                    )
                    .reduce<Record<string, string[]>>((groups, student) => {
                        const coachId = student.coachId as string;
                        groups[coachId] = [...(groups[coachId] ?? []), student.id];
                        return groups;
                    }, {});

                for (const [coachId, userIds] of Object.entries(sourceCoachGroups)) {
                    await removeUsersFromCoach({ coachId, userId: userIds }).unwrap();
                }
                await assignUsersToCoach({
                    coachId: selectedCoachForStudents.id,
                    userId: selectedAssignStudentIds,
                }).unwrap();
                setIsAssignModalOpen(false);
                setSelectedAssignStudentIds([]);
                message.success("Students assigned successfully.");
            } catch {
                message.error("Unable to assign one or more students. Assigned users must be transferred first.");
            }
        }
    };

    // Transfer students to target coach
    const handleTransferStudentsSubmit = async () => {
        if (transferTargetCoachId && selectedCoachForStudents) {
            const studentIdsToMove = studentsToTransfer.map(s => s.id);
            try {
                await removeUsersFromCoach({
                    coachId: selectedCoachForStudents.id,
                    userId: studentIdsToMove,
                }).unwrap();
                await assignUsersToCoach({
                    coachId: transferTargetCoachId,
                    userId: studentIdsToMove,
                }).unwrap();
                setStudents(students.filter(s => !studentIdsToMove.includes(s.id)));
                setIsTransferModalOpen(false);
                setSelectedStudentIds([]);
                setStudentsToTransfer([]);
                setTransferTargetCoachId(null);
                message.success("Students transferred successfully.");
            } catch {
                message.error("Unable to transfer students. Please try again.");
            }
        }
    };

    // Bulk transfer trigger
    const triggerBulkTransfer = () => {
        const selected = students.filter(s => selectedStudentIds.includes(s.id));
        setStudentsToTransfer(selected);
        setTransferTargetCoachId(coaches.find(c => c.id !== selectedCoachForStudents?.id)?.id || null);
        setIsTransferModalOpen(true);
    };

    // Bulk remove trigger
    const triggerBulkRemove = async () => {
        if (window.confirm(`Are you sure you want to remove ${selectedStudentIds.length} students?`)) {
            if (!selectedCoachForStudents) return;
            try {
                await removeUsersFromCoach({
                    coachId: selectedCoachForStudents.id,
                    userId: selectedStudentIds,
                }).unwrap();
                setStudents(students.filter(s => !selectedStudentIds.includes(s.id)));
                setSelectedStudentIds([]);
                message.success("Selected students removed.");
            } catch {
                message.error("Unable to remove selected students.");
            }
        }
    };

    // Selected Coach assigned students
    const coachStudents = selectedCoachForStudents 
        ? students.filter(s => s.coachId === selectedCoachForStudents.id) 
        : [];

    // Filtered Students inside Drawer
    const filteredStudents = coachStudents.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
                             s.email.toLowerCase().includes(studentSearchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        if (studentFilter === "All") return true;
        if (studentFilter === "Active") return s.status === "Active";
        if (studentFilter === "Pending Review") return s.status === "Pending Review";
        if (studentFilter === "Premium") return s.subType === "Premium";
        if (studentFilter === "Beginner") return Number(s.handicap) > 15;

        return true;
    });

    // Registered users to assign (excluding already assigned to this coach)
    const usersPayload = usersResponse?.data ?? usersResponse;
    const registeredUsers: Student[] = (usersPayload?.results ?? []).map((user: any) => ({
        id: String(user._id),
        name: user.name ?? "Unknown Student",
        email: user.email ?? "",
        avatar: user.profileUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? "Student")}`,
        handicap: user.handicap ?? "N/A",
        assignedDate: "N/A",
        status: user.status === "active" ? "Active" : "Pending Review",
        subType: formatSubscription(user.subscription),
        coachId: user.coach ? String(user.coach._id ?? user.coach) : null,
    }));

    const assignableUsers = registeredUsers.filter(s => {
        // Exclude students who are already assigned to the active coach
        if (selectedCoachForStudents && s.coachId === selectedCoachForStudents.id) return false;

        const matchesSearch = s.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                             s.email.toLowerCase().includes(assignSearch.toLowerCase());
        if (!matchesSearch) return false;

        if (assignFilter === "All") return true;
        if (assignFilter === "Unassigned") return s.coachId === null;
        if (assignFilter === "Assigned") return s.coachId !== null;

        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Coach Management</h1>
                    <p className="mt-1 text-gray-500 text-sm">Manage coach profiles, view performance, and assign students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Input
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            placeholder="Search coaches..."
                            className="py-2 border-gray-200 rounded-xl text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={openAddCoach}
                        className="flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-[var(--color-primary)]/10"
                    >
                        + Add Coach
                    </button>
                </div>
            </div>

            {/* Coach Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Active Coaches</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {overview?.totalActiveCoaches ?? coaches.filter(c => c.status === "Active").length}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Avg. Review Time</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {overview?.averageReviewTimeHours ?? 0} Hrs
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Reviews This Month</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {(overview?.totalReviewsThisMonth ?? 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <ClipboardCheck className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Coach Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoaches.map(coach => {
                    const studentCount = getStudentCount(coach.id);
                    return (
                        <div key={coach.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <img src={coach.avatar} alt={coach.name} className="w-16 h-16 rounded-full border-2 border-gray-100 object-cover" />
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{coach.name}</h3>
                                            <p className="text-sm text-gray-500">{coach.email}</p>
                                            <div className="flex items-center mt-1 text-sm font-semibold text-gray-700">
                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                                                {coach.rating}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Dropdown Menu Trigger */}
                                    <Dropdown
                                        menu={{ items: getCoachMenuItems(coach) }}
                                        trigger={["click"]}
                                        placement="bottomRight"
                                    >
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl transition-colors cursor-pointer"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </Dropdown>
                                </div>

                                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 font-medium">Students</p>
                                        <p className="font-bold text-gray-900 mt-1">{studentCount}</p>
                                    </div>
                                    <div className="text-center border-l border-r border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Pending</p>
                                        <p className="font-bold text-amber-600 mt-1">{coach.pendingReviews}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 font-medium">Total</p>
                                        <p className="font-bold text-gray-900 mt-1">{coach.totalReviews}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        coach.status === 'Active' 
                                        ? 'bg-green-50 text-green-700' 
                                        : coach.status === 'On Leave' 
                                        ? 'bg-orange-50 text-orange-700' 
                                        : 'bg-red-50 text-red-700'
                                    }`}>
                                        {coach.status}
                                    </span>
                                    <button 
                                        onClick={() => {
                                            setSelectedCoachForStudents(coach);
                                            setSelectedStudentIds([]);
                                            setStudentSearchTerm("");
                                            setStudentFilter("All");
                                        }}
                                        className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer hover:border-gray-300"
                                    >
                                        Manage Students
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right Side Drawer: Student Management */}
            <Drawer
                open={Boolean(selectedCoachForStudents)}
                onClose={() => setSelectedCoachForStudents(null)}
                placement="right"
                width={576}
                closable={false}
                styles={{ body: { padding: 0 } }}
            >
                {selectedCoachForStudents && (
                    <div className="bg-white h-full flex flex-col">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-950">Manage Students</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Assign, remove, filter and review student roster.</p>
                            </div>
                            <button 
                                onClick={() => setSelectedCoachForStudents(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-150 rounded-xl transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Coach Info Section */}
                        <div className="p-6 border-b border-gray-100 bg-white">
                            <div className="flex items-center gap-4">
                                <img src={selectedCoachForStudents.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover border" />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base">{selectedCoachForStudents.name}</h4>
                                    <p className="text-xs text-gray-500">{selectedCoachForStudents.email}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600 font-semibold">
                                        <span className="flex items-center text-amber-500">
                                            <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                                            {selectedCoachForStudents.rating} Rating
                                        </span>
                                        <span>•</span>
                                        <span>{coachStudents.length} Assigned Students</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Roster Controls */}
                        <div className="p-6 border-b border-gray-100 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative flex-1">
                                    <Input
                                        prefix={<Search className="w-4 h-4 text-gray-400" />}
                                        placeholder="Search student by name or email..."
                                        value={studentSearchTerm}
                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                        className="py-2.5 rounded-xl border-gray-200 text-xs"
                                    />
                                </div>
                                <button 
                                    onClick={openAssignStudentModal}
                                    className="px-4 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:opacity-90 shadow-md shadow-[var(--color-primary)]/10 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4 stroke-[3]" />
                                    Assign Student
                                </button>
                            </div>

                            {/* Category Filters */}
                            <div className="flex flex-wrap gap-1.5">
                                {([
                                    { id: "All", label: "All Students" },
                                    { id: "Active", label: "Active" },
                                    { id: "Pending Review", label: "Pending Review" },
                                    { id: "Premium", label: "Premium Tier" },
                                    { id: "Beginner", label: "Beginner (HC > 15)" }
                                ] as const).map(filterOpt => (
                                    <button
                                        key={filterOpt.id}
                                        onClick={() => setStudentFilter(filterOpt.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            studentFilter === filterOpt.id 
                                            ? 'bg-gray-900 text-white shadow-sm' 
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                    >
                                        {filterOpt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Bulk Action Controls */}
                            {selectedStudentIds.length > 0 && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                                    <span className="text-xs font-bold text-amber-800">
                                        {selectedStudentIds.length} Selected
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={triggerBulkTransfer}
                                            className="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 font-bold text-xs rounded-lg hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <ArrowRightLeft className="w-3.5 h-3.5" />
                                            Transfer
                                        </button>
                                        <button 
                                            onClick={triggerBulkRemove}
                                            className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Remove Selected
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Students Scroll List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-gray-50/50">
                            {filteredStudents.map(student => {
                                const isSelected = selectedStudentIds.includes(student.id);
                                return (
                                    <div 
                                        key={student.id} 
                                        className={`bg-white p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                                            isSelected ? 'border-gray-900 ring-1 ring-gray-900/5 shadow-md' : 'border-gray-100 hover:border-gray-200 hover:shadow-xs'
                                        }`}
                                    >
                                        {/* Selection Checkbox */}
                                        <input 
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                                if (isSelected) {
                                                    setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                                                } else {
                                                    setSelectedStudentIds([...selectedStudentIds, student.id]);
                                                }
                                            }}
                                            className="mt-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer h-4 w-4"
                                        />

                                        {/* Student Info Card */}
                                        <img src={student.avatar} alt="" className="w-12 h-12 rounded-full border object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-bold text-gray-900 text-sm truncate">{student.name}</h5>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                    student.status === "Active" 
                                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                                                }`}>
                                                    {student.status}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 truncate">{student.email}</p>
                                            
                                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50 text-[10px] text-gray-500 font-semibold">
                                                <div>Handicap: <span className="text-gray-800 font-bold">{student.handicap}</span></div>
                                                <div>Assigned: <span className="text-gray-800">{student.assignedDate}</span></div>
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="flex flex-col gap-1.5 shrink-0">
                                            <button 
                                                onClick={() => handleRemoveStudent(student.id)}
                                                className="px-2.5 py-1 border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                            >
                                                Remove
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setProfileStudent(student);
                                                    setIsStudentProfileModalOpen(true);
                                                }}
                                                className="px-2.5 py-1 border border-gray-200 text-gray-600 hover:bg-gray-55 rounded-lg text-[10px] font-bold cursor-pointer transition-colors text-center"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredStudents.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <Users className="w-10 h-10 mx-auto text-gray-300 mb-2.5" />
                                    <p className="text-sm font-bold">No students found</p>
                                    <p className="text-xs text-gray-400 mt-1">Try tweaking filters or assign a new student to this coach.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Coach Create/Edit Dialog */}
            <Modal
                open={isCoachModalOpen}
                onCancel={() => setIsCoachModalOpen(false)}
                footer={null}
                closable={false}
                width={448}
            >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingCoach ? 'Edit Coach Information' : 'Add New Coach'}
                            </h2>
                            <button onClick={() => setIsCoachModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Coach Name</label>
                                <Input 
                                    value={coachFormName}
                                    onChange={(e) => setCoachFormName(e.target.value)}
                                    placeholder="e.g. Sarah Smith"
                                    className="py-2.5 rounded-xl border-gray-200 text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                                <Input 
                                    type="email"
                                    value={coachFormEmail}
                                    onChange={(e) => setCoachFormEmail(e.target.value)}
                                    placeholder="e.g. sarah@golfimprove.com"
                                    className="py-2.5 rounded-xl border-gray-200 text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Status</label>
                                <Select 
                                    value={coachFormStatus}
                                    onChange={(value) => setCoachFormStatus(value)}
                                    className="w-full h-11"
                                    options={[
                                        { value: 'Active', label: 'Active' },
                                        { value: 'On Leave', label: 'On Leave' },
                                        { value: 'Suspend', label: 'Suspend' },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsCoachModalOpen(false)}
                                className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveCoach}
                                disabled={!coachFormName.trim() || !coachFormEmail.trim()}
                                className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--color-primary)] rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center"
                            >
                                <Check className="w-4 h-4 mr-1.5 stroke-[3]" />
                                Save
                            </button>
                        </div>
            </Modal>

            {/* Assign Student Sub-Modal Dialog with MULTI-SELECT support */}
            <Modal
                open={isAssignModalOpen && Boolean(selectedCoachForStudents)}
                onCancel={() => setIsAssignModalOpen(false)}
                footer={null}
                closable={false}
                width={512}
            >
                {selectedCoachForStudents && (
                    <>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Assign Students</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Assign one or more students to coach <span className="font-bold text-gray-800">{selectedCoachForStudents.name}</span></p>
                            </div>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search & Filter bar inside assignment modal */}
                        <div className="p-6 pb-2 space-y-3">
                            <div className="relative">
                                <Input 
                                    prefix={<Search className="w-4 h-4 text-gray-400" />}
                                    value={assignSearch}
                                    onChange={(e) => setAssignSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="py-2.5 rounded-xl border-gray-200 text-sm" 
                                />
                            </div>
                            <div className="flex gap-1.5">
                                {([
                                    { id: "All", label: "All Users" },
                                    { id: "Unassigned", label: "Unassigned Only" },
                                    { id: "Assigned", label: "Assigned to Others" }
                                ] as const).map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setAssignFilter(opt.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            assignFilter === opt.id 
                                            ? 'bg-gray-900 text-white' 
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            <div className="space-y-2 max-h-[250px] overflow-y-auto p-3 bg-gray-50 rounded-2xl border">
                                {assignableUsers.map((st) => {
                                    const isChecked = selectedAssignStudentIds.includes(st.id);
                                    const currentCoach = coaches.find(c => c.id === st.coachId);
                                    return (
                                        <div 
                                            key={st.id} 
                                            onClick={() => {
                                                if (isChecked) {
                                                    setSelectedAssignStudentIds(selectedAssignStudentIds.filter(id => id !== st.id));
                                                } else {
                                                    setSelectedAssignStudentIds([...selectedAssignStudentIds, st.id]);
                                                }
                                            }}
                                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                                isChecked 
                                                ? 'border-gray-900 bg-white shadow-xs' 
                                                : 'border-transparent hover:bg-white/80'
                                            }`}
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}} // handled by parent div click
                                                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 h-4 w-4 pointer-events-none"
                                            />
                                            <img src={st.avatar} alt="" className="w-8 h-8 rounded-full border object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{st.name}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{st.email}</p>
                                            </div>
                                            {currentCoach ? (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-blue-50 text-blue-700 font-bold border border-blue-100">
                                                    Coach: {currentCoach.name}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-gray-100 text-gray-500 font-bold border border-gray-200">
                                                    Unassigned
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                                {assignableUsers.length === 0 && (
                                    <p className="text-center text-xs text-gray-400 italic py-8">No registered users match your search/filters.</p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500">
                                {selectedAssignStudentIds.length} student(s) selected
                            </span>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAssignStudentSubmit}
                                    disabled={selectedAssignStudentIds.length === 0 || isAssigning || isRemoving}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--color-primary)] rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isAssigning || isRemoving ? "Assigning..." : "Confirm Assignment"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </Modal>

            {/* Transfer Coach Dialog */}
            <Modal
                open={isTransferModalOpen && Boolean(selectedCoachForStudents)}
                onCancel={() => setIsTransferModalOpen(false)}
                footer={null}
                closable={false}
                width={448}
            >
                {selectedCoachForStudents && (
                    <>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Transfer Students</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Moving {studentsToTransfer.length} students from {selectedCoachForStudents.name}</p>
                            </div>
                            <button onClick={() => setIsTransferModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Target Coach</label>
                                <Select 
                                    value={transferTargetCoachId}
                                    onChange={(value) => setTransferTargetCoachId(value)}
                                    className="w-full h-11"
                                    options={coaches
                                        .filter(c => c.id !== selectedCoachForStudents.id)
                                        .map(c => ({ value: c.id, label: `${c.name} (${c.email})` }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsTransferModalOpen(false)}
                                className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleTransferStudentsSubmit}
                                disabled={!transferTargetCoachId || isAssigning || isRemoving}
                                className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--color-primary)] rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isAssigning || isRemoving ? "Transferring..." : "Transfer"}
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* Coach Profile View Dialog */}
            <Modal
                open={isCoachProfileModalOpen && Boolean(profileCoach)}
                onCancel={() => setIsCoachProfileModalOpen(false)}
                footer={null}
                closable={false}
                width={448}
            >
                {profileCoach && (
                        <div className="p-6 text-center">
                            <button 
                                onClick={() => setIsCoachProfileModalOpen(false)} 
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <img src={profileCoach.avatar} alt="" className="mx-auto w-24 h-24 rounded-full border-4 border-gray-100 object-cover mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">{profileCoach.name}</h3>
                            <p className="text-sm text-gray-500">{profileCoach.email}</p>
                            
                            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Rating</p>
                                    <p className="text-lg font-black text-gray-900 mt-1 flex items-center justify-center gap-1">
                                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                        {profileCoach.rating}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                                    <p className="text-sm font-extrabold text-gray-900 mt-2.5">{profileCoach.status}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3 justify-center">
                                <button 
                                    onClick={() => {
                                        setIsCoachProfileModalOpen(false);
                                        setSelectedCoachForStudents(profileCoach);
                                    }}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--color-primary)] rounded-xl hover:opacity-90 transition-all cursor-pointer flex-1"
                                >
                                    Manage Roster
                                </button>
                            </div>
                        </div>
                )}
            </Modal>

            {/* Student Profile View Dialog */}
            <Modal
                open={isStudentProfileModalOpen && Boolean(profileStudent)}
                onCancel={() => setIsStudentProfileModalOpen(false)}
                footer={null}
                closable={false}
                width={448}
            >
                {profileStudent && (
                        <div className="p-6 text-center">
                            <button 
                                onClick={() => setIsStudentProfileModalOpen(false)} 
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <img src={profileStudent.avatar} alt="" className="mx-auto w-20 h-20 rounded-full border-4 border-gray-100 object-cover mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">{profileStudent.name}</h3>
                            <p className="text-xs text-gray-500">{profileStudent.email}</p>
                            
                            <div className="mt-6 space-y-2 text-left border-t border-gray-150 pt-4 text-xs">
                                <div className="flex justify-between py-1.5 border-b border-gray-50">
                                    <span className="text-gray-400 font-medium">Handicap Score</span>
                                    <span className="font-bold text-gray-800">{profileStudent.handicap}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-gray-50">
                                    <span className="text-gray-400 font-medium">Subscription Plan</span>
                                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{profileStudent.subType}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-gray-50">
                                    <span className="text-gray-400 font-medium">Assigned Date</span>
                                    <span className="font-bold text-gray-800">{profileStudent.assignedDate}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-gray-50">
                                    <span className="text-gray-400 font-medium">Current Status</span>
                                    <span className={`font-bold px-2 py-0.5 rounded ${
                                        profileStudent.status === "Active" ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                                    }`}>{profileStudent.status}</span>
                                </div>
                                <div className="flex justify-between py-1.5">
                                    <span className="text-gray-400 font-medium">Assigned Coach</span>
                                    <span className="font-bold text-gray-850">
                                        {coaches.find(c => c.id === profileStudent.coachId)?.name || "Unassigned"}
                                    </span>
                                </div>
                            </div>
                        </div>
                )}
            </Modal>

            {/* Coach Delete Confirmation Dialog */}
            <Modal
                open={isDeleteConfirmOpen && Boolean(coachToDelete)}
                onCancel={() => setIsDeleteConfirmOpen(false)}
                footer={null}
                closable={false}
                width={384}
            >
                {coachToDelete && (
                        <div className="p-6 text-center">
                            <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-100">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Coach Profile?</h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Are you sure you want to remove <span className="font-bold text-gray-800">"{coachToDelete.name}"</span>? Any assigned students will be unassigned.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button 
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmDeleteCoach}
                                    disabled={isDeletingCoach}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isDeletingCoach ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                )}
            </Modal>
        </div>
    );
}