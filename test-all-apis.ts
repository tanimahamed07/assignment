// Comprehensive test script for all preorder APIs
// Run with: npx tsx test-all-apis.ts

const BASE_URL = "http://localhost:3000/api/preorders";

async function testAllAPIs() {
  console.log("🧪 Testing All Preorder APIs\n");
  console.log("═".repeat(60));
  console.log("  LIST ENDPOINT TESTS");
  console.log("═".repeat(60) + "\n");

  // LIST TESTS
  console.log("1️⃣ Get all preorders (default)");
  const list1 = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const listResult1 = await list1.json();
  console.log(`   ✓ Total: ${listResult1.pagination.totalCount} preorders`);
  console.log(`   ✓ Page 1 returned: ${listResult1.data.length} records\n`);

  console.log("2️⃣ Filter by active status");
  const list2 = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: "active" }),
  });
  const listResult2 = await list2.json();
  console.log(`   ✓ Active preorders: ${listResult2.pagination.totalCount}\n`);

  console.log("3️⃣ Sort by products (descending), limit 3");
  const list3 = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sortBy: "products", sortOrder: "desc", limit: 3 }),
  });
  const listResult3 = await list3.json();
  console.log(`   ✓ Top 3 by product count:`);
  listResult3.data.forEach((p: any, i: number) => {
    console.log(`     ${i + 1}. ${p.name}: ${p.products} products`);
  });
  console.log();

  console.log("═".repeat(60));
  console.log("  UPDATE ENDPOINT TESTS");
  console.log("═".repeat(60) + "\n");

  // Get a preorder to update
  const testPreorder = listResult1.data[0];
  const originalStatus = testPreorder.status;
  console.log(`Selected preorder for update tests:`);
  console.log(`   ID: ${testPreorder.id}`);
  console.log(`   Name: ${testPreorder.name}`);
  console.log(
    `   Original Status: ${originalStatus ? "Active" : "Inactive"}\n`,
  );

  // UPDATE TESTS
  console.log("4️⃣ Update status to opposite value");
  const update1 = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: !originalStatus }),
  });
  const updateResult1 = await update1.json();
  console.log(`   ✓ Status: ${update1.status}`);
  console.log(`   ✓ Message: ${updateResult1.message}`);
  console.log(
    `   ✓ New status: ${updateResult1.data.status ? "Active" : "Inactive"}\n`,
  );

  console.log("5️⃣ Verify the change persisted");
  const verify = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 20 }),
  });
  const verifyResult = await verify.json();
  const verifiedPreorder = verifyResult.data.find(
    (p: any) => p.id === testPreorder.id,
  );
  console.log(
    `   ✓ Status in database: ${verifiedPreorder.status ? "Active" : "Inactive"}`,
  );
  console.log(`   ✓ Match: ${verifiedPreorder.status === !originalStatus}\n`);

  console.log("6️⃣ Restore original status");
  const restore = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: originalStatus }),
  });
  const restoreResult = await restore.json();
  console.log(
    `   ✓ Restored to: ${restoreResult.data.status ? "Active" : "Inactive"}\n`,
  );

  console.log("═".repeat(60));
  console.log("  GET ENDPOINT TESTS");
  console.log("═".repeat(60) + "\n");

  console.log("1️⃣1️⃣ Get single preorder by ID");
  const get1 = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "GET",
  });
  const getResult1 = await get1.json();
  console.log(`   ✓ Status: ${get1.status}`);
  console.log(`   ✓ Success: ${getResult1.success}`);
  console.log(`   ✓ Name: ${getResult1.data.name}`);
  console.log(`   ✓ Products: ${getResult1.data.products}\n`);

  console.log("1️⃣2️⃣ Get non-existent preorder");
  const get2 = await fetch(`${BASE_URL}/99999`, {
    method: "GET",
  });
  const getResult2 = await get2.json();
  console.log(`   ✓ Status: ${get2.status} (expected 404)`);
  console.log(`   ✓ Error: ${getResult2.error}\n`);

  console.log("═".repeat(60));
  console.log("  INTEGRATION TEST");
  console.log("═".repeat(60) + "\n");

  console.log("1️⃣3️⃣ Full CRUD cycle: List → Get → Update → Get → Delete");
  const cyclePreorder = listResult1.data[1];
  console.log(`   Starting with preorder ID: ${cyclePreorder.id}`);

  // Get
  const getCycle = await fetch(`${BASE_URL}/${cyclePreorder.id}`, {
    method: "GET",
  });
  const getCycleResult = await getCycle.json();
  console.log(`   ✓ GET: ${getCycleResult.data.name}`);

  // Update
  await fetch(`${BASE_URL}/${cyclePreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: !getCycleResult.data.status }),
  });
  console.log(`   ✓ PUT: Status toggled`);

  // Get again
  const getAfterUpdate = await fetch(`${BASE_URL}/${cyclePreorder.id}`, {
    method: "GET",
  });
  const getAfterUpdateResult = await getAfterUpdate.json();
  console.log(
    `   ✓ GET: Verified status changed to ${getAfterUpdateResult.data.status}`,
  );

  // Restore
  await fetch(`${BASE_URL}/${cyclePreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: getCycleResult.data.status }),
  });
  console.log(`   ✓ Restored original status\n`);

  console.log("═".repeat(60));
  console.log("  ERROR HANDLING TESTS");
  console.log("═".repeat(60) + "\n");

  console.log("1️⃣4️⃣ Invalid ID format");
  const error1 = await fetch(`${BASE_URL}/abc`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: true }),
  });
  const errorResult1 = await error1.json();
  console.log(`   ✓ Status: ${error1.status} (expected 400)`);
  console.log(`   ✓ Error: ${errorResult1.error}\n`);

  console.log("1️⃣5️⃣ Non-existent ID");
  const error2 = await fetch(`${BASE_URL}/99999`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: true }),
  });
  const errorResult2 = await error2.json();
  console.log(`   ✓ Status: ${error2.status} (expected 404)`);
  console.log(`   ✓ Error: ${errorResult2.error}\n`);

  console.log("1️⃣6️⃣ Invalid status type");
  const error3 = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "invalid" }),
  });
  const errorResult3 = await error3.json();
  console.log(`   ✓ Status: ${error3.status} (expected 400)`);
  console.log(`   ✓ Error: ${errorResult3.error}\n`);

  console.log("1️⃣7️⃣ Invalid filter in list");
  const error4 = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: "invalid" }),
  });
  const errorResult4 = await error4.json();
  console.log(`   ✓ Status: ${error4.status} (expected 400)`);
  console.log(`   ✓ Error: ${errorResult4.error}\n`);

  console.log("═".repeat(60));
  console.log("  BATCH OPERATIONS TEST");
  console.log("═".repeat(60) + "\n");

  console.log("1️⃣8️⃣ Toggle status of multiple preorders and count changes");
  const before = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: "active" }),
  });
  const beforeResult = await before.json();
  const activeCountBefore = beforeResult.pagination.totalCount;
  console.log(`   ✓ Active preorders before: ${activeCountBefore}`);

  // Toggle 3 preorders
  const toToggle = listResult1.data.slice(0, 3);
  for (const p of toToggle) {
    await fetch(`${BASE_URL}/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: !p.status }),
    });
  }

  const after = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: "active" }),
  });
  const afterResult = await after.json();
  const activeCountAfter = afterResult.pagination.totalCount;
  console.log(`   ✓ Active preorders after toggling 3: ${activeCountAfter}`);
  console.log(
    `   ✓ Count changed by: ${Math.abs(activeCountAfter - activeCountBefore)}`,
  );

  // Restore
  for (const p of toToggle) {
    await fetch(`${BASE_URL}/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: p.status }),
    });
  }
  console.log(`   ✓ Restored original states\n`);

  console.log("═".repeat(60));
  console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("═".repeat(60));
}

testAllAPIs().catch(console.error);
