"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";

interface GroceryListProps {
  recipes: any[];
}

interface CombinedIngredient {
  name: string;
  totalQuantity: number;
  unit: string;
  aisle: string;
  notes: string[];
}

export default function GroceryList({ recipes }: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

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

  // Combine ingredients from all recipes
  const combinedIngredients = useMemo(() => {
    const ingredientMap = new Map<string, CombinedIngredient>();

    recipes.forEach((item) => {
      const recipe = item.recipe;
      const multiplier = item.serving_multiplier || 1;

      recipe.grocerylist_recipe_ingredients?.forEach((ing: any) => {
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
  }, [recipes]);

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
          <span className="text-sm font-normal text-muted-foreground">
            {checkedCount}/{totalItems}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                  const key = `${aisle}-${ingredient.name}-${ingredient.unit}`;
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
