"use client";

import RecipeCard from "@/components/recipe/RecipeCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Recipe } from "@/types/database.types";
import { Filter, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

interface ExploreRecipesPageClientProps {
  recipes: Recipe[];
  shoppingListRecipeIds: Set<string>;
}

type SortOption = "recent" | "alphabetical" | "popular";

export default function ExploreRecipesPageClient({
  recipes,
  shoppingListRecipeIds,
}: ExploreRecipesPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  // Filter and search recipes
  const filteredRecipes = useMemo(() => {
    const filtered = recipes.filter((recipe) => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = recipe.title.toLowerCase().includes(searchLower);
        const descMatch = recipe.description
          ?.toLowerCase()
          .includes(searchLower);
        const tagMatch = recipe.tags?.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );

        if (!titleMatch && !descMatch && !tagMatch) {
          return false;
        }
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

    // Apply sorting
    switch (sortBy) {
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "popular":
        // You could add a view_count or like_count field for this
        // For now, just use recent as fallback
        filtered.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
        break;
      case "recent":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
        break;
    }

    return filtered;
  }, [recipes, searchTerm, selectedTags, sortBy]);

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
    setSearchTerm("");
    setSelectedTags(new Set());
    setSortBy("recent");
  };

  const hasActiveFilters = selectedTags.size > 0 || searchTerm.length > 0;

  // Filter Sidebar Component (reusable for both desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
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

      {/* Sort Options */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Sort By</h3>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Tags ({allTags.length})</h3>
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
  );

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Explore Recipes</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Discover recipes shared by the community
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search recipes by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            No public recipes yet
          </h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">
            Check back later to discover recipes shared by the community
          </p>
        </div>
      ) : (
        <div className="flex gap-8">
          {/* Desktop Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8">
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Button and Active Filters */}
            <div className="lg:hidden mb-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {selectedTags.size + (searchTerm ? 1 : 0)}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredRecipes.length} of {recipes.length}
                </p>
              </div>

              {/* Active Filters Display - Mobile */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Active:
                  </span>
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      Search: {searchTerm}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSearchTerm("")}
                      />
                    </Badge>
                  )}
                  {Array.from(selectedTags).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 text-xs"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Active Filters and Results Count */}
            <div className="hidden lg:block mb-6 space-y-4">
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchTerm}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSearchTerm("")}
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

              <p className="text-sm text-muted-foreground">
                Showing {filteredRecipes.length} of {recipes.length} recipes
              </p>
            </div>

            {/* Recipe Grid */}
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  No recipes match your filters
                </h2>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Try adjusting your search or filters to see more recipes
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isInShoppingList={shoppingListRecipeIds.has(recipe.id)}
                    isExploreMode={true}
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
