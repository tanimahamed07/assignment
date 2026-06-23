// Test script for the preorders create API
// Run with: npx tsx test-create-api.ts

const BASE_URL = "http://localhost:3000/api/preorders";

async function testCreateAPI() {
  console.log("🧪 Testing Preorders Create API\n");

  // Test 1: Create a valid preorder
  console.log("1️⃣ Test: Create a new preorder with all fields");
  const test1 = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Product 2027",
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
      endsAt: "2027-12-31T23:59:59Z",
      status: true,
    }),
  });
  const result1 = await test1.json();
  console.log(`   ✓ Status: ${test1.status} (expected 201)`);
  console.log(`   ✓ Success: ${result1.success}`);
  console.log(`   ✓ Message: ${result1.message}`);
  console.log(`   ✓ Created ID: ${result1.data.id}`);
  console.log(`   ✓ Name: ${result1.data.name}`);
  console.log(`   ✓ Products: ${result1.data.products}`);
  console.log(`   ✓ Status: ${result1.data.status ? "Active" : "Inactive"}\n`);

  const createdId = result1.data.id;

  // Test 2: Create without endsAt (nullable)
  console.log("2️⃣ Test: Create preorder without endsAt");
  const test2 = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "No End Date Product",
      products: 50,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-06-01T00:00:00Z",
    }),
  });
  const result2 = await test2.json();
  console.log(`   ✓ Status: ${test2.status} (expected 201)`);
  console.log(`   ✓ Created ID: ${result2.data.id}`);
  console.log(`   ✓ endsAt is null: ${result2.data.endsAt === null}\n`);

  const secondId = result2.data.id;

  // Test 3: Create with inactive status
  console.log("3️⃣ Test: Create inactive preorder");
  const test3 = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Inactive Product",
      products: 25,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-03-01T00:00:00Z",
      endsAt: "2027-06-01T00:00:00Z",
      status: false,
    }),
  });
  const result3 = await test3.json();
  console.log(`   ✓ Status: ${test3.status}`);
  console.log(`   ✓ Created ID: ${result3.data.id}`);
  console.log(`   ✓ Status is false: ${result3.data.status === false}\n`);

  const thirdId = result3.data.id;

  // Test 4: Missing required field (name)
  console.log("4️⃣ Test: Create without name (should fail)");
  const test4 = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
    }),
  });
  const result4 = await test4.json();
  console.log(`   ✓ Status: ${test4.status} (expected 400)`);
  console.log(`   ✓ Error: ${result4.error}\n`);

  // Test 5: Invalid products (negative)
  console.log("5️⃣ Test: Create with invalid products");
  const test5 = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Invalid Product",
      products: -10,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
    }),
  });
  const result5 = await test5.json();
  console.log(`   ✓ Status: ${test5.status} (expected 400)`);
  console.log(`   ✓ Error: ${result5.error}\n`);

  // Test 6: Invalid date format
  console.log("6️⃣ Test: Create with invalid date");
  const test6 = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Invalid Date Product",
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "not-a-date",
    }),
  });
  const result6 = await test6.json();
  console.log(`   ✓ Status: ${test6.status} (expected 400)`);
  console.log(`   ✓ Error: ${result6.error}\n`);

  // Test 7: endsAt before startsAt
  console.log("7️⃣ Test: Create with endsAt before startsAt");
  const test7 = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Invalid Range Product",
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-12-01T00:00:00Z",
      endsAt: "2027-01-01T00:00:00Z",
    }),
  });
  const result7 = await test7.json();
  console.log(`   ✓ Status: ${test7.status} (expected 400)`);
  console.log(`   ✓ Error: ${result7.error}\n`);

  // Test 8: Invalid preorderWhen value
  console.log("8️⃣ Test: Create with invalid preorderWhen");
  const test8 = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Invalid Preorder When",
      products: 100,
      preorderWhen: "invalid_value",
      startsAt: "2027-01-01T00:00:00Z",
    }),
  });
  const result8 = await test8.json();
  console.log(`   ✓ Status: ${test8.status} (expected 400)`);
  console.log(`   ✓ Error: ${result8.error}\n`);

  // Test 9: Verify created preorders exist in list
  console.log("9️⃣ Test: Verify created preorders exist");
  const listResponse = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sortBy: "id", sortOrder: "desc", limit: 5 }),
  });
  const listResult = await listResponse.json();
  const createdIds = [createdId, secondId, thirdId];
  const foundInList = createdIds.every((id) =>
    listResult.data.some((p: any) => p.id === id),
  );
  console.log(`   ✓ All created preorders found in list: ${foundInList}\n`);

  // Test 10: Get one of the created preorders
  console.log("🔟 Test: Get created preorder by ID");
  const getResponse = await fetch(`${BASE_URL}/${createdId}`, {
    method: "GET",
  });
  const getResult = await getResponse.json();
  console.log(`   ✓ Found: ${getResult.data.name}`);
  console.log(`   ✓ Products: ${getResult.data.products}`);
  console.log(
    `   ✓ Matches created data: ${getResult.data.name === "Test Product 2027"}\n`,
  );

  // Cleanup: Delete the test preorders
  console.log("🧹 Cleanup: Deleting test preorders...");
  for (const id of [createdId, secondId, thirdId]) {
    await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  }
  console.log(`   ✓ Deleted ${createdIds.length} test preorders\n`);

  console.log("✅ All create tests completed!");
}

testCreateAPI().catch(console.error);
