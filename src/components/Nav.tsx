import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignedIn, SignedOut, SignOutButton, UserButton } from "@clerk/nextjs";
import {
  Apple,
  BookOpen,
  Home,
  Menu,
  PlusCircle,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { ShoppingListBadge } from "./shopping-list/ShoppingListBadge";
import { buttonVariants } from "./ui/button";

const Nav = () => {
  return (
    <nav className="border-b sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 supports-backdrop-filter:bg-background/60 py-3 px-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo and Brand Name */}
        <Link
          href="/"
          className="flex gap-2 items-center text-xl font-bold justify-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
          aria-label="Grocery List Home"
        >
          <Apple className="text-primary" size={28} aria-hidden="true" />
          <span>Grocery List</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <SignedIn>
            <Link
              href="/recipes"
              className={buttonVariants({ variant: "ghost" })}
              aria-label="View recipes"
            >
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Recipes
            </Link>

            <Link
              href="/shopping-list"
              className={`${buttonVariants({ variant: "ghost" })} relative`}
              aria-label="View shopping list"
            >
              <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
              Shopping List
              <ShoppingListBadge />
            </Link>

            <Link
              href="/recipes/create"
              className={buttonVariants({ variant: "ghost" })}
              aria-label="Create new recipe"
            >
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Recipe
            </Link>

            <div className="ml-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex gap-2">
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                aria-label="Sign in to your account"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({ size: "sm" })}
                aria-label="Create a new account"
              >
                Sign Up
              </Link>
            </div>
          </SignedOut>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <Sheet>
            <SheetTrigger
              className={buttonVariants({ variant: "outline", size: "icon" })}
              aria-label="Open navigation menu"
            >
              <Menu size={20} aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Manage your recipes and shopping lists
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 py-6">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="flex items-center py-3 px-4 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <Home className="h-5 w-5 mr-3" aria-hidden="true" />
                    <span className="text-base font-medium">Home</span>
                  </Link>
                </SheetClose>

                <SignedIn>
                  <div className="border-t my-2"></div>

                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Link
                        href="/recipes"
                        className="flex items-center py-3 px-4 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <BookOpen className="h-5 w-5 mr-3" aria-hidden="true" />
                        <span className="text-base font-medium">Recipes</span>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/shopping-list"
                        className="flex items-center py-3 px-4 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary relative"
                      >
                        <ShoppingCart
                          className="h-5 w-5 mr-3"
                          aria-hidden="true"
                        />
                        <span className="text-base font-medium">
                          Shopping List
                        </span>
                        <ShoppingListBadge />
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/recipes/create"
                        className="flex items-center py-3 px-4 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <PlusCircle
                          className="h-5 w-5 mr-3"
                          aria-hidden="true"
                        />
                        <span className="text-base font-medium">
                          Create Recipe
                        </span>
                      </Link>
                    </SheetClose>

                    <div className="border-t my-2"></div>

                    <SheetClose asChild>
                      <SignOutButton>
                        <button
                          className={`${buttonVariants({
                            variant: "outline",
                          })} w-full justify-start`}
                          aria-label="Sign out of your account"
                        >
                          Sign Out
                        </button>
                      </SignOutButton>
                    </SheetClose>
                  </div>
                </SignedIn>

                <SignedOut>
                  <div className="border-t my-2"></div>

                  <div className="flex flex-col gap-3">
                    <SheetClose asChild>
                      <Link
                        href="/sign-in"
                        className={`${buttonVariants({
                          variant: "outline",
                        })} w-full`}
                        aria-label="Sign in to your account"
                      >
                        Sign In
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/sign-up"
                        className={`${buttonVariants()} w-full`}
                        aria-label="Create a new account"
                      >
                        Sign Up
                      </Link>
                    </SheetClose>
                  </div>
                </SignedOut>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
