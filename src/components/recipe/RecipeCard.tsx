"use client";

import { toggleFavorite } from "@/actions/recipe/toggle-favorite";
import {
  addToShoppingList,
  removeFromShoppingList,
} from "@/actions/shopping-list/recipes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Recipe } from "@/types/database.types";
import { Check, Clock, Edit, Heart, Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface RecipeCardProps {
  recipe: Recipe;
  isInShoppingList?: boolean;
}

export default function RecipeCard({
  recipe,
  isInShoppingList = false,
}: RecipeCardProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [inList, setInList] = useState(isInShoppingList);
  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsTogglingFavorite(true);
    try {
      const result = await toggleFavorite(recipe.id);

      if (!result.success) {
        toast.error("Error", {
          description: result.error,
        });
      } else if (result.data) {
        setIsFavorite(result.data.isFavorite);
        toast.success(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to update favorite status",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleAddToShoppingList = async () => {
    if (inList) {
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

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <Link href={`/recipes/${recipe.id}`}>
        <CardHeader className="p-0 relative">
          {recipe.image_url ? (
            <div className="relative w-full h-48">
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite
                  ? "text-red-500 fill-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          </button>
        </CardHeader>
      </Link>

      <CardContent className="p-4">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
        </Link>

        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {recipe.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{recipe.servings}</span>
            </div>
          )}
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{totalTime} min</span>
            </div>
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {recipe.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            handleAddToShoppingList();
          }}
          disabled={isAdding}
        >
          {isAdding ? (
            <>Loading...</>
          ) : inList ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              In Week
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add to Week
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            router.push(`/recipes/${recipe.id}/edit`);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
