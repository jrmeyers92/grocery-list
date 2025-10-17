"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Step } from "@/types/database.types";
import { useState } from "react";

interface RecipeStepsProps {
  steps: Step[];
}

export default function RecipeSteps({ steps }: RecipeStepsProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps.map((step) => {
          const isChecked = checkedSteps.has(step.id);
          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {step.step_number}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleStep(step.id)}
                    className="mt-1"
                  />
                  <p
                    className={`text-sm leading-relaxed cursor-pointer ${
                      isChecked ? "line-through text-muted-foreground" : ""
                    }`}
                    onClick={() => toggleStep(step.id)}
                  >
                    {step.instruction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {steps.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No instructions listed
          </p>
        )}
      </CardContent>
    </Card>
  );
}
