import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing recipe ID" }, { status: 400 });

    const res = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${process.env.RECIPE_API_KEY}`
    );

    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch recipe details" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
}
