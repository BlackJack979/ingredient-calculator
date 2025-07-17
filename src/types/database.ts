export interface Dish {
  id: string;
  name: string;
  base_servings: number;
  created_at?: string;
  updated_at?: string;
}

export interface Ingredient {
  id: string;
  dish_id: string;
  name: string;
  quantity: number;
  metric: string;
  created_at?: string;
  updated_at?: string;
}

export interface DishWithIngredients extends Dish {
  ingredients: Ingredient[];
}

export interface ScaledIngredient {
  name: string;
  quantity: number;
  metric: string;
}

export const METRICS = [
  "grams",
  "kilograms",
  "pounds",
  "tbsp",
  "tsp",
  "ml",
  "liters",
  "fl oz",
  "cups",
  "pieces",
] as const;

export type Metric = (typeof METRICS)[number];
