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
import { Apple, Home, Menu } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { buttonVariants } from "./ui/button";

const Nav = () => {
  return (
    <nav className="border-b sticky top-0 z-50 w-full backdrop-blur py-3 px-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo and Brand Name */}
        <Link
          href="/"
          className="flex gap-2 items-center text-xl font-bold justify-center"
        >
          <Apple className="text-primary" size={28} />
          <span>Grocery List</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Auth Buttons */}
          <SignedIn>
            <Link
              href="/recipes"
              className={buttonVariants({ variant: "ghost" })}
            >
              Recipes
            </Link>

            <Link
              href="/shopping-list"
              className={buttonVariants({ variant: "ghost" })}
            >
              Shopping List
            </Link>
            <Link
              href="/recipes/create"
              className={buttonVariants({ variant: "ghost" })}
            >
              Create Recipe
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <div className="flex gap-3">
              <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
                Sign Up
              </Link>
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Sign In
              </Link>
            </div>
          </SignedOut>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Grocery List</SheetTitle>
                <SheetDescription>
                  To make grocery shopping a little less painful
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-100"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </SheetClose>

                <div className="border-t my-2"></div>

                <SignedIn>
                  <div className="flex flex-col gap-3">
                    <SheetClose asChild>
                      <Link
                        href="/recipes"
                        className={buttonVariants({ variant: "ghost" })}
                      >
                        Recipes
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/shopping-list"
                        className={buttonVariants({ variant: "ghost" })}
                      >
                        Shopping List
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/recipes/create"
                        className={buttonVariants({ variant: "ghost" })}
                      >
                        Create Recipe
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <SignOutButton>
                        <button
                          className={buttonVariants({ variant: "outline" })}
                        >
                          Sign Out
                        </button>
                      </SignOutButton>
                    </SheetClose>
                  </div>
                </SignedIn>

                <SignedOut>
                  <div className="flex flex-col gap-3">
                    <SheetClose asChild>
                      <Link href="/sign-up" className={buttonVariants()}>
                        Sign Up
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/sign-in"
                        className={buttonVariants({ variant: "outline" })}
                      >
                        Sign In
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
