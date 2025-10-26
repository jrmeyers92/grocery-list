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
import { INGREDIENT_AISLES, INGREDIENT_UNITS } from "@/types/constants";
import { Ingredient, RecipeWithIngredients } from "@/types/database.types";
import { Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ShoppingListRecipe {
  id: string;
  recipe: RecipeWithIngredients;
  serving_multiplier: number;
  added_at: string;
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
  listId: string;
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

export default function GroceryList({
  listId,
  recipes,
  customItems = [],
}: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "1",
    unit: "unit",
    aisle: "other",
  });

  // Load checked and hidden items from localStorage after mount
  useEffect(() => {
    try {
      const storedChecked = localStorage.getItem(`checkedItems-${listId}`);
      if (storedChecked) {
        const parsed = JSON.parse(storedChecked) as string[];
        setCheckedItems(new Set(parsed));
      }

      const storedHidden = localStorage.getItem(`hiddenItems-${listId}`);
      if (storedHidden) {
        const parsed = JSON.parse(storedHidden) as string[];
        setHiddenItems(new Set(parsed));
      }
    } catch (error) {
      console.error("Error loading items:", error);
    }
  }, [listId]);

  // Save checked items to localStorage whenever they change
  const toggleIngredient = (key: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }

      try {
        localStorage.setItem(
          `checkedItems-${listId}`,
          JSON.stringify(Array.from(newSet))
        );
      } catch (error) {
        console.error("Error saving checked items:", error);
      }

      return newSet;
    });
  };

  const handleHideIngredient = (key: string, name: string) => {
    setHiddenItems((prev) => {
      const newSet = new Set(prev);
      newSet.add(key);

      try {
        localStorage.setItem(
          `hiddenItems-${listId}`,
          JSON.stringify(Array.from(newSet))
        );
      } catch (error) {
        console.error("Error saving hidden items:", error);
      }

      return newSet;
    });

    toast.success("Removed from list", {
      description: `${name} - you already have this`,
    });
  };

  const handleRestoreIngredient = (key: string, name: string) => {
    setHiddenItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);

      try {
        localStorage.setItem(
          `hiddenItems-${listId}`,
          JSON.stringify(Array.from(newSet))
        );
      } catch (error) {
        console.error("Error saving hidden items:", error);
      }

      return newSet;
    });

    toast.success("Added back", {
      description: `${name} restored to shopping list`,
    });
  };

  const handleRestoreAll = () => {
    setHiddenItems(new Set());
    try {
      localStorage.removeItem(`hiddenItems-${listId}`);
      toast.success("All items restored to shopping list");
    } catch (error) {
      console.error("Error clearing hidden items:", error);
    }
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

      recipe.grocerylist_recipe_ingredients?.forEach((ing: Ingredient) => {
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
      });
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

  const { visibleIngredients, hiddenIngredientsList } = useMemo(() => {
    const visible: Record<string, CombinedIngredient[]> = {};
    const hidden: CombinedIngredient[] = [];

    Object.entries(combinedIngredients).forEach(([aisle, ingredients]) => {
      ingredients.forEach((ingredient) => {
        const key =
          ingredient.id || `${aisle}-${ingredient.name}-${ingredient.unit}`;

        if (hiddenItems.has(key)) {
          hidden.push({ ...ingredient, aisle });
        } else {
          if (!visible[aisle]) {
            visible[aisle] = [];
          }
          visible[aisle].push(ingredient);
        }
      });
    });

    return { visibleIngredients: visible, hiddenIngredientsList: hidden };
  }, [combinedIngredients, hiddenItems]);

  const totalItems = useMemo(() => {
    return Object.values(combinedIngredients).reduce(
      (sum, items) => sum + items.length,
      0
    );
  }, [combinedIngredients]);

  const visibleItemsCount = totalItems - hiddenItems.size;
  const checkedCount = checkedItems.size;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Grocery List</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">
              {checkedCount}/{visibleItemsCount}
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
                  {INGREDIENT_UNITS.map((unit) => (
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
                {INGREDIENT_AISLES.map((aisle) => (
                  <SelectItem key={aisle} value={aisle.toUpperCase()}>
                    {aisle.toUpperCase()}
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

        {Object.keys(visibleIngredients).length === 0 &&
        hiddenIngredientsList.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Add recipes to see your grocery list
          </p>
        ) : (
          <>
            {/* Active Shopping List */}
            {Object.entries(visibleIngredients).map(([aisle, ingredients]) => {
              if (ingredients.length === 0) return null;

              return (
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
                        <div
                          key={key}
                          className="flex items-start space-x-3 group"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleIngredient(key)}
                            className="mt-1"
                          />
                          <label
                            className={`text-sm flex-1 cursor-pointer transition-all ${
                              isChecked
                                ? "line-through text-muted-foreground"
                                : ""
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() =>
                              ingredient.isCustom
                                ? handleRemoveCustomItem(
                                    ingredient.id!,
                                    ingredient.name
                                  )
                                : handleHideIngredient(key, ingredient.name)
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Items You Already Have */}
            {hiddenIngredientsList.length > 0 && (
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                    Items You Already Have ({hiddenIngredientsList.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleRestoreAll}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restore All
                  </Button>
                </div>
                <div className="space-y-2">
                  {hiddenIngredientsList.map((ingredient) => {
                    const key =
                      ingredient.id ||
                      `${ingredient.aisle}-${ingredient.name}-${ingredient.unit}`;

                    return (
                      <div
                        key={key}
                        className="flex items-start space-x-3 opacity-40 group hover:opacity-60 transition-opacity"
                      >
                        <div className="w-4 mt-1" />
                        <label className="text-sm flex-1 line-through text-muted-foreground">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            handleRestoreIngredient(key, ingredient.name)
                          }
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
