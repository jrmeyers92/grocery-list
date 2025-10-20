"use client";

import {
  addCustomItem,
  removeCustomItem,
} from "@/actions/shopping-list/customItems";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecipeWithIngredients } from "@/types/database.types";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface ShoppingListRecipe {
  recipe: RecipeWithIngredients;
  serving_multiplier: number;
}

interface CustomItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  aisle: string;
  notes: string | null;
}

interface GroceryListProps {
  recipes: ShoppingListRecipe[];
  customItems?: CustomItem[];
}

interface CombinedIngredient {
  name: string;
  totalQuantity: number;
  unit: string;
  aisle: string;
  notes: string[];
  isCustom?: boolean;
  id?: string;
}

interface RecipeIngredient {
  name_raw: string;
  quantity: number;
  unit: string;
  aisle: string | null;
  notes: string | null;
}

const AISLES = [
  { value: "produce", label: "Produce" },
  { value: "meat", label: "Meat" },
  { value: "seafood", label: "Seafood" },
  { value: "dairy", label: "Dairy" },
  { value: "bakery", label: "Bakery" },
  { value: "canned", label: "Canned" },
  { value: "dry_goods", label: "Dry Goods" },
  { value: "frozen", label: "Frozen" },
  { value: "spices", label: "Spices" },
  { value: "baking", label: "Baking" },
  { value: "beverages", label: "Beverages" },
  { value: "other", label: "Other" },
];

const UNITS = [
  "unit",
  "tsp",
  "tbsp",
  "cup",
  "ml",
  "l",
  "g",
  "kg",
  "oz",
  "lb",
  "pinch",
  "dash",
];

export default function GroceryList({
  recipes,
  customItems = [],
}: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "1",
    unit: "unit",
    aisle: "other",
  });

  const toggleIngredient = (key: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleAddCustomItem = async () => {
    if (!newItem.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    setIsAdding(true);
    try {
      const result = await addCustomItem({
        name: newItem.name,
        quantity: parseFloat(newItem.quantity) || 1,
        unit: newItem.unit,
        aisle: newItem.aisle,
      });

      if (!result.success) {
        toast.error("Error", { description: result.error });
      } else {
        toast.success("Added to list", {
          description: `${newItem.name} has been added`,
        });
        setNewItem({ name: "", quantity: "1", unit: "unit", aisle: "other" });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", { description: "Failed to add item" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCustomItem = async (id: string, name: string) => {
    try {
      const result = await removeCustomItem(id);

      if (!result.success) {
        toast.error("Error", { description: result.error });
      } else {
        toast.success("Removed", {
          description: `${name} removed from list`,
        });
        // Remove from checked items if it was checked
        setCheckedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", { description: "Failed to remove item" });
    }
  };

  const combinedIngredients = useMemo(() => {
    const ingredientMap = new Map<string, CombinedIngredient>();

    // Add recipe ingredients
    recipes.forEach((item) => {
      const recipe = item.recipe;
      const multiplier = item.serving_multiplier || 1;

      recipe.grocerylist_recipe_ingredients?.forEach(
        (ing: RecipeIngredient) => {
          const key = `${ing.name_raw.toLowerCase()}-${ing.unit}`;
          const existing = ingredientMap.get(key);

          if (existing) {
            existing.totalQuantity += ing.quantity * multiplier;
            if (ing.notes && !existing.notes.includes(ing.notes)) {
              existing.notes.push(ing.notes);
            }
          } else {
            ingredientMap.set(key, {
              name: ing.name_raw,
              totalQuantity: ing.quantity * multiplier,
              unit: ing.unit,
              aisle: ing.aisle || "other",
              notes: ing.notes ? [ing.notes] : [],
            });
          }
        }
      );
    });

    // Add custom items
    customItems.forEach((item) => {
      ingredientMap.set(item.id, {
        id: item.id,
        name: item.name,
        totalQuantity: item.quantity,
        unit: item.unit,
        aisle: item.aisle,
        notes: item.notes ? [item.notes] : [],
        isCustom: true,
      });
    });

    // Group by aisle
    const byAisle: Record<string, CombinedIngredient[]> = {};
    ingredientMap.forEach((ingredient) => {
      if (!byAisle[ingredient.aisle]) {
        byAisle[ingredient.aisle] = [];
      }
      byAisle[ingredient.aisle].push(ingredient);
    });

    // Sort aisles and ingredients
    const sortedAisles = Object.keys(byAisle).sort();
    sortedAisles.forEach((aisle) => {
      byAisle[aisle].sort((a, b) => a.name.localeCompare(b.name));
    });

    return byAisle;
  }, [recipes, customItems]);

  const totalItems = useMemo(() => {
    return Object.values(combinedIngredients).reduce(
      (sum, items) => sum + items.length,
      0
    );
  }, [combinedIngredients]);

  const checkedCount = checkedItems.size;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Grocery List</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">
              {checkedCount}/{totalItems}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAddForm && (
          <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
            <Input
              placeholder="Item name (e.g., Chips)"
              value={newItem.name}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, name: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isAdding) {
                  handleAddCustomItem();
                }
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, quantity: e.target.value }))
                }
                step="0.5"
                min="0"
              />
              <Select
                value={newItem.unit}
                onValueChange={(value) =>
                  setNewItem((prev) => ({ ...prev, unit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select
              value={newItem.aisle}
              onValueChange={(value) =>
                setNewItem((prev) => ({ ...prev, aisle: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AISLES.map((aisle) => (
                  <SelectItem key={aisle.value} value={aisle.value}>
                    {aisle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={handleAddCustomItem}
                className="flex-1"
                disabled={isAdding}
              >
                {isAdding ? "Adding..." : "Add Item"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {Object.keys(combinedIngredients).length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Add recipes to see your grocery list
          </p>
        ) : (
          Object.entries(combinedIngredients).map(([aisle, ingredients]) => (
            <div key={aisle}>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3 sticky top-0 bg-background">
                {aisle.replace("_", " ")}
              </h3>
              <div className="space-y-2">
                {ingredients.map((ingredient) => {
                  const key =
                    ingredient.id ||
                    `${aisle}-${ingredient.name}-${ingredient.unit}`;
                  const isChecked = checkedItems.has(key);

                  return (
                    <div key={key} className="flex items-start space-x-3 group">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleIngredient(key)}
                        className="mt-1"
                      />
                      <label
                        className={`text-sm flex-1 cursor-pointer transition-all ${
                          isChecked ? "line-through text-muted-foreground" : ""
                        }`}
                        onClick={() => toggleIngredient(key)}
                      >
                        <span className="font-medium">
                          {ingredient.totalQuantity % 1 === 0
                            ? ingredient.totalQuantity
                            : ingredient.totalQuantity.toFixed(2)}{" "}
                          {ingredient.unit}
                        </span>{" "}
                        {ingredient.name}
                        {ingredient.notes.length > 0 && (
                          <span className="text-muted-foreground">
                            {" "}
                            ({ingredient.notes.join(", ")})
                          </span>
                        )}
                      </label>
                      {ingredient.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            handleRemoveCustomItem(
                              ingredient.id!,
                              ingredient.name
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
