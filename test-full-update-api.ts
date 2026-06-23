// Test script for the preorders full update API
// Run with: npx tsx test-full-update-api.ts

const BASE_URL = "http://localhost:3000/api/preorders";

async function testFullUpdateAPI() {
  console.log("🧪 Testing Preorders Full Update API\n");

  // Setup: Create a test preorder
  console.log("0️⃣ Setup: Creating test preorder...");
  const createResponse = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Original Product",
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
      endsAt: "2027-12-31T23:59:59Z",
      status: true,
    }),
  });
  const createResult = await createResponse.json();
  const testId = createResult.data.id;
  console.log(`   ✓ Created test preorder ID: ${testId}`);
  console.log(`   ✓ Original name: ${createResult.data.name}\n`);

  // Test 1: Full update with all fields
  console.log("1️⃣ Test: Full update with all fields changed");
  const test1 = await fetch(`${BASE_URL}/${testId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Updated Product Name",
      products: 250,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-06-01T00:00:00Z",
      endsAt: "2027-12-31T23:59:59Z",
      status: false,
    }),
  });
  const result1 = await test1.json();
  console.log(`   ✓ Status: ${test1.status}`);
  console.log(`   ✓ Success: ${result1.success}`);
  console.log(`   ✓ Message: ${result1.message}`);
  console.log(`   ✓ Updated name: ${result1.data.name}`);
  console.log(`   ✓ Updated products: ${result1.data.products}`);
  console.log(
    `   ✓ Updated status: ${result1.data.status ? "Active" : "Inactive"}\n`,
  );

  // Test 2: Verify update persisted
  console.log("2️⃣ Test: Verify update persisted");
  const getResponse = await fetch(`${BASE_URL}/${testId}`, {
    method: "GET",
  });
  const getResult = await getResponse.json();
  console.log(
    `   ✓ Name matches: ${getResult.data.name === "Updated Product Name"}`,
  );
  console.log(`   ✓ Products matches: ${getResult.data.products === 250}`);
  console.log(`   ✓ Status matches: ${getResult.data.status === false}\n`);

  // Test 3: Update with null endsAt
  console.log("3️⃣ Test: Update with null endsAt");
  const test3 = await fetch(`${BASE_URL}/${testId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "No End Date Product",
      products: 150,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-03-01T00:00:00Z",
      endsAt: null,
      status: true,
    }),
  });
  const result3 = await test3.json();
  console.log(`   ✓ Status: ${test3.status}`);
  console.log(`   ✓ endsAt is null: ${result3.data.endsAt === null}\n`);

  // Test 4: Update non-existent preorder
  console.log("4️⃣ Test: Update non-existent preorder");
  const test4 = await fetch(`${BASE_URL}/99999/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Non-existent",
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
      status: true,
    }),
  });
  const result4 = await test4.json();
  console.log(`   ✓ Status: ${test4.status} (expected 404)`);
  console.log(`   ✓ Error: ${result4.error}\n`);

  // Test 5: Invalid ID format
  console.log("5️⃣ Test: Invalid ID format");
  const test5 = await fetch(`${BASE_URL}/abc/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test",
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
      status: true,
    }),
  });
  const result5 = await test5.json();
  console.log(`   ✓ Status: ${test5.status} (expected 400)`);
  console.log(`   ✓ Error: ${result5.error}\n`);

  // Test 6: Missing required field (name)
  console.log("6️⃣ Test: Update without name (should fail)");
  const test6 = await fetch(`${BASE_URL}/${testId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
      status: true,
    }),
  });
  const result6 = await test6.json();
  console.log(`   ✓ Status: ${test6.status} (expected 400)`);
  console.log(`   ✓ Error: ${result6.error}\n`);

  // Test 7: Invalid products value
  console.log("7️⃣ Test: Update with invalid products");
  const test7 = await fetch(`${BASE_URL}/${testId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Product",
      products: 0,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
      status: true,
    }),
  });
  const result7 = await test7.json();
  console.log(`   ✓ Status: ${test7.status} (expected 400)`);
  console.log(`   ✓ Error: ${result7.error}\n`);

  // Test 8: Invalid date
  console.log("8️⃣ Test: Update with invalid startsAt date");
  const test8 = await fetch(`${BASE_URL}/${testId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Product",
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "invalid-date",
      status: true,
    }),
  });
  const result8 = await test8.json();
  console.log(`   ✓ Status: ${test8.status} (expected 400)`);
  console.log(`   ✓ Error: ${result8.error}\n`);

  // Test 9: endsAt before startsAt
  console.log("9️⃣ Test: Update with endsAt before startsAt");
  const test9 = await fetch(`${BASE_URL}/${testId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Product",
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-12-01T00:00:00Z",
      endsAt: "2027-01-01T00:00:00Z",
      status: true,
    }),
  });
  const result9 = await test9.json();
  console.log(`   ✓ Status: ${test9.status} (expected 400)`);
  console.log(`   ✓ Error: ${result9.error}\n`);

  // Test 10: Missing status field
  console.log("🔟 Test: Update without status field");
  const test10 = await fetch(`${BASE_URL}/${testId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Product",
      products: 100,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
    }),
  });
  const result10 = await test10.json();
  console.log(`   ✓ Status: ${test10.status} (expected 400)`);
  console.log(`   ✓ Error: ${result10.error}\n`);

  // Test 11: Integration - Create, Full Update, Get
  console.log("1️⃣1️⃣ Test: Integration - Create → Full Update → Get");
  const createNew = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Integration Test",
      products: 50,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-01-01T00:00:00Z",
      status: true,
    }),
  });
  const createNewResult = await createNew.json();
  const newId = createNewResult.data.id;
  console.log(`   ✓ Created: ${createNewResult.data.name}`);

  const updateNew = await fetch(`${BASE_URL}/${newId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Updated Integration Test",
      products: 200,
      preorderWhen: "regardless_of_stock",
      startsAt: "2027-06-01T00:00:00Z",
      endsAt: "2027-12-31T23:59:59Z",
      status: false,
    }),
  });
  const updateNewResult = await updateNew.json();
  console.log(`   ✓ Updated: ${updateNewResult.data.name}`);

  const getNew = await fetch(`${BASE_URL}/${newId}`, { method: "GET" });
  const getNewResult = await getNew.json();
  console.log(`   ✓ Retrieved: ${getNewResult.data.name}`);
  console.log(
    `   ✓ All changes persisted: ${
      getNewResult.data.name === "Updated Integration Test" &&
      getNewResult.data.products === 200 &&
      getNewResult.data.status === false
    }\n`,
  );

  // Cleanup
  console.log("🧹 Cleanup: Deleting test preorders...");
  await fetch(`${BASE_URL}/${testId}`, { method: "DELETE" });
  await fetch(`${BASE_URL}/${newId}`, { method: "DELETE" });
  console.log(`   ✓ Deleted test preorders\n`);

  console.log("✅ All full update tests completed!");
}

testFullUpdateAPI().catch(console.error);
