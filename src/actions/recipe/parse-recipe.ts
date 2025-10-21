"use server";

type IngredientUnit =
  | "unit"
  | "tsp"
  | "tbsp"
  | "cup"
  | "ml"
  | "l"
  | "g"
  | "kg"
  | "oz"
  | "lb"
  | "pinch"
  | "dash";
type IngredientAisle =
  | "produce"
  | "meat"
  | "seafood"
  | "dairy"
  | "bakery"
  | "canned"
  | "dry_goods"
  | "frozen"
  | "spices"
  | "baking"
  | "beverages"
  | "other";

interface ParsedRecipe {
  title: string;
  description?: string;
  servings?: number;
  prep_time?: number;
  cook_time?: number;
  ingredients: Array<{
    name_raw: string;
    quantity: number;
    unit: IngredientUnit;
    aisle: IngredientAisle;
    notes: string;
  }>;
  steps: Array<{
    step_number: number;
    instruction: string;
  }>;
}

interface ParseRecipeResult {
  success: boolean;
  data?: ParsedRecipe;
  error?: string;
}

export async function parseRecipe(
  recipeText: string
): Promise<ParseRecipeResult> {
  if (!recipeText.trim()) {
    return {
      success: false,
      error: "Recipe text is required",
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    return {
      success: false,
      error: "API configuration error",
    };
  }

  const prompt = `Parse the following recipe text and extract structured information. Return ONLY valid JSON with no additional text or markdown formatting.

Recipe text:
${recipeText}

Return a JSON object with this exact structure:
{
  "title": "Recipe name",
  "description": "Brief description (optional)",
  "servings": 4,
  "prep_time": 15,
  "cook_time": 30,
  "ingredients": [
    {
      "name_raw": "ingredient name",
      "quantity": 1.5,
      "unit": "cup",
      "aisle": "produce",
      "notes": "chopped, diced, etc"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "instruction": "Step instruction"
    }
  ]
}

Valid units: unit, tsp, tbsp, cup, ml, l, g, kg, oz, lb, pinch, dash
Valid aisles: produce, meat, seafood, dairy, bakery, canned, dry_goods, frozen, spices, baking, beverages, other

Rules:
- Extract all ingredients with their quantities and units
- Number each step sequentially starting from 1
- If a field is missing, omit it or use reasonable defaults
- Ensure quantities are numbers (use decimals for fractions like 1.5 for "1 1/2")
- Map ingredients to the most appropriate aisle
- Always include the "notes" field for each ingredient, even if empty string
- DO NOT include markdown code blocks or any text outside the JSON object
- Respond ONLY with valid JSON`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Anthropic API error:", errorData);
      return {
        success: false,
        error: `API request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    let responseText = data.content[0].text;

    // Strip markdown code blocks if present
    responseText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed: ParsedRecipe = JSON.parse(responseText);

    // Validate required fields
    if (!parsed.title || !parsed.ingredients || !parsed.steps) {
      return {
        success: false,
        error: "Parsed recipe is missing required fields",
      };
    }

    // Ensure notes field exists on all ingredients
    parsed.ingredients = parsed.ingredients.map((ing) => ({
      ...ing,
      notes: ing.notes || "",
    }));

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error("Error parsing recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse recipe",
    };
  }
}
