import UserOnboardingForm from "@/components/forms/UserOnboardingForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function UserOnboardingPage() {
  const user = await auth();

  if (!user.userId) {
    redirect("/sign-in");
  }

  const onboardingComplete = user.sessionClaims?.metadata?.onboardingComplete;

  // Check if user has already completed onboarding
  if (onboardingComplete === true) {
    redirect("/");
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Welcome!</h1>
      <p className="mb-4 text-gray-600">
        Let&apos;s set up your profile so others can find you and see your
        recipes.
      </p>
      <UserOnboardingForm />
    </div>
  );
}
