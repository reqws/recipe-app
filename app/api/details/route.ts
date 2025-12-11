import { NextResponse } from "next/server";

export async function GET(req: Request) {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // If no recipe ID is provided, return a 400 error
    if (!id) return NextResponse.json({ error: "Missing recipe ID" }, { status: 400 });

    // Fetch recipe details from the Spoonacular API
    const res = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${process.env.RECIPE_API_KEY}`
    );

    // Handle failed API request
    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch recipe details" }, { status: 500 });
    }

    // Parse the successful response and return the recipe data as JSON
    const data = await res.json();
    return NextResponse.json(data);
}
