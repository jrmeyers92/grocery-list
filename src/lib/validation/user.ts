// lib/validation/user.ts
import { z } from "zod";

// Username validation rules
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

const DISPLAY_NAME_MAX_LENGTH = 50;
const BIO_MAX_LENGTH = 500;

// Username schema with strict validation
export const usernameSchema = z
  .string()
  .min(
    USERNAME_MIN_LENGTH,
    `Username must be at least ${USERNAME_MIN_LENGTH} characters`
  )
  .max(
    USERNAME_MAX_LENGTH,
    `Username must be at most ${USERNAME_MAX_LENGTH} characters`
  )
  .regex(
    USERNAME_REGEX,
    "Username can only contain letters, numbers, hyphens, and underscores"
  )
  .transform((val) => val.toLowerCase()); // Normalize to lowercase

// Display name schema
export const displayNameSchema = z
  .string()
  .max(
    DISPLAY_NAME_MAX_LENGTH,
    `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters`
  )
  .optional();

// Bio schema
export const bioSchema = z
  .string()
  .max(BIO_MAX_LENGTH, `Bio must be at most ${BIO_MAX_LENGTH} characters`)
  .optional();

// CLIENT-SIDE SCHEMA (for onboarding form)
export const createUserProfileClientSchema = z.object({
  username: usernameSchema,
  display_name: displayNameSchema,
  bio: bioSchema,
  avatar_url: z.string().url().optional(),
});

// SERVER-SIDE SCHEMA (after adding clerk_id)
export const createUserProfileServerSchema =
  createUserProfileClientSchema.extend({
    clerk_id: z.string().min(1, "Clerk ID is required"),
  });

// UPDATE SCHEMA (for profile updates)
export const updateUserProfileSchema = z.object({
  username: usernameSchema.optional(),
  display_name: displayNameSchema,
  bio: bioSchema,
  avatar_url: z.string().url().optional(),
});

// SEARCH SCHEMA
export const searchUsersSchema = z.object({
  query: z.string().min(1, "Search query is required").max(100),
  limit: z.number().int().positive().max(50).default(10),
});

// Type exports for use in components
export type CreateUserProfileClientInput = z.infer<
  typeof createUserProfileClientSchema
>;
export type CreateUserProfileServerInput = z.infer<
  typeof createUserProfileServerSchema
>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;

// Validation constants (export for reuse)
export const USER_VALIDATION = {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX,
  DISPLAY_NAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
} as const;
