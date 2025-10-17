"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Ingredient } from "@/types/database.types";
import { useState } from "react";

interface RecipeIngredientsProps {
  ingredients: Ingredient[];
}

export default function RecipeIngredients({
  ingredients,
}: RecipeIngredientsProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleIngredient = (id: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Group ingredients by aisle
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const aisle = ingredient.aisle || "other";
    if (!acc[aisle]) {
      acc[aisle] = [];
    }
    acc[aisle].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Ingredients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedIngredients).map(([aisle, aisleIngredients]) => (
          <div key={aisle}>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-2">
              {aisle.replace("_", " ")}
            </h3>
            <div className="space-y-2">
              {aisleIngredients.map((ingredient) => {
                const isChecked = checkedItems.has(ingredient.id);
                return (
                  <div
                    key={ingredient.id}
                    className="flex items-start space-x-3"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleIngredient(ingredient.id)}
                      className="mt-1"
                    />
                    <label
                      className={`text-sm flex-1 cursor-pointer ${
                        isChecked ? "line-through text-muted-foreground" : ""
                      }`}
                      onClick={() => toggleIngredient(ingredient.id)}
                    >
                      <span className="font-medium">
                        {ingredient.quantity} {ingredient.unit}
                      </span>{" "}
                      {ingredient.name_raw}
                      {ingredient.notes && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({ingredient.notes})
                        </span>
                      )}
                    </label>
                    av
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {ingredients.length === 0 && (
          <p className="text-muted-foreground text-sm">No ingredients listed</p>
        )}
      </CardContent>
    </Card>
  );
}
