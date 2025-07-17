import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { dishAPI } from "@/api/dishes";
import { DishWithIngredients, ScaledIngredient } from "@/types/database";
import { Search, Edit, Calculator } from "lucide-react";
import EditDish from "./EditDish";

interface SearchDishProps {
  onDishUpdated?: () => void;
}

export default function SearchDish({ onDishUpdated }: SearchDishProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DishWithIngredients[]>([]);
  const [selectedDish, setSelectedDish] = useState<DishWithIngredients | null>(
    null,
  );
  const [targetServings, setTargetServings] = useState("");
  const [scaledIngredients, setScaledIngredients] = useState<
    ScaledIngredient[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a dish name to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await dishAPI.searchDishes(searchTerm.trim());
      setSearchResults(results);

      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No dishes found matching your search.",
        });
      }
    } catch (error) {
      console.error("Error searching dishes:", error);
      toast({
        title: "Error",
        description: "Failed to search dishes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectDish = (dish: DishWithIngredients) => {
    setSelectedDish(dish);
    setTargetServings("");
    setScaledIngredients([]);
  };

  const calculateIngredients = () => {
    if (!selectedDish || !targetServings) {
      toast({
        title: "Error",
        description: "Please enter the number of people to serve.",
        variant: "destructive",
      });
      return;
    }

    const target = parseInt(targetServings);
    if (target <= 0) {
      toast({
        title: "Error",
        description: "Number of servings must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const scaled = dishAPI.scaleIngredients(
      selectedDish.ingredients,
      selectedDish.base_servings,
      target,
    );

    setScaledIngredients(scaled);
  };

  const handleEditComplete = (updatedDish: DishWithIngredients) => {
    setSelectedDish(updatedDish);
    setIsEditing(false);

    // Update search results if the dish is in the current results
    setSearchResults((prev) =>
      prev.map((dish) => (dish.id === updatedDish.id ? updatedDish : dish)),
    );

    // Recalculate scaled ingredients if they were showing
    if (scaledIngredients.length > 0 && targetServings) {
      const scaled = dishAPI.scaleIngredients(
        updatedDish.ingredients,
        updatedDish.base_servings,
        parseInt(targetServings),
      );
      setScaledIngredients(scaled);
    }

    onDishUpdated?.();
  };

  if (isEditing && selectedDish) {
    return (
      <EditDish
        dish={selectedDish}
        onSave={handleEditComplete}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Search Dishes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter dish name to search..."
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchResults.map((dish) => (
                  <div
                    key={dish.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDish?.id === dish.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => selectDish(dish)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{dish.name}</h3>
                        <p className="text-sm text-gray-600">
                          Base servings: {dish.base_servings} | Ingredients:{" "}
                          {dish.ingredients.length}
                        </p>
                      </div>
                      {selectedDish?.id === dish.id && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Dish Calculator */}
        {selectedDish && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculate Ingredients for: {selectedDish.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="targetServings">
                    Number of People to Serve
                  </Label>
                  <Input
                    id="targetServings"
                    type="number"
                    min="1"
                    value={targetServings}
                    onChange={(e) => setTargetServings(e.target.value)}
                    placeholder={`Original recipe serves ${selectedDish.base_servings}`}
                  />
                </div>
                <Button onClick={calculateIngredients}>Calculate</Button>
              </div>

              {scaledIngredients.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Ingredients for {targetServings} people:
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scaledIngredients.map((ingredient, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {ingredient.name}
                          </TableCell>
                          <TableCell>{ingredient.quantity}</TableCell>
                          <TableCell>{ingredient.metric}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
