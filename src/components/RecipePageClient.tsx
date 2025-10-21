"use client";

import RecipeCard from "@/components/recipe/RecipeCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Recipe } from "@/types/database.types";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface RecipesPageClientProps {
  recipes: Recipe[];
  shoppingListRecipeIds: Set<string>;
}

export default function RecipesPageClient({
  recipes,
  shoppingListRecipeIds,
}: RecipesPageClientProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);

  // Extract all unique tags from recipes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    recipes.forEach((recipe) => {
      recipe.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [recipes]);

  // Get tag counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    recipes.forEach((recipe) => {
      recipe.tags?.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [recipes]);

  // Filter recipes based on selected tags and favorites
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Filter by favorites
      if (showFavorites && !recipe.is_favorite) {
        return false;
      }

      // Filter by tags - recipe must have ALL selected tags
      if (selectedTags.size > 0) {
        const recipeTags = new Set(recipe.tags || []);
        for (const tag of selectedTags) {
          if (!recipeTags.has(tag)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [recipes, selectedTags, showFavorites]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedTags(new Set());
    setShowFavorites(false);
  };

  const hasActiveFilters = selectedTags.size > 0 || showFavorites;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p className="text-muted-foreground mt-2">
            Manage your recipe collection
          </p>
        </div>
        <Link href="/recipes/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Recipe
          </Button>
        </Link>
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No recipes yet</h2>
          <p className="text-muted-foreground mb-6">
            Start building your recipe collection
          </p>
          <Link href="/recipes/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Recipe
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 shrink-0">
            <div className="sticky top-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Filters</h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Favorites Filter */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Quick Filters</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="favorites"
                    checked={showFavorites}
                    onCheckedChange={(checked) =>
                      setShowFavorites(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="favorites"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Favorites only
                  </Label>
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">
                    Tags ({allTags.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.has(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <Label
                          htmlFor={`tag-${tag}`}
                          className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                        >
                          <span>{tag}</span>
                          <span className="text-xs text-muted-foreground">
                            {tagCounts[tag]}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content - Recipe Grid */}
          <div className="flex-1">
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mb-6 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {showFavorites && (
                  <Badge variant="secondary" className="gap-1">
                    Favorites
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setShowFavorites(false)}
                    />
                  </Badge>
                )}
                {Array.from(selectedTags).map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredRecipes.length} of {recipes.length} recipes
            </p>

            {/* Recipe Grid */}
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">
                  No recipes match your filters
                </h2>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or clear them to see all recipes
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isInShoppingList={shoppingListRecipeIds.has(recipe.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
