export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      grocerylist_recipe_ingredients: {
        Row: {
          aisle: Database["public"]["Enums"]["ingredient_aisles"] | null;
          created_at: string | null;
          id: string;
          name_norm: string | null;
          name_raw: string;
          notes: string | null;
          owner_id: string;
          quantity: number;
          recipe_id: string | null;
          unit: Database["public"]["Enums"]["ingredient_units"];
        };
        Insert: {
          aisle?: Database["public"]["Enums"]["ingredient_aisles"] | null;
          created_at?: string | null;
          id?: string;
          name_norm?: string | null;
          name_raw: string;
          notes?: string | null;
          owner_id: string;
          quantity: number;
          recipe_id?: string | null;
          unit: Database["public"]["Enums"]["ingredient_units"];
        };
        Update: {
          aisle?: Database["public"]["Enums"]["ingredient_aisles"] | null;
          created_at?: string | null;
          id?: string;
          name_norm?: string | null;
          name_raw?: string;
          notes?: string | null;
          owner_id?: string;
          quantity?: number;
          recipe_id?: string | null;
          unit?: Database["public"]["Enums"]["ingredient_units"];
        };
        Relationships: [
          {
            foreignKeyName: "grocerylist_recipe_ingredients_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "grocerylist_recipes";
            referencedColumns: ["id"];
          }
        ];
      };
      grocerylist_recipe_steps: {
        Row: {
          created_at: string | null;
          id: string;
          instruction: string;
          recipe_id: string | null;
          step_number: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          instruction: string;
          recipe_id?: string | null;
          step_number: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          instruction?: string;
          recipe_id?: string | null;
          step_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "grocerylist_recipe_steps_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "grocerylist_recipes";
            referencedColumns: ["id"];
          }
        ];
      };
      grocerylist_recipes: {
        Row: {
          cook_time: number | null;
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_favorite: boolean | null;
          is_public: boolean | null;
          owner_id: string;
          prep_time: number | null;
          servings: number | null;
          tags: string[] | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          cook_time?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_favorite?: boolean | null;
          owner_id: string;
          prep_time?: number | null;
          servings?: number | null;
          tags?: string[] | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          cook_time?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_favorite?: boolean | null;
          owner_id?: string;
          prep_time?: number | null;
          servings?: number | null;
          tags?: string[] | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      grocerylist_shoppinglist: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          owner_id: string;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          owner_id: string;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          owner_id?: string;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      grocerylist_shoppinglist_items: {
        Row: {
          aisle: Database["public"]["Enums"]["ingredient_aisles"] | null;
          created_at: string | null;
          id: string;
          is_checked: boolean | null;
          menu_id: string;
          name: string;
          notes: string | null;
          owner_id: string;
          quantity: number;
          unit: Database["public"]["Enums"]["ingredient_units"];
        };
        Insert: {
          aisle?: Database["public"]["Enums"]["ingredient_aisles"] | null;
          created_at?: string | null;
          id?: string;
          is_checked?: boolean | null;
          menu_id: string;
          name: string;
          notes?: string | null;
          owner_id: string;
          quantity?: number;
          unit?: Database["public"]["Enums"]["ingredient_units"];
        };
        Update: {
          aisle?: Database["public"]["Enums"]["ingredient_aisles"] | null;
          created_at?: string | null;
          id?: string;
          is_checked?: boolean | null;
          menu_id?: string;
          name?: string;
          notes?: string | null;
          owner_id?: string;
          quantity?: number;
          unit?: Database["public"]["Enums"]["ingredient_units"];
        };
        Relationships: [
          {
            foreignKeyName: "grocerylist_shoppinglist_items_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "grocerylist_shoppinglist";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grocerylist_shoppinglist_items_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "v_grocerylist_menu_grocery_list";
            referencedColumns: ["menu_id"];
          }
        ];
      };
      grocerylist_shoppinglist_recipes: {
        Row: {
          added_at: string | null;
          id: string;
          menu_id: string | null;
          owner_id: string;
          recipe_id: string | null;
          serving_multiplier: number | null;
        };
        Insert: {
          added_at?: string | null;
          id?: string;
          menu_id?: string | null;
          owner_id: string;
          recipe_id?: string | null;
          serving_multiplier?: number | null;
        };
        Update: {
          added_at?: string | null;
          id?: string;
          menu_id?: string | null;
          owner_id?: string;
          recipe_id?: string | null;
          serving_multiplier?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "grocerylist_menu_recipes_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "grocerylist_shoppinglist";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grocerylist_menu_recipes_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "v_grocerylist_menu_grocery_list";
            referencedColumns: ["menu_id"];
          },
          {
            foreignKeyName: "grocerylist_menu_recipes_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "grocerylist_recipes";
            referencedColumns: ["id"];
          }
        ];
      };
      grocerylist_stocked_items: {
        Row: {
          aisle: Database["public"]["Enums"]["ingredient_aisles"];
          always_stocked: boolean;
          created_at: string;
          id: string;
          name: string;
          notes: string | null;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          aisle?: Database["public"]["Enums"]["ingredient_aisles"];
          always_stocked?: boolean;
          created_at?: string;
          id?: string;
          name: string;
          notes?: string | null;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          aisle?: Database["public"]["Enums"]["ingredient_aisles"];
          always_stocked?: boolean;
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_grocerylist_menu_grocery_list: {
        Row: {
          aisle: Database["public"]["Enums"]["ingredient_aisles"] | null;
          base_unit: Database["public"]["Enums"]["ingredient_units"] | null;
          item: string | null;
          menu_id: string | null;
          notes: string[] | null;
          owner_id: string | null;
          total_base_qty: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_clerk_user_id: { Args: never; Returns: string };
      get_grocerylist_menu_grocery_list: {
        Args: { p_menu_id: string };
        Returns: {
          aisle: Database["public"]["Enums"]["ingredient_aisles"];
          base_unit: Database["public"]["Enums"]["ingredient_units"];
          item: string;
          notes: string[];
          total_base_qty: number;
        }[];
      };
      util_base_unit: {
        Args: { u: Database["public"]["Enums"]["ingredient_units"] };
        Returns: Database["public"]["Enums"]["ingredient_units"];
      };
      util_to_base_qty: {
        Args: { q: number; u: Database["public"]["Enums"]["ingredient_units"] };
        Returns: number;
      };
      util_unit_family: {
        Args: { u: Database["public"]["Enums"]["ingredient_units"] };
        Returns: string;
      };
    };
    Enums: {
      ingredient_aisles:
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
      ingredient_units:
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
      specialty_type:
        | "portrait"
        | "wedding"
        | "event"
        | "family"
        | "newborn"
        | "maternity"
        | "headshot"
        | "product"
        | "real-estate"
        | "commercial"
        | "boudoir"
        | "food"
        | "fine-art";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      ingredient_aisles: [
        "produce",
        "meat",
        "seafood",
        "dairy",
        "bakery",
        "canned",
        "dry_goods",
        "frozen",
        "spices",
        "baking",
        "beverages",
        "other",
      ],
      ingredient_units: [
        "unit",
        "tsp",
        "tbsp",
        "cup",
        "ml",
        "l",
        "g",
        "kg",
        "oz",
        "lb",
        "pinch",
        "dash",
      ],
    },
  },
} as const;

// Cleaner type aliases
export type Recipe = Database["public"]["Tables"]["grocerylist_recipes"]["Row"];
export type RecipeInsert =
  Database["public"]["Tables"]["grocerylist_recipes"]["Insert"];
export type RecipeUpdate =
  Database["public"]["Tables"]["grocerylist_recipes"]["Update"];

export type Ingredient =
  Database["public"]["Tables"]["grocerylist_recipe_ingredients"]["Row"];
export type IngredientInsert =
  Database["public"]["Tables"]["grocerylist_recipe_ingredients"]["Insert"];

export type Step =
  Database["public"]["Tables"]["grocerylist_recipe_steps"]["Row"];
export type StepInsert =
  Database["public"]["Tables"]["grocerylist_recipe_steps"]["Insert"];

export type Menu =
  Database["public"]["Tables"]["grocerylist_shoppinglist"]["Row"];
export type MenuRecipe =
  Database["public"]["Tables"]["grocerylist_shoppinglist_recipes"]["Row"];

export type GroceryListItem =
  Database["public"]["Functions"]["get_grocerylist_menu_grocery_list"]["Returns"][0];

// Enums
export type IngredientUnit = Database["public"]["Enums"]["ingredient_units"];
export type IngredientAisle = Database["public"]["Enums"]["ingredient_aisles"];

// Composite types for working with nested data
export type RecipeWithIngredients = Recipe & {
  grocerylist_recipe_ingredients: Ingredient[];
  grocerylist_recipe_steps: Step[];
};
