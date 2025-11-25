"use client";

import { useDebounce } from "@/app/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Recipe } from "@/types/database.types";
import { Heart, Search, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type SearchScope = "own" | "public" | "user" | "followers";
type SortOption = "relevance" | "recent" | "popular" | "alphabetical";

interface RecipeSearchProps {
  /** The scope of recipes to search */
  scope?: SearchScope;
  /** Optional specific user ID when scope is 'user' */
  userId?: string;
  /** Show filters UI */
  showFilters?: boolean;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Custom CSS class */
  className?: string;
  /** Callback when a recipe is clicked (optional, defaults to navigation) */
  onRecipeClick?: (recipe: Recipe) => void;
}

export default function RecipeSearch({
  scope = "own",
  userId,
  showFilters = true,
  placeholder = "Search recipes...",
  className = "",
  onRecipeClick,
}: RecipeSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/recipes/tags");
        const data = await response.json();
        if (data.success) {
          setAvailableTags(data.tags);
        }
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };
    fetchTags();
  }, []);

  // Search recipes
  const searchRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (debouncedSearchTerm) params.append("q", debouncedSearchTerm);
      if (selectedTags.length > 0)
        params.append("tags", selectedTags.join(","));
      if (sortBy !== "relevance") params.append("sort", sortBy);
      if (showFavoritesOnly) params.append("favorites", "true");
      params.append("scope", scope);
      if (userId) params.append("userId", userId);

      const response = await fetch(`/api/recipes/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRecipes(data.recipes);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [
    debouncedSearchTerm,
    selectedTags,
    sortBy,
    showFavoritesOnly,
    scope,
    userId,
  ]);

  useEffect(() => {
    searchRecipes();
  }, [searchRecipes]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSortBy("relevance");
    setShowFavoritesOnly(false);
  };

  const hasActiveFilters =
    searchTerm || selectedTags.length > 0 || showFavoritesOnly;

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
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

        {showFilters && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Sort By
                  </label>
                  <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as SortOption)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scope === "own" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="favorites"
                      checked={showFavoritesOnly}
                      onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                      className="rounded"
                    />
                    <label
                      htmlFor="favorites"
                      className="text-sm cursor-pointer"
                    >
                      Favorites Only
                    </label>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Filter by Tags
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      <div>
        {isLoading && isInitialLoad ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading recipes...
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your search filters"
                : "Start by searching for recipes"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                onClick={(e) => {
                  if (onRecipeClick) {
                    e.preventDefault();
                    onRecipeClick(recipe);
                  }
                }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {recipe.image_url && (
                    <div className="relative w-full h-48">
                      <Image
                        src={recipe.image_url}
                        alt={recipe.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-semibold line-clamp-2 flex-1">
                        {recipe.title}
                      </h3>
                      {recipe.is_favorite && (
                        <Heart className="w-5 h-5 text-red-500 fill-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    {recipe.tags &&
                      recipe.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    {recipe.tags && recipe.tags.length > 3 && (
                      <Badge variant="outline">
                        +{recipe.tags.length - 3} more
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
