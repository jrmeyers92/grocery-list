// app/api/recipes/search/route.ts
import { createAdminClient } from "@/lib/supabase/clients/admin";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const sort = searchParams.get("sort") || "relevance";
    const favoritesOnly = searchParams.get("favorites") === "true";
    const scope = searchParams.get("scope") || "own";
    const targetUserId = searchParams.get("userId");

    const supabase = await createAdminClient();
    let queryBuilder = supabase.from("grocerylist_recipes").select("*");

    // Apply scope filters
    switch (scope) {
      case "own":
        queryBuilder = queryBuilder.eq("owner_id", userId);
        break;
      case "public":
        queryBuilder = queryBuilder.eq("visibility", "public");
        break;
      case "user":
        if (targetUserId) {
          queryBuilder = queryBuilder
            .eq("owner_id", targetUserId)
            .eq("visibility", "public");
        }
        break;
      case "followers":
        // TODO: Implement followers logic when you add that feature
        queryBuilder = queryBuilder
          .eq("visibility", "public")
          .neq("owner_id", userId);
        break;
    }

    // Text search using full-text search
    if (query) {
      // Convert search query to tsquery format (replace spaces with &)
      const tsQuery = query.trim().split(/\s+/).join(" & ");
      queryBuilder = queryBuilder.textSearch("search_vector", tsQuery);
    }

    // Tag filtering
    if (tags.length > 0) {
      queryBuilder = queryBuilder.contains("tags", tags);
    }

    // Favorites filter (only for own recipes)
    if (favoritesOnly && scope === "own") {
      queryBuilder = queryBuilder.eq("is_favorite", true);
    }

    // Sorting
    switch (sort) {
      case "recent":
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
        break;
      case "popular":
        // You could add a view_count or like_count column for this
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
        break;
      case "alphabetical":
        queryBuilder = queryBuilder.order("title", { ascending: true });
        break;
      case "relevance":
      default:
        if (query) {
          // For relevance, we rely on the full-text search ranking
          // PostgreSQL's ts_rank would be used here, but we'll default to recent
          queryBuilder = queryBuilder.order("created_at", { ascending: false });
        } else {
          queryBuilder = queryBuilder.order("created_at", { ascending: false });
        }
        break;
    }

    // Limit results
    queryBuilder = queryBuilder.limit(50);

    const { data: recipes, error } = await queryBuilder;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to search recipes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipes: recipes || [],
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
