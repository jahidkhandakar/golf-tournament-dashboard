import React, { useEffect, useState } from "react";
import { Edit2, Plus, Camera, Trash2, GripVertical, Settings2, X, Check } from "lucide-react";
import { Input, Pagination, Select, message } from "antd";
import {
    useAddSwingCategoryAngleMutation,
    useCreateSwingCategoryMutation,
    useDeleteSwingCategoryMutation,
    useGetSwingCategoriesQuery,
    useRemoveSwingCategoryAngleMutation,
    useUpdateSwingCategoryMutation,
    type SwingCategoryDifficulty,
} from "../../../redux/features/swing-category/index.js";

interface Category {
    id: string;
    name: string;
    angles: string[];
    difficulty: SwingCategoryDifficulty;
    videos: number;
}

const INITIAL_CATEGORIES: Category[] = [];

const getErrorMessage = (error: unknown, fallback: string) =>
    (error as any)?.data?.message ?? fallback;

export default function SwingCategories() {
    const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [modalName, setModalName] = useState("");
    const [modalDifficulty, setModalDifficulty] = useState<SwingCategoryDifficulty>("Beginner");
    const [modalAngles, setModalAngles] = useState<string[]>([]);
    const [modalAngleInput, setModalAngleInput] = useState("");

    // Inline Add Angle State
    const [addingAngleToId, setAddingAngleToId] = useState<string | null>(null);
    const [inlineAngleInput, setInlineAngleInput] = useState("");

    const { data: categoriesResponse, isLoading: isLoadingCategories } =
        useGetSwingCategoriesQuery({ page, limit: pageSize });
    const categoryMeta = categoriesResponse?.meta
        ?? categoriesResponse?.data?.meta
        ?? {
            totalResult: 0,
            currentPage: page,
            limit: pageSize,
            totalPage: 1,
        };
    const [createSwingCategory, { isLoading: isCreating }] =
        useCreateSwingCategoryMutation();
    const [updateSwingCategory, { isLoading: isUpdating }] =
        useUpdateSwingCategoryMutation();
    const [deleteSwingCategory, { isLoading: isDeleting }] =
        useDeleteSwingCategoryMutation();
    const [addSwingCategoryAngle, { isLoading: isAddingAngle }] =
        useAddSwingCategoryAngleMutation();
    const [removeSwingCategoryAngle, { isLoading: isRemovingAngle }] =
        useRemoveSwingCategoryAngleMutation();

    useEffect(() => {
        const apiCategories = categoriesResponse?.data ?? categoriesResponse;
        if (!Array.isArray(apiCategories)) return;
        setCategories(apiCategories.map((category: any) => ({
            id: String(category._id),
            name: category.name ?? "Unnamed Category",
            angles: category.cameraAngles ?? [],
            difficulty: category.difficulty ?? "Beginner",
            videos: category.usageCount ?? 0,
        })));
    }, [categoriesResponse]);

    useEffect(() => {
        if (categoryMeta.totalPage > 0 && page > categoryMeta.totalPage) {
            setPage(categoryMeta.totalPage);
        }
    }, [categoryMeta.totalPage, page]);

    const openAddModal = () => {
        setEditingCategory(null);
        setModalName("");
        setModalDifficulty("Beginner");
        setModalAngles([]);
        setModalAngleInput("");
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setModalName(cat.name);
        setModalDifficulty(cat.difficulty);
        setModalAngles([...cat.angles]);
        setModalAngleInput("");
        setIsModalOpen(true);
    };

    const handleSaveModal = async () => {
        if (!modalName.trim()) return;

        const body = {
            name: modalName.trim(),
            difficulty: modalDifficulty,
            cameraAngles: modalAngles,
        };

        try {
            if (editingCategory) {
                await updateSwingCategory({
                    id: editingCategory.id,
                    body,
                }).unwrap();
                message.success("Swing category updated successfully.");
            } else {
                await createSwingCategory(body).unwrap();
                message.success("Swing category created successfully.");
            }
            setIsModalOpen(false);
        } catch (error) {
            message.error(getErrorMessage(error, "Unable to save swing category."));
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteSwingCategory(id).unwrap();
                setCategories(categories.filter(c => c.id !== id));
                message.success("Swing category deleted successfully.");
            } catch (error) {
                message.error(getErrorMessage(error, "Unable to delete swing category."));
            }
        }
    };

    const handleAddModalAngle = () => {
        if (modalAngleInput.trim() && !modalAngles.includes(modalAngleInput.trim())) {
            setModalAngles([...modalAngles, modalAngleInput.trim()]);
            setModalAngleInput("");
        }
    };

    const handleRemoveModalAngle = (angle: string) => {
        setModalAngles(modalAngles.filter(a => a !== angle));
    };

    const handleInlineAddAngle = async (id: string) => {
        const cameraAngle = inlineAngleInput.trim();
        if (!cameraAngle) return;

        try {
            await addSwingCategoryAngle({ id, cameraAngle }).unwrap();
            setCategories(categories.map(c =>
                c.id === id && !c.angles.includes(cameraAngle)
                    ? { ...c, angles: [...c.angles, cameraAngle] }
                    : c
            ));
            setAddingAngleToId(null);
            setInlineAngleInput("");
            message.success("Camera angle added.");
        } catch (error) {
            message.error(getErrorMessage(error, "Unable to add camera angle."));
        }
    };

    const handleRemoveInlineAngle = async (categoryId: string, angleToRemove: string) => {
        try {
            await removeSwingCategoryAngle({
                id: categoryId,
                angle: angleToRemove,
            }).unwrap();
            setCategories(categories.map(c => {
                if (c.id === categoryId) {
                    return { ...c, angles: c.angles.filter(a => a !== angleToRemove) }
                }
                return c;
            }));
            message.success("Camera angle removed.");
        } catch (error) {
            message.error(getErrorMessage(error, "Unable to remove camera angle."));
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Swing Categories</h1>
                    <p className="mt-1 text-gray-500 text-sm">Manage swing types, camera angles, and difficulty levels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </button>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoadingCategories && (
                    <div className="lg:col-span-2 py-12 text-center text-sm font-medium text-gray-500">
                        Loading swing categories...
                    </div>
                )}
                {categories.map(category => (
                    <div key={category.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group">
                        <div className="absolute top-6 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-gray-400 hover:text-gray-600">
                            <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="pl-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                                    <div className="flex items-center mt-2 gap-3">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${category.difficulty === 'Beginner' ? 'bg-green-50 text-green-700' : category.difficulty === 'Intermediate' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                            {category.difficulty}
                                        </span>
                                        <span className="text-sm font-medium text-gray-500 flex items-center">
                                            <Camera className="w-4 h-4 mr-1" />
                                            {category.videos.toLocaleString()} Videos
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(category)} className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors bg-gray-50 rounded-lg hover:bg-[var(--color-primary)]/10 cursor-pointer">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        disabled={isDeleting}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-lg hover:bg-red-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    Supported Camera Angles
                                </h4>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {category.angles.map((angle, idx) => (
                                        <div key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center group/angle">
                                            <span>{angle}</span>
                                            <button
                                                onClick={() => handleRemoveInlineAngle(category.id, angle)}
                                                disabled={isRemovingAngle}
                                                className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/angle:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}

                                    {addingAngleToId === category.id ? (
                                        <div className="flex items-center gap-1">
                                            <Input
                                                autoFocus
                                                value={inlineAngleInput}
                                                onChange={(e) => setInlineAngleInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleInlineAddAngle(category.id)}
                                                className="py-1 border-gray-200 rounded-lg text-sm w-32"
                                                placeholder="New Angle"
                                            />
                                            <button
                                                onClick={() => handleInlineAddAngle(category.id)}
                                                disabled={isAddingAngle}
                                                className="p-1.5 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setAddingAngleToId(null)}
                                                className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setAddingAngleToId(category.id); setInlineAngleInput(""); }}
                                            className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 rounded-lg text-sm font-medium flex items-center hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4 mr-1" /> Add Angle
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Custom Category Card */}
                {/* <button onClick={openAddModal} className="bg-gray-50/50 p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all min-h-[250px] group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-gray-100">
                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                    </div>
                    <span className="font-semibold text-gray-700">Create Custom Category</span>
                    <p className="text-sm text-gray-500 mt-1">Add a new swing type to the library</p>
                </button> */}
            </div>

            {categoryMeta.totalPage > 1 && (
                <div className="flex justify-end">
                    <Pagination
                        current={categoryMeta.currentPage ?? page}
                        pageSize={categoryMeta.limit ?? pageSize}
                        total={categoryMeta.totalResult ?? 0}
                        showSizeChanger={false}
                        onChange={(nextPage) => setPage(nextPage)}
                    />
                </div>
            )}

            {/* Global Settings */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Settings2 className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                        Global Settings
                    </h3>
                    <button className="text-[var(--color-primary)] text-sm font-semibold hover:underline cursor-pointer">Edit</button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Default Camera Angle</p>
                        <p className="font-bold text-gray-900">Face On</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Max Video Length</p>
                        <p className="font-bold text-gray-900">10 Seconds</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Supported Formats</p>
                        <p className="font-bold text-gray-900">MP4, MOV</p>
                    </div>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? 'Edit Swing Category' : 'Add New Category'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                                <Input
                                    value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    placeholder="e.g. Driver"
                                    className="py-2 rounded-xl border-gray-200 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty Level</label>
                                <Select
                                    value={modalDifficulty}
                                    onChange={(value) => setModalDifficulty(value)}
                                    className="w-full h-10"
                                    options={[
                                        { value: 'Beginner', label: 'Beginner' },
                                        { value: 'Intermediate', label: 'Intermediate' },
                                        { value: 'Advanced', label: 'Advanced' },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Camera Angles</label>
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        value={modalAngleInput}
                                        onChange={(e) => setModalAngleInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddModalAngle())}
                                        placeholder="Add new angle (e.g. Face On)"
                                        className="py-2 rounded-xl border-gray-200 text-sm"
                                    />
                                    <button
                                        onClick={handleAddModalAngle}
                                        type="button"
                                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 text-sm cursor-pointer"
                                    >
                                        Add
                                    </button>
                                </div>

                                {modalAngles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        {modalAngles.map((angle, idx) => (
                                            <div key={idx} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center group/modalangle">
                                                {angle}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveModalAngle(angle)}
                                                    className="ml-2 text-gray-400 hover:text-red-500 opacity-50 group-hover/modalangle:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveModal}
                                disabled={!modalName.trim() || isCreating || isUpdating}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                {isCreating || isUpdating
                                    ? "Saving..."
                                    : editingCategory
                                        ? "Save Changes"
                                        : "Create Category"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}