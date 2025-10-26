"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import type { TablesInsert } from "@/types/database.types";
import { Constants } from "@/types/database.types";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createStockedItemSchema = z.object({
  name: z.string().min(1).max(255),
  aisle: z.enum(Constants.public.Enums.ingredient_aisles),
  always_stocked: z.boolean().default(true),
  notes: z.string().max(500).optional().nullable(),
});

export type CreateStockedItemInput = z.infer<typeof createStockedItemSchema>;

export async function createStockedItem(input: CreateStockedItemInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validatedData = createStockedItemSchema.parse(input);
    const supabase = await createAdminClient();

    const insertData: TablesInsert<"grocerylist_stocked_items"> = {
      owner_id: userId,
      name: validatedData.name,
      aisle: validatedData.aisle,
      always_stocked: validatedData.always_stocked,
      notes: validatedData.notes || null,
    };

    const { data, error } = await supabase
      .from("grocerylist_stocked_items")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);

      // Check for unique constraint violation
      if (error.code === "23505") {
        return {
          success: false,
          error: "This item already exists in your stocked items",
        };
      }

      return {
        success: false,
        error: "Failed to create stocked item",
      };
    }

    revalidatePath("/stocked-items");

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error creating stocked item:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
