// Test script for the preorders list API
// Run with: npx tsx test-api.ts

const API_URL = "http://localhost:3000/api/preorders/list";

async function testAPI() {
  console.log("🧪 Testing Preorders List API\n");

  // Test 1: Get all preorders (default pagination)
  console.log("1️⃣ Test: Get all preorders (page 1, limit 10)");
  const test1 = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const result1 = await test1.json();
  console.log(`   ✓ Total count: ${result1.pagination.totalCount}`);
  console.log(`   ✓ Returned: ${result1.data.length} records\n`);

  // Test 2: Get active preorders only
  console.log("2️⃣ Test: Get active preorders only");
  const test2 = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: "active" }),
  });
  const result2 = await test2.json();
  console.log(`   ✓ Active preorders: ${result2.pagination.totalCount}`);
  console.log(
    `   ✓ All have status=true: ${result2.data.every((p: any) => p.status === true)}\n`,
  );

  // Test 3: Get inactive preorders only
  console.log("3️⃣ Test: Get inactive preorders only");
  const test3 = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: "inactive" }),
  });
  const result3 = await test3.json();
  console.log(`   ✓ Inactive preorders: ${result3.pagination.totalCount}`);
  console.log(
    `   ✓ All have status=false: ${result3.data.every((p: any) => p.status === false)}\n`,
  );

  // Test 4: Sort by products descending
  console.log("4️⃣ Test: Sort by products (descending)");
  const test4 = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sortBy: "products", sortOrder: "desc", limit: 5 }),
  });
  const result4 = await test4.json();
  console.log(`   ✓ Top 5 by products:`);
  result4.data.forEach((p: any) => {
    console.log(`     - ${p.name}: ${p.products} products`);
  });
  console.log();

  // Test 5: Sort by startsAt ascending
  console.log("5️⃣ Test: Sort by startsAt (ascending)");
  const test5 = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sortBy: "startsAt", sortOrder: "asc", limit: 5 }),
  });
  const result5 = await test5.json();
  console.log(`   ✓ First 5 by start date:`);
  result5.data.forEach((p: any) => {
    console.log(
      `     - ${p.name}: ${new Date(p.startsAt).toLocaleDateString()}`,
    );
  });
  console.log();

  // Test 6: Pagination (page 2)
  console.log("6️⃣ Test: Pagination (page 2, limit 5)");
  const test6 = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page: 2, limit: 5 }),
  });
  const result6 = await test6.json();
  console.log(`   ✓ Page: ${result6.pagination.page}`);
  console.log(`   ✓ Has next page: ${result6.pagination.hasNextPage}`);
  console.log(`   ✓ Has previous page: ${result6.pagination.hasPreviousPage}`);
  console.log(`   ✓ Total pages: ${result6.pagination.totalPages}\n`);

  // Test 7: Sort by name (default)
  console.log("7️⃣ Test: Sort by name (ascending - default)");
  const test7 = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sortBy: "name", limit: 5 }),
  });
  const result7 = await test7.json();
  console.log(`   ✓ First 5 alphabetically:`);
  result7.data.forEach((p: any) => {
    console.log(`     - ${p.name}`);
  });
  console.log();

  console.log("✅ All tests completed!");
}

testAPI().catch(console.error);
