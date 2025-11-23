"use client";

import { createRecipe } from "@/actions/recipe/create-recipe";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createRecipeClientSchema,
  type CreateRecipeClientInput,
} from "@/lib/validation/recipe";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/types/constants";
import { Constants } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import RecipeImporter from "../RecipeImporter";

const INGREDIENT_UNITS = Constants.public.Enums.ingredient_units;
const INGREDIENT_AISLES = Constants.public.Enums.ingredient_aisles;

export default function CreateRecipeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");

  const form = useForm<CreateRecipeClientInput>({
    resolver: zodResolver(createRecipeClientSchema),
    defaultValues: {
      title: "",
      description: "",
      servings: 4,
      prep_time: undefined,
      cook_time: undefined,
      recipeImage: null,
      tags: [],
      is_favorite: false,
      is_public: false, // Add this line
      ingredients: [
        { name_raw: "", quantity: 1, unit: "unit", aisle: "other", notes: "" },
      ],
      steps: [{ step_number: 1, instruction: "" }],
    },
  });

  const ingredientFieldArray = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const stepFieldArray = useFieldArray({
    control: form.control,
    name: "steps",
  });

  // Destructure for convenience in the rest of the component
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = ingredientFieldArray;

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = stepFieldArray;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please upload a JPEG, PNG, WebP, or GIF image",
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error("File too large", {
          description: "Image must be less than 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      form.setValue("recipeImage", file);
    }
  };

  const removeImage = () => {
    form.setValue("recipeImage", null);
    setImagePreview(null);
  };

  const onSubmit = async (data: CreateRecipeClientInput) => {
    setIsSubmitting(true);
    try {
      const result = await createRecipe(data);

      if (!result.success) {
        toast.error("Error", {
          description: result.error,
        });
      } else {
        toast.success("Success", {
          description: "Recipe created successfully!",
        });
        router.push("/recipes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Recipe</h1>
        <p className="text-muted-foreground mt-2">
          Add a new recipe to your collection
        </p>
        <RecipeImporter
          form={form}
          ingredientFieldArray={ingredientFieldArray}
          stepFieldArray={stepFieldArray}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4 p-6 border rounded-lg">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Grandma's Chocolate Chip Cookies"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A delicious family recipe passed down for generations..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prep_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="15"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cook_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="30"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="recipeImage"
              /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Recipe Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {imagePreview ? (
                        <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagePreview}
                            alt="Recipe preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-12 h-12 mb-4 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-400">
                                PNG, JPG, WebP or GIF (MAX. 5MB)
                              </p>
                            </div>
                            <Input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={handleImageChange}
                              {...fieldProps}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a photo of your recipe (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_favorite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mark as Favorite</FormLabel>
                    <FormDescription>
                      Add this recipe to your favorites
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make Recipe Public</FormLabel>
                    <FormDescription>
                      Allow other users to discover and view this recipe
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., dinner, quick, healthy (comma-separated)"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      onBlur={() => {
                        const tagsArray = tagsInput
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag.length > 0);
                        field.onChange(tagsArray);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to categorize your recipe (separate with commas)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 p-6 border rounded-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Ingredients</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendIngredient({
                    name_raw: "",
                    quantity: 1,
                    unit: "unit",
                    aisle: "other",
                    notes: "",
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            </div>

            <div className="space-y-4">
              {ingredientFields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative p-4 border rounded-lg space-y-3"
                >
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredientFields.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.name_raw`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredient Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="All-purpose flour" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INGREDIENT_UNITS.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.aisle`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Aisle</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select aisle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INGREDIENT_AISLES.map((aisle) => (
                                <SelectItem key={aisle} value={aisle}>
                                  {aisle.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="chopped, diced, minced..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendIngredient({
                    name_raw: "",
                    quantity: 1,
                    unit: "unit",
                    aisle: "other",
                    notes: "",
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2 ml-auto" />
                Add Ingredient
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-6 border rounded-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Instructions</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendStep({
                    step_number: stepFields.length + 1,
                    instruction: "",
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>

            <div className="space-y-4">
              {stepFields.map((field, index) => (
                <div key={field.id} className="relative p-4 border rounded-lg">
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(index)}
                      disabled={stepFields.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`steps.${index}.instruction`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Step {index + 1} *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe this step..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendStep({
                    step_number: stepFields.length + 1,
                    instruction: "",
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/recipes")}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Recipe"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
