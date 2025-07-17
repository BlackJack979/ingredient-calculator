import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import AddDish from "./AddDish";
import SearchDish from "./SearchDish";
import { ChefHat, Plus, Search } from "lucide-react";

type View = "home" | "add" | "search";

function Home() {
  const [currentView, setCurrentView] = useState<View>("home");

  const renderView = () => {
    switch (currentView) {
      case "add":
        return <AddDish onDishAdded={() => setCurrentView("home")} />;
      case "search":
        return <SearchDish onDishUpdated={() => {}} />;
      default:
        return (
          <div className="bg-white min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <ChefHat className="h-12 w-12 text-primary" />
                  <h1 className="text-4xl font-bold text-gray-900">
                    Ingredient Calculator
                  </h1>
                </div>
                <p className="text-lg text-gray-600">
                  Manage your kitchen recipes and scale ingredients for any
                  number of servings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setCurrentView("add")}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Plus className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Add New Dish</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Create a new recipe with ingredients and serving
                      information
                    </p>
                    <Button
                      className="w-full mt-4"
                      onClick={() => setCurrentView("add")}
                    >
                      Add Dish
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setCurrentView("search")}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Search className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Search Dishes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Find existing recipes and scale ingredients for different
                      serving sizes
                    </p>
                    <Button
                      className="w-full mt-4"
                      onClick={() => setCurrentView("search")}
                    >
                      Search Dishes
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-12 text-center">
                <h2 className="text-2xl font-semibold mb-4">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold text-lg">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Add Your Recipes</h3>
                    <p className="text-sm text-gray-600">
                      Enter dish names, ingredients, quantities, and base
                      serving sizes
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold text-lg">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Search & Select</h3>
                    <p className="text-sm text-gray-600">
                      Find your saved recipes by name and select the one you
                      need
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold text-lg">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Scale Ingredients</h3>
                    <p className="text-sm text-gray-600">
                      Enter your target serving size and get automatically
                      calculated ingredient amounts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {currentView !== "home" && (
        <div className="fixed top-4 left-4 z-10">
          <Button
            onClick={() => setCurrentView("home")}
            variant="outline"
            className="bg-white shadow-md"
          >
            ← Back to Home
          </Button>
        </div>
      )}
      {renderView()}
      <Toaster />
    </>
  );
}

export default Home;
