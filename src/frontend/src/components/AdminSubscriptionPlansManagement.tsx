// @ts-nocheck
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SubscriptionPlan } from "../backend";
import {
  useCreateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useGetAllSubscriptionPlans,
  useUpdateSubscriptionPlan,
} from "../hooks/useQueries";

export default function AdminSubscriptionPlansManagement() {
  const { data: plans = [], isLoading } = useGetAllSubscriptionPlans();
  const createPlan = useCreateSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();
  const deletePlan = useDeleteSubscriptionPlan();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  const [formData, setFormData] = useState({
    planName: "",
    pricePerYear: "",
    benefits: "",
    redirectUrl: "",
  });

  const resetForm = () => {
    setFormData({
      planName: "",
      pricePerYear: "",
      benefits: "",
      redirectUrl: "",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.planName ||
      !formData.pricePerYear ||
      !formData.benefits ||
      !formData.redirectUrl
    ) {
      toast.error("All fields are required");
      return;
    }

    const benefitsArray = formData.benefits
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (benefitsArray.length === 0) {
      toast.error("Please add at least one benefit");
      return;
    }

    const plan: SubscriptionPlan = {
      planName: formData.planName,
      pricePerYear: BigInt(formData.pricePerYear),
      benefits: benefitsArray,
      redirectUrl: formData.redirectUrl,
    };

    try {
      await createPlan.mutateAsync(plan);
      toast.success("Subscription plan created successfully");
      setShowCreateForm(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to create subscription plan");
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      pricePerYear: plan.pricePerYear.toString(),
      benefits: plan.benefits.join("\n"),
      redirectUrl: plan.redirectUrl,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.planName ||
      !formData.pricePerYear ||
      !formData.benefits ||
      !formData.redirectUrl
    ) {
      toast.error("All fields are required");
      return;
    }

    const benefitsArray = formData.benefits
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (benefitsArray.length === 0) {
      toast.error("Please add at least one benefit");
      return;
    }

    const plan: SubscriptionPlan = {
      planName: formData.planName,
      pricePerYear: BigInt(formData.pricePerYear),
      benefits: benefitsArray,
      redirectUrl: formData.redirectUrl,
    };

    try {
      await updatePlan.mutateAsync(plan);
      toast.success("Subscription plan updated successfully");
      setEditingPlan(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to update subscription plan");
    }
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;

    try {
      await deletePlan.mutateAsync(deletingPlan.planName);
      toast.success("Subscription plan deleted successfully");
      setDeletingPlan(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete subscription plan");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">
          Loading subscription plans...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription Plans Management</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No subscription plans created yet
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.planName} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.planName}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(plan)}
                      disabled={updatePlan.isPending}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingPlan(plan)}
                      disabled={deletePlan.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">
                    ₹{plan.pricePerYear.toString()}
                  </p>
                  <p className="text-sm text-muted-foreground">per year</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    {plan.benefits.map((benefit, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: benefits are plain strings with no stable id
                      <li key={index} className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground break-all">
                    Redirect: {plan.redirectUrl}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Subscription Plan</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new subscription plan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="create-planName">Plan Name *</Label>
              <Input
                id="create-planName"
                value={formData.planName}
                onChange={(e) =>
                  setFormData({ ...formData, planName: e.target.value })
                }
                placeholder="e.g., Pro Plan"
                required
              />
            </div>
            <div>
              <Label htmlFor="create-pricePerYear">Price Per Year (₹) *</Label>
              <Input
                id="create-pricePerYear"
                type="number"
                value={formData.pricePerYear}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerYear: e.target.value })
                }
                placeholder="e.g., 2400"
                required
              />
            </div>
            <div>
              <Label htmlFor="create-benefits">Benefits (one per line) *</Label>
              <Textarea
                id="create-benefits"
                value={formData.benefits}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: e.target.value })
                }
                placeholder="Priority support&#10;Advanced analytics&#10;Custom branding"
                rows={6}
                required
              />
            </div>
            <div>
              <Label htmlFor="create-redirectUrl">Redirect URL *</Label>
              <Input
                id="create-redirectUrl"
                type="url"
                value={formData.redirectUrl}
                onChange={(e) =>
                  setFormData({ ...formData, redirectUrl: e.target.value })
                }
                placeholder="https://example.com/subscribe"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPlan.isPending}>
                {createPlan.isPending ? "Creating..." : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPlan}
        onOpenChange={(open) => !open && setEditingPlan(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-planName">Plan Name *</Label>
              <Input
                id="edit-planName"
                value={formData.planName}
                onChange={(e) =>
                  setFormData({ ...formData, planName: e.target.value })
                }
                placeholder="e.g., Pro Plan"
                required
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Plan name cannot be changed
              </p>
            </div>
            <div>
              <Label htmlFor="edit-pricePerYear">Price Per Year (₹) *</Label>
              <Input
                id="edit-pricePerYear"
                type="number"
                value={formData.pricePerYear}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerYear: e.target.value })
                }
                placeholder="e.g., 2400"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-benefits">Benefits (one per line) *</Label>
              <Textarea
                id="edit-benefits"
                value={formData.benefits}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: e.target.value })
                }
                placeholder="Priority support&#10;Advanced analytics&#10;Custom branding"
                rows={6}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-redirectUrl">Redirect URL *</Label>
              <Input
                id="edit-redirectUrl"
                type="url"
                value={formData.redirectUrl}
                onChange={(e) =>
                  setFormData({ ...formData, redirectUrl: e.target.value })
                }
                placeholder="https://example.com/subscribe"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingPlan(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePlan.isPending}>
                {updatePlan.isPending ? "Updating..." : "Update Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingPlan}
        onOpenChange={(open) => !open && setDeletingPlan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{deletingPlan?.planName}"
              subscription plan? This action cannot be undone. Users who are
              currently subscribed to this plan will keep their subscriptions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePlan.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePlan.isPending ? "Deleting..." : "Delete Plan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
