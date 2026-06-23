import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapterFactory = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter: adapterFactory as any });

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Validate ID parameter
    const preorderId = parseInt(id);
    if (isNaN(preorderId) || preorderId < 1) {
      return NextResponse.json(
        { error: "Invalid ID. Must be a positive integer" },
        { status: 400 },
      );
    }

    // Check if preorder exists
    const existingPreorder = await prisma.preorder.findUnique({
      where: { id: preorderId },
    });

    if (!existingPreorder) {
      return NextResponse.json(
        { error: `Preorder with ID ${preorderId} not found` },
        { status: 404 },
      );
    }

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

    if (typeof body.status !== "boolean") {
      return NextResponse.json(
        { error: "status is required and must be a boolean" },
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

    // Update the preorder
    const updatedPreorder = await prisma.preorder.update({
      where: { id: preorderId },
      data: {
        name: body.name.trim(),
        products: body.products,
        preorderWhen: body.preorderWhen,
        startsAt,
        endsAt,
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Preorder updated successfully",
      data: updatedPreorder,
    });
  } catch (error) {
    console.error("Error updating preorder:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update preorder",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
