import React, { useEffect, useState } from "react";
import {
  Plus,
  Check,
  Edit2,
  Trash2,
  Star,
  X,
  Sparkles,
  Zap,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Input, Modal, Select, Switch, message } from "antd";
import {
  useCreatePlanMutation,
  useDeletePlanMutation,
  useGetPlansQuery,
  useUpdatePlanMutation,
  type PlanBillingInterval,
  type PlanPayload,
  type PlanType,
} from "../../../redux/features/plan/index.js";

type BillingCycle = "Free" | "Monthly" | "Quarterly" | "Yearly";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string; // Display period (e.g. "/month", "/year", "forever", etc.)
  billingCycle: BillingCycle;
  description: string;
  features: string[];
  isBestValue: boolean;
  isActive: boolean;
  tags: string[];
  planType: PlanType;
}

const DEFAULT_PLANS: Plan[] = [];

const getErrorMessage = (error: unknown, fallback: string) =>
  (error as any)?.data?.message ?? fallback;

const getBillingCycle = (plan: any, tags: string[]): BillingCycle => {
  const savedCycle = tags
    .find((tag) => tag.startsWith("billing-cycle:"))
    ?.split(":")[1] as BillingCycle | undefined;
  if (savedCycle) return savedCycle;
  if (Number(plan.price) === 0) return "Free";
  return plan.billingInterval === "yearly" ? "Yearly" : "Monthly";
};

const getPeriod = (cycle: BillingCycle) =>
  cycle === "Free"
    ? "forever"
    : cycle === "Monthly"
      ? "month"
      : cycle === "Quarterly"
        ? "quarter"
        : "year";

const inferPlanType = (name: string, cycle: BillingCycle): PlanType => {
  const normalizedName = name.toLowerCase();
  if (cycle === "Free") return "trial";
  if (normalizedName.includes("elite")) return "elite";
  if (normalizedName.includes("pro")) return "pro";
  return "standard";
};

const getPlanTags = (
  currentTags: string[],
  cycle: BillingCycle,
  isBestValue: boolean,
  isActive: boolean,
) => {
  const tags = currentTags.filter(
    (tag) =>
      tag !== "best-value" &&
      tag !== "inactive" &&
      !tag.startsWith("billing-cycle:"),
  );
  tags.push(`billing-cycle:${cycle}`);
  if (isBestValue) tags.push("best-value");
  if (!isActive) tags.push("inactive");
  return tags;
};

// Helper to get matching premium card icon based on plan name/billing cycle
const getPlanIcon = (name: string, cycle: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("pro") || lowerName.includes("yearly")) {
    return <Sparkles className="w-6 h-6 text-[var(--color-secondary)]" />;
  }
  if (lowerName.includes("premium") || lowerName.includes("monthly")) {
    return <Zap className="w-6 h-6 text-blue-500" />;
  }
  return <Shield className="w-6 h-6 text-gray-500" />;
};

export default function Subscriptions() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);

  const { data: plansResponse, isLoading: isLoadingPlans } = useGetPlansQuery({
    page: 1,
    limit: 100,
    sort: "-createdAt",
  });
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

  // Modal State for Add/Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formBillingCycle, setFormBillingCycle] =
    useState<BillingCycle>("Monthly");
  const [formDescription, setFormDescription] = useState("");
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [formIsBestValue, setFormIsBestValue] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  useEffect(() => {
    const apiPlans = plansResponse?.data ?? plansResponse;
    if (!Array.isArray(apiPlans)) return;
    setPlans(
      apiPlans.map((plan: any) => {
        const tags: string[] = plan.tags ?? [];
        const billingCycle = getBillingCycle(plan, tags);
        return {
          id: String(plan._id),
          name: plan.name ?? "Unnamed Plan",
          price: String(plan.price ?? 0),
          period: getPeriod(billingCycle),
          billingCycle,
          description: plan.description ?? "",
          features: (plan.features ?? [])
            .filter((feature: any) => feature.included !== false)
            .map((feature: any) => feature.label),
          isBestValue: tags.includes("best-value"),
          isActive: !tags.includes("inactive"),
          tags,
          planType: plan.planType ?? "standard",
        };
      }),
    );
  }, [plansResponse]);

  // Handle Open Create Modal
  const openCreateModal = () => {
    setEditingPlan(null);
    setFormName("");
    setFormPrice("");
    setFormBillingCycle("Monthly");
    setFormDescription("");
    setFormFeatures(["Advanced AI Analysis"]);
    setNewFeatureInput("");
    setFormIsBestValue(false);
    setFormIsActive(true);
    setIsFormModalOpen(true);
  };

  // Handle Open Edit Modal
  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormPrice(plan.price);
    setFormBillingCycle(plan.billingCycle);
    setFormDescription(plan.description);
    setFormFeatures([...plan.features]);
    setNewFeatureInput("");
    setFormIsBestValue(plan.isBestValue);
    setFormIsActive(plan.isActive);
    setIsFormModalOpen(true);
  };

  // Save Create/Edit Modal
  const handleSavePlan = async () => {
    if (!formName.trim() || !formPrice.trim()) return;

    const periodString =
      formBillingCycle === "Free"
        ? "forever"
        : formBillingCycle === "Monthly"
          ? "month"
          : formBillingCycle === "Quarterly"
            ? "quarter"
            : "year";

    const updatedPlanData = {
      name: formName.trim(),
      price: formPrice.trim(),
      period: periodString,
      billingCycle: formBillingCycle,
      description: formDescription.trim(),
      features: formFeatures.filter((f) => f.trim() !== ""),
      isBestValue: formIsBestValue,
      isActive: formIsActive,
    };

    const billingInterval: PlanBillingInterval =
      formBillingCycle === "Yearly" ? "yearly" : "monthly";
    const tags = getPlanTags(
      editingPlan?.tags ?? [],
      formBillingCycle,
      formIsBestValue,
      formIsActive,
    );
    const body: PlanPayload = {
      name: formName.trim(),
      planType:
        editingPlan?.planType ?? inferPlanType(formName, formBillingCycle),
      description: formDescription.trim(),
      price: Number(formPrice),
      currency: "USD",
      billingInterval,
      ...(formBillingCycle === "Free" ? { trialDays: 0 } : {}),
      features: formFeatures
        .filter((feature) => feature.trim() !== "")
        .map((label) => ({ label, included: true })),
      tags,
    };

    try {
      let targetId = editingPlan?.id;
      if (editingPlan) {
        await updatePlan({ id: editingPlan.id, body }).unwrap();
      } else {
        const response = await createPlan(body).unwrap();
        targetId = String(response?.data?._id ?? response?._id);
      }

      if (formIsBestValue) {
        await Promise.all(
          plans
            .filter((plan) => plan.id !== targetId && plan.isBestValue)
            .map((plan) =>
              updatePlan({
                id: plan.id,
                body: {
                  tags: plan.tags.filter((tag) => tag !== "best-value"),
                },
              }).unwrap(),
            ),
        );
      }

      if (editingPlan) {
        setPlans(
          plans.map((plan) =>
            plan.id === editingPlan.id
              ? { ...plan, ...updatedPlanData, tags }
              : formIsBestValue
                ? {
                    ...plan,
                    isBestValue: false,
                    tags: plan.tags.filter((tag) => tag !== "best-value"),
                  }
                : plan,
          ),
        );
      }

      setIsFormModalOpen(false);
      message.success(
        editingPlan
          ? "Subscription plan updated successfully."
          : "Subscription plan created successfully.",
      );
    } catch (error) {
      message.error(
        getErrorMessage(error, "Unable to save subscription plan."),
      );
    }
  };

  // Set a plan as Best Value directly from the card
  const handleMarkAsBestValue = async (id: string) => {
    const targetPlan = plans.find((plan) => plan.id === id);
    if (!targetPlan) return;

    try {
      await Promise.all(
        plans
          .filter((plan) => plan.id === id || plan.isBestValue)
          .map((plan) =>
            updatePlan({
              id: plan.id,
              body: {
                tags:
                  plan.id === id
                    ? [
                        ...plan.tags.filter((tag) => tag !== "best-value"),
                        "best-value",
                      ]
                    : plan.tags.filter((tag) => tag !== "best-value"),
              },
            }).unwrap(),
          ),
      );
      setPlans(
        plans.map((plan) => ({
          ...plan,
          isBestValue: plan.id === id,
          tags:
            plan.id === id
              ? [
                  ...plan.tags.filter((tag) => tag !== "best-value"),
                  "best-value",
                ]
              : plan.tags.filter((tag) => tag !== "best-value"),
        })),
      );
      message.success(`${targetPlan.name} marked as best value.`);
    } catch (error) {
      message.error(
        getErrorMessage(error, "Unable to update best value plan."),
      );
    }
  };

  // Open delete confirmation
  const openDeleteConfirmation = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (planToDelete) {
      try {
        await deletePlan(planToDelete.id).unwrap();
        setPlans(plans.filter((p) => p.id !== planToDelete.id));
        setIsDeleteModalOpen(false);
        setPlanToDelete(null);
        message.success("Subscription plan deleted successfully.");
      } catch (error) {
        message.error(
          getErrorMessage(error, "Unable to delete subscription plan."),
        );
      }
    }
  };

  // Add feature dynamically in form modal
  const handleAddFeature = () => {
    if (
      newFeatureInput.trim() &&
      !formFeatures.includes(newFeatureInput.trim())
    ) {
      setFormFeatures([...formFeatures, newFeatureInput.trim()]);
      setNewFeatureInput("");
    }
  };

  // Remove feature dynamically in form modal
  const handleRemoveFeature = (featureToRemove: string) => {
    setFormFeatures(formFeatures.filter((f) => f !== featureToRemove));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Subscription Plans
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Design, manage, and configure SaaS subscription tiers for
            GolfImprove.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-[var(--color-primary)]/10 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 mr-2" />
          Create Plan
        </button>
      </div>

      {/* Plans SaaS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {isLoadingPlans && (
          <div className="md:col-span-2 lg:col-span-3 py-12 text-center text-sm font-medium text-gray-500">
            Loading subscription plans...
          </div>
        )}
        {plans.map((plan) => {
          const isGold = plan.isBestValue;
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-8 flex flex-col h-full border-2 transition-all duration-300 ${
                isGold
                  ? "border-[var(--color-secondary)] shadow-xl shadow-[var(--color-secondary)]/15 scale-[1.03] ring-1 ring-[var(--color-secondary)]/20"
                  : "border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Best Value Gold Badge */}
              {isGold && (
                <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-[var(--color-secondary)] text-white px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center shadow-lg shadow-amber-500/20 border border-amber-300">
                  <Star className="w-3.5 h-3.5 mr-1 fill-white text-white" />
                  Best Value
                </div>
              )}

              {/* Card Top Details */}
              <div className="flex justify-between items-start mb-5">
                <div className="p-3 bg-gray-55 rounded-2xl border border-gray-100">
                  {getPlanIcon(plan.name, plan.billingCycle)}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(plan)}
                    disabled={isUpdating}
                    className="p-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors hover:bg-gray-100 rounded-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteConfirmation(plan)}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Plan Header Info */}
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      plan.isActive
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1.5 min-h-[32px] line-clamp-2">
                  {plan.description || "No description provided."}
                </p>
              </div>

              {/* Plan Price */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {plan.price === "0" || plan.price === ""
                      ? "$0"
                      : `$${plan.price}`}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">
                    /{plan.period}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mt-1">
                  Billing Cycle: {plan.billingCycle}
                </span>
              </div>

              {/* Features List */}
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">
                  Features Included:
                </p>
                <ul className="space-y-3.5">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-gray-600"
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length === 0 && (
                    <li className="text-xs text-gray-400 italic">
                      No features specified
                    </li>
                  )}
                </ul>
              </div>

              {/* Best Value Highlight Action Button */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                {isGold ? (
                  <button
                    disabled
                    className="w-full py-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />⭐ Featured
                    Best Value
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsBestValue(plan.id)}
                    disabled={isUpdating}
                    className="w-full py-3 bg-white border border-slate-200 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-gray-50 rounded-2xl text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mark as Best Value
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Plan Centered Modal */}
      <Modal
        open={isFormModalOpen}
        onCancel={() => setIsFormModalOpen(false)}
        footer={null}
        closable={false}
        width={576}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingPlan
                ? "Edit Subscription Plan"
                : "Create Subscription Plan"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Define your tier, pricing structure, and user entitlements.
            </p>
          </div>
          <button
            onClick={() => setIsFormModalOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Plan Name & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Plan Name
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Yearly Pro"
                className=" h-11 rounded-xl border-gray-200 text-sm shadow-xs focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Price ($)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="e.g. 19.99"
                className=" h-11 rounded-xl border-gray-200 text-sm shadow-xs focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Billing Cycle & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Billing Cycle
              </label>
              <Select
                value={formBillingCycle}
                onChange={(value) => setFormBillingCycle(value)}
                className="w-full h-11"
                options={[
                  { value: "Free", label: "Free" },
                  { value: "Monthly", label: "Monthly" },
                  { value: "Quarterly", label: "Quarterly" },
                  { value: "Yearly", label: "Yearly" },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="flex items-center h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Active Tier
                </span>
                <Switch
                  checked={formIsActive}
                  onChange={(checked) => setFormIsActive(checked)}
                  className="bg-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Short Description
            </label>
            <Input.TextArea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Write a brief pitch or summary for this tier..."
              rows={2}
              className="rounded-xl border-gray-200 text-sm p-3 focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Mark as Best Value */}
          <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Best Value Highlight
                </p>
                <p className="text-xs text-gray-500">
                  Enable to apply gold border, glow, and banner in lists.
                </p>
              </div>
            </div>
            <Switch
              checked={formIsBestValue}
              onChange={(checked) => setFormIsBestValue(checked)}
            />
          </div>

          {/* Dynamic Features List */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Plan Features
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddFeature())
                }
                placeholder="Add a new feature list item..."
                className="py-2.5 rounded-xl border-gray-200 text-sm focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              <button
                onClick={handleAddFeature}
                type="button"
                className="px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 text-sm cursor-pointer transition-colors"
              >
                Add
              </button>
            </div>

            {formFeatures.length > 0 ? (
              <div className="space-y-2 mt-2 p-3 bg-gray-55 rounded-2xl border border-slate-200 max-h-[160px] overflow-y-auto">
                {formFeatures.map((feature, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-white border border-gray-100 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-between group/feature"
                  >
                    <span className="truncate pr-2">{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 italic">
                No features added yet. Add at least one feature.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => setIsFormModalOpen(false)}
            className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePlan}
            disabled={
              !formName.trim() || !formPrice.trim() || isCreating || isUpdating
            }
            className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--color-primary)] rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center cursor-pointer shadow-md shadow-[var(--color-primary)]/10"
          >
            <Check className="w-4 h-4 mr-1.5 stroke-[3]" />
            {isCreating || isUpdating
              ? "Saving..."
              : editingPlan
                ? "Save Changes"
                : "Create Plan"}
          </button>
        </div>
      </Modal>

      {/* Premium Centered Delete Confirmation Dialog */}
      <Modal
        open={isDeleteModalOpen && Boolean(planToDelete)}
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={null}
        closable={false}
        width={448}
      >
        {planToDelete && (
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Delete Subscription Plan?
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-bold text-gray-800">
                "{planToDelete.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200"
              >
                No, Keep it
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Plan"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
