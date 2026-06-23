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

    // Parse request body
    const body = await request.json();

    // Validate status field
    if (typeof body.status !== "boolean") {
      return NextResponse.json(
        { error: "Invalid status. Must be a boolean value (true or false)" },
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

    // Update the preorder status
    const updatedPreorder = await prisma.preorder.update({
      where: { id: preorderId },
      data: { status: body.status },
    });

    return NextResponse.json({
      success: true,
      message: `Preorder status updated to ${body.status ? "Active" : "Inactive"}`,
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

export async function DELETE(
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

    // Delete the preorder
    const deletedPreorder = await prisma.preorder.delete({
      where: { id: preorderId },
    });

    return NextResponse.json({
      success: true,
      message: `Preorder "${deletedPreorder.name}" successfully deleted`,
      data: deletedPreorder,
    });
  } catch (error) {
    console.error("Error deleting preorder:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete preorder",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
