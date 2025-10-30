"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

type Ingredient = { id: number; original: string };
type Recipe = {
  id: number;
  title: string;
  image: string;
  extendedIngredients?: Ingredient[];
  instructions?: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setRecipes([]);
      return;
    }

    async function fetchRecipes() {
      setLoading(true);
      setError(null);
      setSelectedRecipe(null);
      try {
        const res = await fetch(`/api?q=${encodeURIComponent(debouncedQuery)}`);
        if (!res.ok) throw new Error("Failed to fetch recipes");
        const data = await res.json();
        setRecipes(data.results || []);
      } catch (err) {
        setError("Could not fetch recipes. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [debouncedQuery]);

  async function fetchRecipeDetails(id: number) {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/details?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch recipe details");
      const data = await res.json();
      setSelectedRecipe(data);
    } catch {
      setError("Could not load recipe details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <div
      className={`${poppins.className} min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black flex items-center justify-center px-4 py-10`}
    >
      <main className="w-full max-w-6xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 flex flex-col items-center transition-all">
        <h1 className="text-6xl font-extrabold text-amber-700 dark:text-amber-400 mb-8 text-center tracking-tight">
          Recipe Finder 🍳
        </h1>

        {/* Search bar */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-4 mb-12">
          <input
            type="text"
            placeholder="Search for a recipe..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-full border border-amber-300 px-6 py-4 text-lg text-zinc-900 dark:text-white dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50 shadow-sm transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Loading & errors */}
        {loading && (
          <div className="animate-pulse text-zinc-600 dark:text-zinc-400">Fetching recipes...</div>
        )}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        {/* Results */}
        {!loading && !selectedRecipe && recipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => fetchRecipeDetails(recipe.id)}
                className="group rounded-3xl overflow-hidden shadow-lg bg-white dark:bg-zinc-800 hover:shadow-amber-300/40 dark:hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative w-full h-56">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-zinc-800 dark:text-white mb-2">
                    {recipe.title}
                  </h2>
                  <p className="text-sm text-amber-600 dark:text-amber-400 opacity-90">
                    Tap to view details ↓
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && recipes.length === 0 && query && !error && (
          <p className="text-zinc-600 dark:text-zinc-300 text-lg">
            No recipes found for “{query}”.
          </p>
        )}

        {/* Recipe details */}
        {selectedRecipe && (
          <div className="w-full mt-6 text-left">
            {detailsLoading ? (
              <p className="text-zinc-600 dark:text-zinc-400 animate-pulse">Loading details...</p>
            ) : (
              <div className="flex flex-col gap-8">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium self-start transition-colors"
                >
                  ← Back to results
                </button>

                <h2 className="text-4xl font-extrabold text-zinc-800 dark:text-white">
                  {selectedRecipe.title}
                </h2>

                <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Ingredients */}
                  <div className="bg-amber-50/60 dark:bg-zinc-800/60 p-6 rounded-2xl shadow-inner">
                    <h3 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-3">
                      🧂 Ingredients
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300 max-h-64 overflow-y-auto">
                      {selectedRecipe.extendedIngredients?.map((ing) => (
                        <li key={ing.id}>{ing.original}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div className="bg-amber-50/60 dark:bg-zinc-800/60 p-6 rounded-2xl shadow-inner">
                    <h3 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-3">
                      🥣 Instructions
                    </h3>
                    {selectedRecipe.instructions ? (
                      <div className="flex flex-col gap-3 text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-64 overflow-y-auto">
                        {selectedRecipe.instructions
                          .replace(/<[^>]+>/g, " ")
                          .split(/(?<=[.?!])\s+(?=[A-Z])/)
                          .filter((step) => step.trim().length > 0)
                          .map((step, index) => (
                            <p
                              key={index}
                              className="bg-white/60 dark:bg-zinc-700/60 rounded-lg px-4 py-3 shadow-sm"
                            >
                              {index + 1}. {step.trim()}
                            </p>
                          ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500 italic">No instructions available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
