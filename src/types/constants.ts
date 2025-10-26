export const INGREDIENT_AISLES = [
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
] as const;

export const INGREDIENT_UNITS = [
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
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
