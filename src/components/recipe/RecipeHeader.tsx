"use client";

import { deleteRecipe } from "@/actions/recipe/delete-recipe";
import {
  addToShoppingList,
  removeFromShoppingList,
} from "@/actions/shopping-list/recipes";
import { Button } from "@/components/ui/button";
import { RecipeWithIngredients } from "@/types/database.types";
import { ArrowLeft, Check, Edit, Heart, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface RecipeHeaderProps {
  recipe: RecipeWithIngredients;
  isInShoppingList?: boolean;
}

export default function RecipeHeader({
  recipe,
  isInShoppingList = false,
}: RecipeHeaderProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [inList, setInList] = useState(isInShoppingList);

  const handleAddToShoppingList = async () => {
    if (inList) {
      // Remove from shopping list
      setIsAdding(true);
      try {
        const result = await removeFromShoppingList(recipe.id);

        if (!result.success) {
          toast.error("Error", {
            description: result.error,
          });
        } else {
          setInList(false);
          toast.success("Removed from shopping list", {
            description: `${recipe.title} has been removed`,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Error", {
          description: "Failed to remove from shopping list",
        });
      } finally {
        setIsAdding(false);
      }
    } else {
      // Add to shopping list
      setIsAdding(true);
      try {
        const result = await addToShoppingList({
          recipeId: recipe.id,
          servingMultiplier: 1.0,
        });

        if (!result.success) {
          toast.error("Error", {
            description: result.error,
          });
        } else {
          setInList(true);
          toast.success("Added to shopping list!", {
            description: `${recipe.title} has been added`,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Error", {
          description: "Failed to add to shopping list",
        });
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this recipe? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteRecipe(recipe.id);

      if (!result.success) {
        toast.error("Error", {
          description: result.error,
        });
      } else {
        toast.success("Success", {
          description: "Recipe deleted successfully",
        });
        router.push("/recipes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to delete recipe",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => router.push("/recipes")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Recipes
      </Button>

      {recipe.image_url && (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">{recipe.title}</h1>
            {recipe.is_favorite && (
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            )}
          </div>
          {recipe.description && (
            <p className="text-muted-foreground text-lg">
              {recipe.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Button
        onClick={handleAddToShoppingList}
        className="w-full md:w-auto"
        disabled={isAdding}
        variant={inList ? "outline" : "default"}
      >
        {inList ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            In Shopping List
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add to Shopping List
          </>
        )}
      </Button>
    </div>
  );
}
