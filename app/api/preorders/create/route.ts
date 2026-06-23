import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapterFactory = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter: adapterFactory as any });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (
      !body.products ||
      typeof body.products !== "number" ||
      body.products < 1
    ) {
      return NextResponse.json(
        { error: "Products is required and must be a positive number" },
        { status: 400 },
      );
    }

    if (!body.preorderWhen || body.preorderWhen !== "regardless_of_stock") {
      return NextResponse.json(
        { error: "preorderWhen is required and must be 'regardless_of_stock'" },
        { status: 400 },
      );
    }

    if (!body.startsAt) {
      return NextResponse.json(
        { error: "startsAt is required" },
        { status: 400 },
      );
    }

    // Validate and parse startsAt date
    const startsAt = new Date(body.startsAt);
    if (isNaN(startsAt.getTime())) {
      return NextResponse.json(
        { error: "startsAt must be a valid date" },
        { status: 400 },
      );
    }

    // Parse endsAt date if provided (nullable)
    let endsAt = null;
    if (body.endsAt) {
      endsAt = new Date(body.endsAt);
      if (isNaN(endsAt.getTime())) {
        return NextResponse.json(
          { error: "endsAt must be a valid date or null" },
          { status: 400 },
        );
      }

      // Validate that endsAt is after startsAt
      if (endsAt <= startsAt) {
        return NextResponse.json(
          { error: "endsAt must be after startsAt" },
          { status: 400 },
        );
      }
    }

    // Create the preorder
    const newPreorder = await prisma.preorder.create({
      data: {
        name: body.name.trim(),
        products: body.products,
        preorderWhen: body.preorderWhen,
        startsAt,
        endsAt,
        status: body.status !== undefined ? body.status : true, // Default to active
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Preorder created successfully",
        data: newPreorder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating preorder:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create preorder",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
