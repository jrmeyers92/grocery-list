import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Recipe } from "@/types/database.types";
import { Clock, Users } from "lucide-react";

interface RecipeInfoProps {
  recipe: Recipe;
}

export default function RecipeInfo({ recipe }: RecipeInfoProps) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-6 mb-4">
          {recipe.servings && (
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Servings</p>
                <p className="font-semibold">{recipe.servings}</p>
              </div>
            </div>
          )}

          {recipe.prep_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Prep Time</p>
                <p className="font-semibold">{recipe.prep_time} min</p>
              </div>
            </div>
          )}

          {recipe.cook_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cook Time</p>
                <p className="font-semibold">{recipe.cook_time} min</p>
              </div>
            </div>
          )}

          {totalTime > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="font-semibold">{totalTime} min</p>
              </div>
            </div>
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
