"use client";

import { deleteRecipe } from "@/actions/recipe/delete-recipe";
import { toggleFavorite } from "@/actions/recipe/toggle-favorite";
import {
  addToShoppingList,
  removeFromShoppingList,
} from "@/actions/shopping-list/recipes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Recipe } from "@/types/database.types";
import {
  Check,
  Clock,
  Edit,
  Heart,
  MoreVertical,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteRecipe(recipe.id);

      if (!result.success) {
        toast.error("Error", {
          description: result.error,
        });
      } else {
        toast.success("Recipe deleted", {
          description: `${recipe.title} has been deleted`,
        });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to delete recipe",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col h-full">
        <Link href={`/recipes/${recipe.id}`}>
          <CardHeader className="p-0 relative">
            {recipe.image_url ? (
              <div className="relative w-full h-40 sm:h-48">
                <Image
                  src={recipe.image_url}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-full h-40 sm:h-48 bg-linear-to-bg from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl">🍽️</span>
              </div>
            )}
            <button
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className="absolute top-2 right-2 bg-white rounded-full p-1.5 sm:p-2 shadow-md hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                  isFavorite
                    ? "text-red-500 fill-red-500"
                    : "text-gray-400 hover:text-red-500"
                }`}
              />
            </button>
          </CardHeader>
        </Link>

        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
          <Link href={`/recipes/${recipe.id}`}>
            <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {recipe.title}
            </h3>
          </Link>

          {/* Fixed height description area */}
          <div className="h-8 sm:h-10 mb-2 sm:mb-3">
            {recipe.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
            {totalTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{totalTime} min</span>
              </div>
            )}
          </div>

          {/* Fixed height tags area */}
          <div className="h-6 sm:h-8 mt-auto">
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recipe.tags.slice(0, 3).map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
                {recipe.tags.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
                  >
                    +{recipe.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
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
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden xs:inline">In Week</span>
                <span className="xs:hidden">Week</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden xs:inline">Add to Week</span>
                <span className="xs:hidden">Add</span>
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 sm:h-9 w-8 sm:w-9 p-0"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/recipes/${recipe.id}/edit`);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{recipe.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
