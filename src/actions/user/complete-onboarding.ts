"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import {
  CreateUserProfileServerInput,
  createUserProfileServerSchema,
} from "@/lib/validation/user";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z, ZodError } from "zod";

type UserOnboardingResponse = {
  success: boolean;
  error?: string;
};

export async function completeUserOnboarding(
  userData: CreateUserProfileServerInput
): Promise<UserOnboardingResponse> {
  try {
    // Validate form data with the server schema
    const validationResult = createUserProfileServerSchema.safeParse(userData);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Validation failed. Please check your inputs.",
      };
    }

    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Verify clerk_id matches authenticated user
    if (validationResult.data.clerk_id !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const supabase = await createAdminClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("grocerylist_users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: "User profile already exists",
      };
    }

    // Check if username is already taken
    const { data: existingUsername } = await supabase
      .from("grocerylist_users")
      .select("id")
      .eq("username", validationResult.data.username)
      .single();

    if (existingUsername) {
      return {
        success: false,
        error: "Username is already taken",
      };
    }

    // Insert user data into database
    const { error: insertError } = await supabase
      .from("grocerylist_users")
      .insert({
        clerk_id: validationResult.data.clerk_id,
        username: validationResult.data.username,
        display_name: validationResult.data.display_name || null,
        bio: validationResult.data.bio || null,
        avatar_url: validationResult.data.avatar_url || null,
        onboarding_completed: true,
      });

    if (insertError) {
      console.error("Supabase error:", insertError);
      return {
        success: false,
        error: "Failed to create user profile",
      };
    }

    // Update Clerk user metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        username: validationResult.data.username,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error completing user onboarding:", error);
    return {
      success: false,
      error: "Failed to complete onboarding",
    };
  }
}

// Helper function to check username availability (for real-time validation)
export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean }> {
  try {
    const supabase = await createAdminClient();

    const { data } = await supabase
      .from("grocerylist_users")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    return { available: !data };
  } catch (error) {
    console.error("Error checking username:", error);
    return { available: false };
  }
}
