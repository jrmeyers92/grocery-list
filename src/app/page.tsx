import { buttonVariants } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Apple,
  BookOpen,
  ListChecks,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Apple className="text-primary" size={64} />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Your Recipes, One Smart
            <span className="text-primary"> Grocery List</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Store your favorite recipes, add them to your cart, and
            automatically generate an organized grocery list. Shopping has never
            been this easy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <SignedOut>
              <Link
                href="/sign-up"
                className={buttonVariants({
                  size: "lg",
                  className: "text-lg px-8",
                })}
              >
                Get Started Free
              </Link>
              <Link
                href="/sign-in"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "text-lg px-8",
                })}
              >
                Sign In
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/recipes"
                className={buttonVariants({
                  size: "lg",
                  className: "text-lg px-8",
                })}
              >
                Go to Recipes
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen size={32} />}
              title="Store Your Recipes"
              description="Save all your go-to recipes in one place. Keep them organized and ready whenever you need them."
            />

            <FeatureCard
              icon={<ShoppingCart size={32} />}
              title="Add to Cart"
              description="Select the recipes you want to cook this week and add them to your shopping cart with a single click."
            />

            <FeatureCard
              icon={<ListChecks size={32} />}
              title="Auto-Generate List"
              description="Get an intelligent grocery list that combines ingredients and organizes them by store location."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Make Grocery Shopping Less Painful
              </h2>
              <p className="text-lg text-muted-foreground">
                Stop wandering aisles or forgetting ingredients. Our smart
                organization groups items by location, so you can shop
                efficiently and get home faster.
              </p>

              <ul className="space-y-4">
                <BenefitItem text="Combine duplicate ingredients automatically" />
                <BenefitItem text="Sort by grocery store sections" />
                <BenefitItem text="Never forget an ingredient again" />
                <BenefitItem text="Save time on every shopping trip" />
              </ul>

              <SignedOut>
                <Link
                  href="/sign-up"
                  className={buttonVariants({ size: "lg", className: "mt-4" })}
                >
                  Start Shopping Smarter
                </Link>
              </SignedOut>
            </div>

            <div className=" bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl p-8 md:p-12">
              <div className="bg-background rounded-xl p-6 shadow-lg space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin size={16} />
                  <span>Produce Section</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2"></div>
                    <span>2 lbs Tomatoes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2"></div>
                    <span>1 bunch Basil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2"></div>
                    <span>3 Onions</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin size={16} />
                    <span>Dairy Section</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2"></div>
                    <span>2 cups Heavy Cream</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2"></div>
                    <span>8 oz Parmesan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Transform Your Grocery Shopping?
          </h2>
          <p className="text-lg opacity-90">
            Join now and start organizing your recipes and shopping lists today.
          </p>
          <SignedOut>
            <Link
              href="/sign-up"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "text-lg px-8 mt-4",
              })}
            >
              Get Started Free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/recipes"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "text-lg px-8 mt-4",
              })}
            >
              Go to Recipes
            </Link>
          </SignedIn>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-6 rounded-xl border shadow-sm space-y-4">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
        <ListChecks size={16} className="text-primary" />
      </div>
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}
