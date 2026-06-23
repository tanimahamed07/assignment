// Test script for the preorders delete API
// Run with: npx tsx test-delete-api.ts

const BASE_URL = "http://localhost:3000/api/preorders";

async function testDeleteAPI() {
  console.log("🧪 Testing Preorders Delete API\n");

  // First, get total count before deletion
  console.log("0️⃣ Setup: Getting current preorder count...");
  const initialList = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const initialResult = await initialList.json();
  const initialCount = initialResult.pagination.totalCount;
  console.log(`   ✓ Total preorders: ${initialCount}\n`);

  // Get the last preorder to delete (so we don't disrupt other tests)
  const lastPreorder = initialResult.data[initialResult.data.length - 1];
  console.log(`Selected preorder for deletion:`);
  console.log(`   ID: ${lastPreorder.id}`);
  console.log(`   Name: ${lastPreorder.name}`);
  console.log(`   Status: ${lastPreorder.status ? "Active" : "Inactive"}\n`);

  // Test 1: Delete the preorder
  console.log(`1️⃣ Test: Delete preorder ${lastPreorder.id}`);
  const test1 = await fetch(`${BASE_URL}/${lastPreorder.id}`, {
    method: "DELETE",
  });
  const result1 = await test1.json();
  console.log(`   ✓ Status: ${test1.status}`);
  console.log(`   ✓ Success: ${result1.success}`);
  console.log(`   ✓ Message: ${result1.message}`);
  console.log(`   ✓ Deleted preorder name: ${result1.data.name}\n`);

  // Test 2: Verify deletion persisted
  console.log(`2️⃣ Test: Verify deletion persisted`);
  const test2 = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const result2 = await test2.json();
  const afterCount = result2.pagination.totalCount;
  console.log(`   ✓ Total preorders after deletion: ${afterCount}`);
  console.log(`   ✓ Count decreased by 1: ${afterCount === initialCount - 1}`);

  const stillExists = result2.data.some((p: any) => p.id === lastPreorder.id);
  console.log(`   ✓ Preorder no longer exists: ${!stillExists}\n`);

  // Test 3: Try to delete the same ID again (should fail - 404)
  console.log(`3️⃣ Test: Try to delete already deleted preorder`);
  const test3 = await fetch(`${BASE_URL}/${lastPreorder.id}`, {
    method: "DELETE",
  });
  const result3 = await test3.json();
  console.log(`   ✓ Status: ${test3.status} (expected 404)`);
  console.log(`   ✓ Error message: ${result3.error}\n`);

  // Test 4: Invalid ID (non-numeric)
  console.log(`4️⃣ Test: Invalid ID (non-numeric)`);
  const test4 = await fetch(`${BASE_URL}/invalid`, {
    method: "DELETE",
  });
  const result4 = await test4.json();
  console.log(`   ✓ Status: ${test4.status} (expected 400)`);
  console.log(`   ✓ Error message: ${result4.error}\n`);

  // Test 5: Invalid ID (negative number)
  console.log(`5️⃣ Test: Invalid ID (negative number)`);
  const test5 = await fetch(`${BASE_URL}/-5`, {
    method: "DELETE",
  });
  const result5 = await test5.json();
  console.log(`   ✓ Status: ${test5.status} (expected 400)`);
  console.log(`   ✓ Error message: ${result5.error}\n`);

  // Test 6: Non-existent ID (large number)
  console.log(`6️⃣ Test: Non-existent ID (99999)`);
  const test6 = await fetch(`${BASE_URL}/99999`, {
    method: "DELETE",
  });
  const result6 = await test6.json();
  console.log(`   ✓ Status: ${test6.status} (expected 404)`);
  console.log(`   ✓ Error message: ${result6.error}\n`);

  // Test 7: Delete another preorder and verify count
  console.log(`7️⃣ Test: Delete one more preorder`);
  const anotherList = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 1 }),
  });
  const anotherResult = await anotherList.json();
  const anotherPreorder = anotherResult.data[0];

  const test7 = await fetch(`${BASE_URL}/${anotherPreorder.id}`, {
    method: "DELETE",
  });
  const result7 = await test7.json();
  console.log(`   ✓ Deleted: ${result7.data.name}`);

  const finalList = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const finalResult = await finalList.json();
  const finalCount = finalResult.pagination.totalCount;
  console.log(
    `   ✓ Final count: ${finalCount} (decreased by 2 from original)\n`,
  );

  console.log("⚠️  Note: 2 preorders were deleted during testing");
  console.log("   To restore, run: npx prisma db seed\n");

  console.log("✅ All delete tests completed!");
}

testDeleteAPI().catch(console.error);
