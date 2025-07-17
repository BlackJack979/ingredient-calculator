import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { dishAPI } from "@/api/dishes";
import { METRICS } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";

interface IngredientForm {
  name: string;
  quantity: string;
  metric: string;
}

interface AddDishProps {
  onDishAdded?: () => void;
}

export default function AddDish({ onDishAdded }: AddDishProps = {}) {
  const [dishName, setDishName] = useState("");
  const [baseServings, setBaseServings] = useState("");
  const [ingredients, setIngredients] = useState<IngredientForm[]>([
    { name: "", quantity: "", metric: "grams" },
    { name: "", quantity: "", metric: "grams" },
    { name: "", quantity: "", metric: "grams" },
    { name: "", quantity: "", metric: "grams" },
    { name: "", quantity: "", metric: "grams" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", quantity: "", metric: "grams" },
    ]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (
    index: number,
    field: keyof IngredientForm,
    value: string,
  ) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dishName.trim() || !baseServings) {
      toast({
        title: "Error",
        description: "Please fill in dish name and base servings.",
        variant: "destructive",
      });
      return;
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.quantity && parseFloat(ing.quantity) > 0,
    );

    if (validIngredients.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid ingredient.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await dishAPI.createDish({
        name: dishName.trim(),
        base_servings: parseInt(baseServings),
        ingredients: validIngredients.map((ing) => ({
          name: ing.name.trim(),
          quantity: parseFloat(ing.quantity),
          metric: ing.metric,
        })),
      });

      toast({
        title: "Success",
        description: `Dish "${dishName}" has been added successfully!`,
      });

      // Reset form
      setDishName("");
      setBaseServings("");
      setIngredients([
        { name: "", quantity: "", metric: "grams" },
        { name: "", quantity: "", metric: "grams" },
        { name: "", quantity: "", metric: "grams" },
        { name: "", quantity: "", metric: "grams" },
        { name: "", quantity: "", metric: "grams" },
      ]);

      onDishAdded?.();
    } catch (error) {
      console.error("Error adding dish:", error);
      toast({
        title: "Error",
        description: "Failed to add dish. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Add New Dish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dishName">Dish Name</Label>
                <Input
                  id="dishName"
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Enter dish name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseServings">Base Servings</Label>
                <Input
                  id="baseServings"
                  type="number"
                  min="1"
                  value={baseServings}
                  onChange={(e) => setBaseServings(e.target.value)}
                  placeholder="Number of people this recipe serves"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Ingredients</Label>
                <Button
                  type="button"
                  onClick={addIngredient}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Ingredient
                </Button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <Label className="text-sm">Ingredient Name</Label>
                      <Input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(index, "name", e.target.value)
                        }
                        placeholder="e.g., Flour"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(index, "quantity", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Unit</Label>
                      <Select
                        value={ingredient.metric}
                        onValueChange={(value) =>
                          updateIngredient(index, "metric", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {METRICS.map((metric) => (
                            <SelectItem key={metric} value={metric}>
                              {metric}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto"
                        disabled={ingredients.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding Dish..." : "Save Dish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
