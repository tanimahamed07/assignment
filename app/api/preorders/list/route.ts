import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapterFactory = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter: adapterFactory as any });

type FilterType = "all" | "active" | "inactive";
type SortByType = "name" | "products" | "startsAt";
type SortOrderType = "asc" | "desc";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract and validate query parameters
    const filter: FilterType = body.filter || "all";
    const sortBy: SortByType = body.sortBy || "name";
    const sortOrder: SortOrderType = body.sortOrder || "asc";
    const page: number = parseInt(body.page) || 1;
    const limit: number = parseInt(body.limit) || 10;

    // Validate filter
    if (!["all", "active", "inactive"].includes(filter)) {
      return NextResponse.json(
        { error: "Invalid filter. Must be 'all', 'active', or 'inactive'" },
        { status: 400 },
      );
    }

    // Validate sortBy
    if (!["name", "products", "startsAt"].includes(sortBy)) {
      return NextResponse.json(
        { error: "Invalid sortBy. Must be 'name', 'products', or 'startsAt'" },
        { status: 400 },
      );
    }

    // Validate sortOrder
    if (!["asc", "desc"].includes(sortOrder)) {
      return NextResponse.json(
        { error: "Invalid sortOrder. Must be 'asc' or 'desc'" },
        { status: 400 },
      );
    }

    // Validate pagination
    if (page < 1) {
      return NextResponse.json(
        { error: "Page must be greater than 0" },
        { status: 400 },
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 },
      );
    }

    // Build where clause based on filter
    const where =
      filter === "all"
        ? {}
        : filter === "active"
          ? { status: true }
          : { status: false };

    // Build orderBy clause
    const orderBy = {
      [sortBy]: sortOrder,
    };

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute Prisma queries
    const [preorders, totalCount] = await Promise.all([
      prisma.preorder.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.preorder.count({
        where,
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: preorders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filter,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    console.error("Error fetching preorders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch preorders",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
