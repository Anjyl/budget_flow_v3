import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

const ICON_OPTIONS = [
  "utensils",
  "car",
  "lightbulb",
  "gamepad2",
  "heart",
  "home",
  "shopping-cart",
  "plane",
  "book",
  "music",
  "tag",
];

const COLOR_OPTIONS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B88B",
  "#52C9B0",
];

export default function Categories() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: COLOR_OPTIONS[0],
    icon: ICON_OPTIONS[0],
  });

  const { data: categories = [], refetch: refetchCategories } = { data: [], refetch: () => {} }; // Mock

  const createMutation = { mutate: () => {}, isPending: false }; // Mock
  const updateMutation = { mutate: () => {}, isPending: false }; // Mock
  const deleteMutation = { mutate: () => {}, isPending: false }; // Mock

  const resetForm = () => {
    setFormData({
      name: "",
      color: COLOR_OPTIONS[0],
      icon: ICON_OPTIONS[0],
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter a category name");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setEditingId(category.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </div>

        {/* Category Form */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Category" : "New Category"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Food, Transport, Utilities"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-full h-10 rounded-lg border-2 transition-all ${
                            formData.color === color ? "border-black" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={`p-2 rounded-lg border-2 transition-all text-sm ${
                            formData.icon === icon
                              ? "border-black bg-muted"
                              : "border-transparent hover:bg-muted"
                          }`}
                          onClick={() => setFormData({ ...formData, icon })}
                          title={icon}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Update" : "Create"} Category
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No categories yet. Create one to organize your transactions!</p>
            </div>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.icon}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
