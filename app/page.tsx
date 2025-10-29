"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Debounce query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [query]);

  // Trigger search whenever debouncedQuery changes
  useEffect(() => {
    if (!debouncedQuery.trim()) return;

    async function searchRecipes() {
      setLoading(true);
      setSelectedRecipe(null); // clear any open recipe
      try {
        const res = await fetch(`/api?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        setRecipes(data.results || []);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    }

    searchRecipes();
  }, [debouncedQuery]);

  async function fetchRecipeDetails(id: number) {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/details?id=${id}`);
      const data = await res.json();
      setSelectedRecipe(data);
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-black flex items-center justify-center px-4 py-10">
      <main className="w-full max-w-5xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xl rounded-2xl p-10 flex flex-col items-center transition-all">
        <h1 className="text-5xl font-bold text-amber-700 dark:text-amber-400 mb-6 text-center">
          Recipe Finder
        </h1>

        <div className="w-full flex flex-col sm:flex-row gap-4 mb-12">
          <input
            type="text"
            placeholder="Search for a recipe..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-full border border-amber-300 px-6 py-3 text-lg text-zinc-900 dark:text-white dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>

        {loading && <p className="text-zinc-600 dark:text-zinc-300">Loading recipes...</p>}

        {!loading && recipes.length === 0 && query && (
          <p className="text-zinc-600 dark:text-zinc-300">No recipes found for "{query}".</p>
        )}

        {!selectedRecipe && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-zinc-800 hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                onClick={() => fetchRecipeDetails(recipe.id)}
              >
                <div className="relative w-full h-48">
                  <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">{recipe.title}</h2>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">Tap to view recipe ↓</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedRecipe && (
          <div className="w-full mt-6 text-left">
            {detailsLoading ? (
              <p className="text-zinc-600 dark:text-zinc-300">Loading recipe details...</p>
            ) : (
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium self-start"
                >
                  ← Back to results
                </button>

                <h2 className="text-3xl font-bold text-zinc-800 dark:text-white">
                  {selectedRecipe.title}
                </h2>

                <div className="relative w-full h-72 rounded-xl overflow-hidden">
                  <Image
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    Ingredients:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
                    {selectedRecipe.extendedIngredients?.map((ing: any) => (
                      <li key={ing.id}>{ing.original}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-3">
                    Instructions:
                  </h3>

                  {selectedRecipe.instructions ? (
                    <div className="flex flex-col gap-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {selectedRecipe.instructions
                        //Remove HTML tags like <ol>, <li>, <p>, etc.
                        .replace(/<[^>]+>/g, " ")
                        //Split into sentences/steps
                        .split(/(?<=[.?!])\s+(?=[A-Z])/)
                        .filter((step: string) => step.trim().length > 0)
                        .map((step: string, index: number) => (
                          <p
                            key={index}
                            className="bg-amber-50/40 dark:bg-zinc-800/60 rounded-lg px-4 py-3 shadow-sm"
                          >
                            {/* //Add step number before the text */}
                            {index + 1}. {step.trim()}
                          </p>
                        ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic">No instructions available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
