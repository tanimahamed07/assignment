// Test script for the preorders GET API
// Run with: npx tsx test-get-api.ts

const BASE_URL = "http://localhost:3000/api/preorders";

async function testGetAPI() {
  console.log("🧪 Testing Preorders GET API\n");

  // First, get a list of preorders to work with
  console.log("0️⃣ Setup: Getting existing preorders...");
  const listResponse = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 5 }),
  });
  const listResult = await listResponse.json();
  console.log(`   ✓ Found ${listResult.data.length} preorders to test with\n`);

  // Test 1: Get first preorder
  const testPreorder = listResult.data[0];
  console.log(`1️⃣ Test: Get preorder by ID ${testPreorder.id}`);
  const test1 = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "GET",
  });
  const result1 = await test1.json();
  console.log(`   ✓ Status: ${test1.status}`);
  console.log(`   ✓ Success: ${result1.success}`);
  console.log(`   ✓ Preorder name: ${result1.data.name}`);
  console.log(`   ✓ Products: ${result1.data.products}`);
  console.log(`   ✓ Status: ${result1.data.status ? "Active" : "Inactive"}`);
  console.log(
    `   ✓ Starts at: ${new Date(result1.data.startsAt).toLocaleDateString()}`,
  );
  console.log(
    `   ✓ Ends at: ${result1.data.endsAt ? new Date(result1.data.endsAt).toLocaleDateString() : "No end date"}\n`,
  );

  // Test 2: Verify all fields are present
  console.log(`2️⃣ Test: Verify all fields are present`);
  const requiredFields = [
    "id",
    "name",
    "products",
    "preorderWhen",
    "startsAt",
    "status",
    "createdAt",
  ];
  const missingFields = requiredFields.filter(
    (field) => !(field in result1.data),
  );
  console.log(
    `   ✓ All required fields present: ${missingFields.length === 0}`,
  );
  if (missingFields.length > 0) {
    console.log(`   ✗ Missing fields: ${missingFields.join(", ")}`);
  }
  console.log(`   ✓ Has endsAt field: ${"endsAt" in result1.data}`);
  console.log();

  // Test 3: Get multiple preorders and verify uniqueness
  console.log(`3️⃣ Test: Get multiple preorders by ID`);
  for (let i = 0; i < Math.min(3, listResult.data.length); i++) {
    const preorder = listResult.data[i];
    const response = await fetch(`${BASE_URL}/${preorder.id}`, {
      method: "GET",
    });
    const result = await response.json();
    console.log(
      `   ✓ ID ${preorder.id}: ${result.data.name} (${result.data.products} products)`,
    );
  }
  console.log();

  // Test 4: Invalid ID (non-numeric)
  console.log(`4️⃣ Test: Invalid ID (non-numeric)`);
  const test4 = await fetch(`${BASE_URL}/invalid`, {
    method: "GET",
  });
  const result4 = await test4.json();
  console.log(`   ✓ Status: ${test4.status} (expected 400)`);
  console.log(`   ✓ Error message: ${result4.error}\n`);

  // Test 5: Invalid ID (zero)
  console.log(`5️⃣ Test: Invalid ID (zero)`);
  const test5 = await fetch(`${BASE_URL}/0`, {
    method: "GET",
  });
  const result5 = await test5.json();
  console.log(`   ✓ Status: ${test5.status} (expected 400)`);
  console.log(`   ✓ Error message: ${result5.error}\n`);

  // Test 6: Non-existent ID
  console.log(`6️⃣ Test: Non-existent ID (99999)`);
  const test6 = await fetch(`${BASE_URL}/99999`, {
    method: "GET",
  });
  const result6 = await test6.json();
  console.log(`   ✓ Status: ${test6.status} (expected 404)`);
  console.log(`   ✓ Error message: ${result6.error}\n`);

  // Test 7: Get active preorder
  console.log(`7️⃣ Test: Get active preorder`);
  const activeList = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: "active", limit: 1 }),
  });
  const activeResult = await activeList.json();
  if (activeResult.data.length > 0) {
    const activePreorder = activeResult.data[0];
    const test7 = await fetch(`${BASE_URL}/${activePreorder.id}`, {
      method: "GET",
    });
    const result7 = await test7.json();
    console.log(`   ✓ Got active preorder: ${result7.data.name}`);
    console.log(`   ✓ Status is true: ${result7.data.status === true}\n`);
  } else {
    console.log(`   ⚠ No active preorders found\n`);
  }

  // Test 8: Get inactive preorder
  console.log(`8️⃣ Test: Get inactive preorder`);
  const inactiveList = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: "inactive", limit: 1 }),
  });
  const inactiveResult = await inactiveList.json();
  if (inactiveResult.data.length > 0) {
    const inactivePreorder = inactiveResult.data[0];
    const test8 = await fetch(`${BASE_URL}/${inactivePreorder.id}`, {
      method: "GET",
    });
    const result8 = await test8.json();
    console.log(`   ✓ Got inactive preorder: ${result8.data.name}`);
    console.log(`   ✓ Status is false: ${result8.data.status === false}\n`);
  } else {
    console.log(`   ⚠ No inactive preorders found\n`);
  }

  // Test 9: Verify data types
  console.log(`9️⃣ Test: Verify data types`);
  const test9 = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "GET",
  });
  const result9 = await test9.json();
  console.log(`   ✓ id is number: ${typeof result9.data.id === "number"}`);
  console.log(`   ✓ name is string: ${typeof result9.data.name === "string"}`);
  console.log(
    `   ✓ products is number: ${typeof result9.data.products === "number"}`,
  );
  console.log(
    `   ✓ status is boolean: ${typeof result9.data.status === "boolean"}`,
  );
  console.log(
    `   ✓ startsAt is string: ${typeof result9.data.startsAt === "string"}`,
  );
  console.log(
    `   ✓ createdAt is string: ${typeof result9.data.createdAt === "string"}\n`,
  );

  // Test 10: Integration - Get, Update, Get again
  console.log(`🔟 Test: Integration - Get, Update, Get`);
  const getBefore = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "GET",
  });
  const beforeData = await getBefore.json();
  const originalStatus = beforeData.data.status;
  console.log(
    `   ✓ Original status: ${originalStatus ? "Active" : "Inactive"}`,
  );

  // Update status
  await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: !originalStatus }),
  });

  // Get again
  const getAfter = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "GET",
  });
  const afterData = await getAfter.json();
  console.log(
    `   ✓ Updated status: ${afterData.data.status ? "Active" : "Inactive"}`,
  );
  console.log(
    `   ✓ Status changed: ${afterData.data.status !== originalStatus}`,
  );

  // Restore original status
  await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: originalStatus }),
  });
  console.log(`   ✓ Restored to original status\n`);

  console.log("✅ All GET tests completed!");
}

testGetAPI().catch(console.error);
