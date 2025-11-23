// lib/validation/recipe.ts
import { Constants } from "@/types/database.types";
import { z } from "zod";

const INGREDIENT_UNITS = Constants.public.Enums.ingredient_units;
const INGREDIENT_AISLES = Constants.public.Enums.ingredient_aisles;

// Enums for validation - dynamically created from database types
export const ingredientUnitSchema = z.enum(
  INGREDIENT_UNITS as unknown as [string, ...string[]]
);

export const ingredientAisleSchema = z.enum(
  INGREDIENT_AISLES as unknown as [string, ...string[]]
);

// Ingredient schema (for nested form)
export const ingredientSchema = z.object({
  name_raw: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: ingredientUnitSchema,
  aisle: ingredientAisleSchema,
  notes: z.string(),
});

// Step schema (for nested form)
export const stepSchema = z.object({
  step_number: z.number().int().positive(),
  instruction: z.string().min(1, "Instruction is required"),
});

// CLIENT-SIDE SCHEMA (for form validation)
export const createRecipeClientSchema = z.object({
  title: z.string().min(1, "Recipe name is required").max(200),
  description: z.string(),
  servings: z.number().int().positive(),
  prep_time: z.number().int().positive().optional(),
  cook_time: z.number().int().positive().optional(),
  recipeImage: z.instanceof(File).nullable().optional(),
  tags: z.array(z.string()),
  is_favorite: z.boolean(),
  is_public: z.boolean(),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "At least one ingredient is required"),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
});

// SERVER-SIDE SCHEMA (after adding owner_id)
export const createRecipeServerSchema = createRecipeClientSchema.extend({
  owner_id: z.string().min(1, "User ID is required"),
});

// Type exports for use in components
export type CreateRecipeClientInput = z.infer<typeof createRecipeClientSchema>;
export type CreateRecipeServerInput = z.infer<typeof createRecipeServerSchema>;
export type IngredientInput = z.infer<typeof ingredientSchema>;
export type StepInput = z.infer<typeof stepSchema>;
