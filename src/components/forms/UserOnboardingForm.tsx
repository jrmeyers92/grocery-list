"use client";

import {
  checkUsernameAvailability,
  completeUserOnboarding,
} from "@/actions/user/complete-onboarding";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  CreateUserProfileClientInput,
  createUserProfileClientSchema,
  USER_VALIDATION,
} from "@/lib/validation/user";
import { useAuth, useSession, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UserOnboardingForm() {
  const { session } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const { userId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const form = useForm<CreateUserProfileClientInput>({
    resolver: zodResolver(createUserProfileClientSchema),
    defaultValues: {
      username: "",
      display_name: user?.fullName || "",
      bio: "",
      avatar_url: user?.imageUrl || undefined, // Change from "" to undefined
    },
  });

  // Watch username field for real-time validation
  const watchedUsername = form.watch("username");

  // Debounced username availability check
  useEffect(() => {
    if (
      !watchedUsername ||
      watchedUsername.length < USER_VALIDATION.USERNAME_MIN_LENGTH
    ) {
      setUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const result = await checkUsernameAvailability(watchedUsername);
        setUsernameAvailable(result.available);
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUsername]);

  async function onSubmit(values: CreateUserProfileClientInput) {
    console.log("onSubmit called", values); // Add this

    if (!userId) {
      toast.error("Authentication error", {
        description: "Please sign in again",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting transition"); // Add this

      startTransition(async () => {
        console.log("Inside transition"); // Add this

        const result = await completeUserOnboarding({
          ...values,
          clerk_id: userId,
        });

        console.log("Result:", result); // Add this

        if (result?.success) {
          toast.success("Profile created!", {
            description: "Welcome to the community!",
          });

          // Reload session and redirect
          await session?.reload();
          router.push("/");
        } else {
          toast.error("Registration failed", {
            description:
              result?.error || "There was a problem creating your profile.",
          });
        }
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Submission error", {
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  console.log("Form errors:", form.formState.errors);
  console.log("Form values:", form.watch());
  console.log("Is form valid:", form.formState.isValid);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onInvalid={() => console.log("Form invalid!")}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="annastevens"
                      {...field}
                      className="pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameChecking && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                      {!usernameChecking && usernameAvailable === true && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {!usernameChecking && usernameAvailable === false && (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  {USER_VALIDATION.USERNAME_MIN_LENGTH}-
                  {USER_VALIDATION.USERNAME_MAX_LENGTH} characters. Letters,
                  numbers, hyphens, and underscores only.
                  {usernameAvailable === false && (
                    <span className="text-red-500 block mt-1">
                      This username is already taken
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Anna Stevens" {...field} />
                </FormControl>
                <FormDescription>
                  Your full name or how you&apos;d like to be shown on your
                  profile
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell others a bit about yourself and your cooking interests..."
                    className="h-24"
                    maxLength={USER_VALIDATION.BIO_MAX_LENGTH}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length || 0}/{USER_VALIDATION.BIO_MAX_LENGTH}{" "}
                  characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={
              isSubmitting ||
              isPending ||
              usernameChecking ||
              usernameAvailable === false // Only disable if explicitly unavailable
            }
          >
            {isSubmitting || isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Complete Registration"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
