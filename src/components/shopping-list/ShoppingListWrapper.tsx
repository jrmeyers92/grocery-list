"use client";

import { RecipeWithIngredients } from "@/types/database.types";
import { useState } from "react";
import GroceryList from "./GroceryList";
import ShoppingListRecipes from "./ShoppingListRecipes";

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

interface ShoppingListWrapperProps {
  listId: string;
  initialRecipes: ShoppingListRecipe[];
  customItems: CustomItem[];
}

export default function ShoppingListWrapper({
  listId,
  initialRecipes,
  customItems,
}: ShoppingListWrapperProps) {
  const [localRecipes, setLocalRecipes] = useState(initialRecipes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      <div className="lg:col-span-2 order-2 lg:order-1">
        <ShoppingListRecipes
          recipes={localRecipes}
          onRecipesChange={setLocalRecipes}
        />
      </div>
      <div className="lg:col-span-1 order-1 lg:order-2">
        <GroceryList
          listId={listId}
          recipes={localRecipes}
          customItems={customItems}
        />
      </div>
    </div>
  );
}
