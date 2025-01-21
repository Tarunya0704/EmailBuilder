import { NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import {Template }from "@/src/models/template" // Assuming you have this model defined

export async function POST(request: Request) {
  try {
    await connectDB()
    const data = await request.json()
    const template = await Template.create(data)
    return NextResponse.json(template)
  } catch (error: unknown) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const templates = await Template.find().sort({ createdAt: -1 })
    return NextResponse.json(templates)
  } catch (error: unknown) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

