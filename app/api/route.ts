import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.RECIPE_API_KEY;

    const res = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`
    );

    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
}
