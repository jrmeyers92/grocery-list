"use client";

import {
  removeFromShoppingList,
  updateServingMultiplier,
} from "@/actions/shopping-list/add-to-shopping-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExternalLink, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface ShoppingListRecipesProps {
  recipes: any[];
}

export default function ShoppingListRecipes({
  recipes,
}: ShoppingListRecipesProps) {
  const [localRecipes, setLocalRecipes] = useState(recipes);
  const [servingInputs, setServingInputs] = useState<Record<string, number>>(
    recipes.reduce((acc, item) => {
      acc[item.recipe.id] = item.serving_multiplier;
      return acc;
    }, {})
  );

  const handleRemove = async (recipeId: string, recipeName: string) => {
    try {
      const result = await removeFromShoppingList(recipeId);

      if (!result.success) {
        toast.error("Error", { description: result.error });
      } else {
        setLocalRecipes((prev) =>
          prev.filter((item) => item.recipe.id !== recipeId)
        );
        toast.success("Removed", {
          description: `${recipeName} removed from list`,
        });
      }
    } catch (error) {
      toast.error("Error", { description: "Failed to remove recipe" });
    }
  };

  const handleServingChange = async (
    recipeId: string,
    newMultiplier: number
  ) => {
    if (newMultiplier <= 0 || isNaN(newMultiplier)) {
      return;
    }

    try {
      const result = await updateServingMultiplier(recipeId, newMultiplier);

      if (!result.success) {
        toast.error("Error", { description: result.error });
      } else {
        setServingInputs((prev) => ({ ...prev, [recipeId]: newMultiplier }));
        toast.success("Updated", { description: "Serving size updated" });
      }
    } catch (error) {
      toast.error("Error", { description: "Failed to update serving size" });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recipes</h2>
        <div className="space-y-4">
          {localRecipes.map((item) => {
            const recipe = item.recipe;
            const originalServings = recipe.servings || 4;
            const multiplier =
              servingInputs[recipe.id] || item.serving_multiplier;
            const adjustedServings = Math.round(originalServings * multiplier);

            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {recipe.image_url && (
                  <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={recipe.image_url}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="font-medium hover:underline flex items-center gap-2 group"
                      >
                        {recipe.title}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => handleRemove(recipe.id, recipe.title)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">
                      Servings:
                    </span>
                    <Input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={multiplier}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setServingInputs((prev) => ({
                          ...prev,
                          [recipe.id]: value,
                        }));
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value !== multiplier) {
                          handleServingChange(recipe.id, value);
                        }
                      }}
                      className="w-20 h-8"
                    />
                    <span className="text-sm text-muted-foreground">×</span>
                    <span className="text-sm font-medium">
                      ({adjustedServings} servings)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
