import React, { useState, useEffect } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { dishAPI } from "@/api/dishes";
import { DishWithIngredients, ScaledIngredient } from "@/types/database";
import { Search, Edit, Calculator, ChevronDown } from "lucide-react";
import EditDish from "./EditDish";

interface SearchDishProps {
  onDishUpdated?: () => void;
}

export default function SearchDish({ onDishUpdated }: SearchDishProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allDishes, setAllDishes] = useState<DishWithIngredients[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<DishWithIngredients[]>(
    [],
  );
  const [selectedDish, setSelectedDish] = useState<DishWithIngredients | null>(
    null,
  );
  const [targetServings, setTargetServings] = useState("");
  const [scaledIngredients, setScaledIngredients] = useState<
    ScaledIngredient[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Load all dishes on component mount
  useEffect(() => {
    const loadAllDishes = async () => {
      setIsLoading(true);
      try {
        // Search with empty string to get all dishes
        const dishes = await dishAPI.searchDishes("");
        setAllDishes(dishes);
        setFilteredDishes(dishes);
      } catch (error) {
        console.error("Error loading dishes:", error);
        toast({
          title: "Error",
          description: "Failed to load dishes. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAllDishes();
  }, [toast]);

  // Filter dishes based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDishes(allDishes);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = allDishes.filter((dish) =>
        dish.name.toLowerCase().includes(searchLower),
      );

      // Sort so that dishes starting with the search term appear first
      const sorted = filtered.sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(searchLower);
        const bStartsWith = b.name.toLowerCase().startsWith(searchLower);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      });

      setFilteredDishes(sorted);
    }
  }, [searchTerm, allDishes]);

  const selectDish = (dish: DishWithIngredients) => {
    setSelectedDish(dish);
    setTargetServings("");
    setScaledIngredients([]);
    setSearchTerm(dish.name);
    setOpen(false);
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

    // Update all dishes if the dish is in the current results
    setAllDishes((prev) =>
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
            <div className="space-y-4">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedDish ? selectedDish.name : "Select a dish..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search dishes..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isLoading ? "Loading dishes..." : "No dishes found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredDishes.map((dish) => (
                          <CommandItem
                            key={dish.id}
                            value={dish.name}
                            onSelect={() => selectDish(dish)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{dish.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {dish.base_servings} servings •{" "}
                                {dish.ingredients.length} ingredients
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Selected Dish Info */}
        {selectedDish && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Selected Dish: {selectedDish.name}</span>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Base servings: {selectedDish.base_servings} | Ingredients:{" "}
                {selectedDish.ingredients.length}
              </p>
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
