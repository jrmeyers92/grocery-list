import RecipeCard from "@/components/recipe/RecipeCard";
import { Button } from "@/components/ui/button";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface UserRecipesPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserRecipesPage({
  params,
}: UserRecipesPageProps) {
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    redirect("/sign-in");
  }

  const { userId: profileUserId } = await params;

  // Fetch user information
  let userName: string | undefined;
  let userUsername: string | undefined;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(profileUserId);
    userName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : undefined;
    userUsername = user.username || undefined;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    notFound();
  }

  const supabase = await createAdminClient();

  // Fetch public recipes (or followers-only if you're following them)
  const { data: recipes, error } = await supabase
    .from("grocerylist_recipes")
    .select("*")
    .eq("owner_id", profileUserId)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch recipes:", error);
    notFound();
  }

  const displayName = userName || userUsername || "User";

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/recipes">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Link>
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{displayName}&apos;s Recipes</h1>
          {userUsername && (
            <p className="text-muted-foreground">@{userUsername}</p>
          )}
        </div>
      </div>

      {recipes && recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard recipe={recipe} key={recipe.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Public Recipes</h2>
          <p className="text-muted-foreground">
            {displayName} hasn&apos;t shared any public recipes yet.
          </p>
        </div>
      )}
    </div>
  );
}
