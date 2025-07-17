import { supabase } from "@/lib/supabase";
import {
  Dish,
  Ingredient,
  DishWithIngredients,
  ScaledIngredient,
} from "@/types/database";

export const dishAPI = {
  // Create a new dish with ingredients
  async createDish(dishData: {
    name: string;
    base_servings: number;
    ingredients: Array<{
      name: string;
      quantity: number;
      metric: string;
    }>;
  }): Promise<DishWithIngredients> {
    // Insert dish
    const { data: dish, error: dishError } = await supabase
      .from("dishes")
      .insert({
        name: dishData.name,
        base_servings: dishData.base_servings,
      })
      .select()
      .single();

    if (dishError) throw dishError;

    // Insert ingredients
    const ingredientsToInsert = dishData.ingredients.map((ingredient) => ({
      dish_id: dish.id,
      name: ingredient.name,
      quantity: ingredient.quantity,
      metric: ingredient.metric,
    }));

    const { data: ingredients, error: ingredientsError } = await supabase
      .from("ingredients")
      .insert(ingredientsToInsert)
      .select();

    if (ingredientsError) throw ingredientsError;

    return {
      ...dish,
      ingredients: ingredients || [],
    };
  },

  // Search dishes by name
  async searchDishes(searchTerm: string): Promise<DishWithIngredients[]> {
    const { data: dishes, error } = await supabase
      .from("dishes")
      .select(
        `
        *,
        ingredients (*)
      `,
      )
      .ilike("name", `%${searchTerm}%`)
      .order("name");

    if (error) throw error;

    return dishes || [];
  },

  // Get dish by ID with ingredients
  async getDishById(id: string): Promise<DishWithIngredients | null> {
    const { data: dish, error } = await supabase
      .from("dishes")
      .select(
        `
        *,
        ingredients (*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return dish;
  },

  // Update dish
  async updateDish(
    id: string,
    dishData: {
      name: string;
      base_servings: number;
      ingredients: Array<{
        id?: string;
        name: string;
        quantity: number;
        metric: string;
      }>;
    },
  ): Promise<DishWithIngredients> {
    // Update dish
    const { data: dish, error: dishError } = await supabase
      .from("dishes")
      .update({
        name: dishData.name,
        base_servings: dishData.base_servings,
      })
      .eq("id", id)
      .select()
      .single();

    if (dishError) throw dishError;

    // Delete existing ingredients
    await supabase.from("ingredients").delete().eq("dish_id", id);

    // Insert new ingredients
    const ingredientsToInsert = dishData.ingredients.map((ingredient) => ({
      dish_id: id,
      name: ingredient.name,
      quantity: ingredient.quantity,
      metric: ingredient.metric,
    }));

    const { data: ingredients, error: ingredientsError } = await supabase
      .from("ingredients")
      .insert(ingredientsToInsert)
      .select();

    if (ingredientsError) throw ingredientsError;

    return {
      ...dish,
      ingredients: ingredients || [],
    };
  },

  // Calculate scaled ingredients
  scaleIngredients(
    ingredients: Ingredient[],
    originalServings: number,
    targetServings: number,
  ): ScaledIngredient[] {
    const scaleFactor = targetServings / originalServings;

    return ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: Math.round(ingredient.quantity * scaleFactor * 100) / 100, // Round to 2 decimal places
      metric: ingredient.metric,
    }));
  },
};
