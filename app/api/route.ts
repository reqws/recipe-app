import { NextResponse } from "next/server";

export async function GET(req: Request) {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    // If no search query is provided, return an empty results array
    if (!query) {
        return NextResponse.json({ results: [] });
    }

    // Retrieve the Spoonacular API key from environment variables
    const apiKey = process.env.RECIPE_API_KEY;

    // Call the Spoonacular "complexSearch" endpoint using the query
    const res = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`
    );

    // If the external API request fails, return a 500 error
    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
    }

    // Parse the response data and return it to the client
    const data = await res.json();
    return NextResponse.json(data);
}
