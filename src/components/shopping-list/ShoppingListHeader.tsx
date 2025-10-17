"use client";

import {
  clearShoppingList,
  renameShoppingList,
  startNewShoppingList,
} from "@/actions/shopping-list/manage-shopping-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShoppingListHeaderProps {
  listId: string;
  title: string;
  recipeCount: number;
}

export default function ShoppingListHeader({
  title,
  recipeCount,
}: ShoppingListHeaderProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    if (!newTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const result = await renameShoppingList(newTitle);

      if (!result.success) {
        toast.error("Error", { description: result.error });
      } else {
        toast.success("Success", { description: result.message });
        setIsRenameOpen(false);
      }
    } catch (error) {
      toast.error("Error", { description: "Failed to rename list" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (
      !confirm("Are you sure you want to clear all recipes from this list?")
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await clearShoppingList();

      if (!result.success) {
        toast.error("Error", { description: result.error });
      } else {
        toast.success("Success", { description: result.message });
      }
    } catch (error) {
      toast.error("Error", { description: "Failed to clear list" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNew = async () => {
    if (
      !confirm(
        "This will archive your current list and start a new one. Continue?"
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await startNewShoppingList();

      if (!result.success) {
        toast.error("Error", { description: result.error });
      } else {
        toast.success("Success", { description: result.message });
      }
    } catch (error) {
      toast.error("Error", { description: "Failed to start new list" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">
            {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" disabled={isLoading}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Rename List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleClear}
              disabled={recipeCount === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Recipes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleStartNew}>
              <Plus className="mr-2 h-4 w-4" />
              Start New List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Shopping List</DialogTitle>
            <DialogDescription>
              Give your shopping list a new name
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title">List Name</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="My Shopping List"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isLoading}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
