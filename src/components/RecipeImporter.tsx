"use client";

import { parseRecipe } from "@/actions/recipe/parse-recipe";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { CreateRecipeClientInput } from "@/lib/validation/recipe";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

interface RecipeImporterProps {
  form: UseFormReturn<CreateRecipeClientInput>;
  ingredientFieldArray: UseFieldArrayReturn<
    CreateRecipeClientInput,
    "ingredients",
    "id"
  >;
  stepFieldArray: UseFieldArrayReturn<CreateRecipeClientInput, "steps", "id">;
}

const MAX_RECIPE_LENGTH = 8000;

export default function RecipeImporter({
  form,
  ingredientFieldArray,
  stepFieldArray,
}: RecipeImporterProps) {
  const [open, setOpen] = useState(false);
  const [recipeText, setRecipeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const handleImport = async () => {
    if (!recipeText.trim()) {
      toast.error("Please paste a recipe");
      return;
    }

    if (recipeText.length > MAX_RECIPE_LENGTH) {
      toast.error("Recipe is too long", {
        description: `Please limit your recipe to ${MAX_RECIPE_LENGTH.toLocaleString()} characters. Current length: ${recipeText.length.toLocaleString()}`,
      });
      return;
    }

    setIsParsing(true);
    try {
      const result = await parseRecipe(recipeText);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to parse recipe");
      }

      const parsed = result.data;

      console.log("Parsed recipe data:", JSON.stringify(parsed, null, 2));

      // Populate basic form fields
      form.setValue("title", parsed.title);

      if (parsed.description) {
        form.setValue("description", parsed.description);
      }

      if (parsed.servings) {
        form.setValue("servings", parsed.servings);
      }

      if (parsed.prep_time) {
        form.setValue("prep_time", parsed.prep_time);
      }

      if (parsed.cook_time) {
        form.setValue("cook_time", parsed.cook_time);
      }

      // Clear and replace ingredients
      console.log(
        "Before ingredient clear:",
        ingredientFieldArray.fields.length
      );

      // Replace all at once using react-hook-form's replace method
      ingredientFieldArray.replace(parsed.ingredients);

      console.log(
        "After ingredient replace:",
        ingredientFieldArray.fields.length
      );

      // Clear and replace steps
      console.log("Before steps clear:", stepFieldArray.fields.length);

      stepFieldArray.replace(parsed.steps);

      console.log("After steps replace:", stepFieldArray.fields.length);

      toast.success("Recipe imported successfully!", {
        description: "Review the fields and make any necessary adjustments.",
      });

      setOpen(false);
      setRecipeText("");
    } catch (error) {
      console.error("Error parsing recipe:", error);
      toast.error("Failed to parse recipe", {
        description:
          error instanceof Error
            ? error.message
            : "Please check the format and try again.",
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Import Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Recipe from Text</DialogTitle>
          <DialogDescription>
            Paste a recipe from any source and we&apos;ll automatically extract
            the ingredients and instructions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your recipe here...

Example:
Chocolate Chip Cookies

Ingredients:
- 2 1/4 cups all-purpose flour
- 1 tsp baking soda
- 1 cup butter, softened
- 3/4 cup sugar
- 2 eggs

Instructions:
1. Preheat oven to 375°F
2. Mix flour and baking soda in a bowl
3. Cream butter and sugar together..."
              className="min-h-[300px] max-h-[400px] font-mono text-sm resize-none overflow-y-auto"
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
            />
            <div className="text-xs text-muted-foreground text-right">
              {recipeText.length.toLocaleString()} /{" "}
              {MAX_RECIPE_LENGTH.toLocaleString()} characters
              {recipeText.length > MAX_RECIPE_LENGTH && (
                <span className="text-destructive ml-2">
                  (exceeds limit by{" "}
                  {(recipeText.length - MAX_RECIPE_LENGTH).toLocaleString()})
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setRecipeText("");
              }}
              disabled={isParsing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={isParsing || !recipeText.trim()}
            >
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                "Import Recipe"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
