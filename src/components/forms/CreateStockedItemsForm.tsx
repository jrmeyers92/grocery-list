"use client";

import { createStockedItem } from "@/actions/stocked-items/create-stocked-item";
import { deleteStockedItem } from "@/actions/stocked-items/delete-stocked-items";
import { getStockedItems } from "@/actions/stocked-items/get-stocked-items";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INGREDIENT_AISLES } from "@/types/constants";
import { Enums } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Package, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schema matching your database
const stockedItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(255),
  aisle: z.enum(INGREDIENT_AISLES),
  always_stocked: z.boolean(), // Remove .default(true) here
  notes: z.string().max(500).optional().nullable(),
});

type StockedItemInput = z.infer<typeof stockedItemSchema>;

interface StockedItem {
  id: string;
  owner_id: string;
  name: string;
  aisle: (typeof INGREDIENT_AISLES)[number];
  always_stocked: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function StockedItemsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stockedItems, setStockedItems] = useState<StockedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAisle, setFilterAisle] = useState<string>("all");

  const form = useForm<StockedItemInput>({
    resolver: zodResolver(stockedItemSchema),
    defaultValues: {
      name: "",
      aisle: "other",
      always_stocked: true, // This stays
      notes: "",
    },
  });

  // Load stocked items on mount
  useEffect(() => {
    loadStockedItems();
  }, []);

  const loadStockedItems = async () => {
    try {
      setIsLoading(true);
      const result = await getStockedItems();
      if (result.success) {
        setStockedItems(result.data);
      } else {
        setStockedItems([]); // Only clear on error
        toast.error("Error", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error loading stocked items:", error);
      toast.error("Error", {
        description: "Failed to load stocked items",
      });
      setStockedItems([]); // Also clear on exception
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: StockedItemInput) => {
    setIsSubmitting(true);
    try {
      const result = await createStockedItem(data);

      if (!result.success) {
        toast.error("Error", {
          description: result.error,
        });
        return;
      }

      await loadStockedItems();

      toast.success("Success", {
        description: "Stocked item added successfully!",
      });

      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteStockedItem(id);

      if (!result.success) {
        toast.error("Error", {
          description: result.error,
        });
        return;
      }

      await loadStockedItems();

      toast.success("Success", {
        description: "Item removed from stocked list",
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to remove item",
      });
    }
  };

  const filteredItems = stockedItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesAisle = filterAisle === "all" || item.aisle === filterAisle;
    return matchesSearch && matchesAisle;
  });

  const quickAddItems: Array<{
    name: string;
    aisle: Enums<"ingredient_aisles">;
  }> = [
    { name: "Olive Oil", aisle: "baking" },
    { name: "Salt", aisle: "spices" },
    { name: "Black Pepper", aisle: "spices" },
    { name: "Garlic Powder", aisle: "spices" },
    { name: "Onion Powder", aisle: "spices" },
    { name: "Paprika", aisle: "spices" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Stocked Items</h1>
        </div>
        <p className="text-muted-foreground">
          Manage items you always have in stock. These won&apos;t appear in your
          shopping lists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add New Stocked Item Form */}
        <div className="space-y-6">
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">Add Stocked Item</h2>

            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Olive Oil, Salt, Butter..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aisle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aisle *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select aisle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INGREDIENT_AISLES.map((aisle) => (
                            <SelectItem key={aisle} value={aisle}>
                              {aisle.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Extra virgin, unsalted, organic..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional details about this item
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="always_stocked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Always Stocked</FormLabel>
                        <FormDescription>
                          I always keep this item in my pantry
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </div>

          {/* Quick Add Common Items */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-3">
              Quick Add Common Items
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickAddItems.map((item) => (
                <Button
                  key={item.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.setValue("name", item.name);
                    form.setValue("aisle", item.aisle);
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Stocked Items List */}
        <div className="space-y-6">
          <div className="p-6 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Your Stocked Items ({filteredItems.length})
              </h2>
            </div>

            {/* Search and Filter */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterAisle} onValueChange={setFilterAisle}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by aisle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Aisles</SelectItem>
                  {INGREDIENT_AISLES.map((aisle) => (
                    <SelectItem key={aisle} value={aisle}>
                      {aisle.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-medium">No stocked items found</p>
                  <p className="text-xs mt-1">
                    {searchQuery || filterAisle !== "all"
                      ? "Try adjusting your filters"
                      : "Add your first stocked item to get started"}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-secondary rounded whitespace-nowrap">
                          {item.aisle.replace("_", " ")}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground truncate">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="ml-2 flex shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="p-6 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              How it works
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>
                • Items marked as stocked won&apos;t appear in shopping lists
              </li>
              <li>• Perfect for pantry staples, spices, and oils</li>
              <li>• Update your list anytime as your stock changes</li>
              <li>• Automatically filters ingredients across all recipes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
