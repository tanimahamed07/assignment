// Test script for the preorders update API
// Run with: npx tsx test-update-api.ts

const BASE_URL = "http://localhost:3000/api/preorders";

async function testUpdateAPI() {
  console.log("🧪 Testing Preorders Update API\n");

  // First, get a preorder to work with
  console.log("0️⃣ Setup: Getting an existing preorder...");
  const listResponse = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 1 }),
  });
  const listResult = await listResponse.json();
  const testPreorder = listResult.data[0];
  console.log(
    `   ✓ Found preorder ID: ${testPreorder.id} - "${testPreorder.name}"`,
  );
  console.log(
    `   ✓ Current status: ${testPreorder.status ? "Active" : "Inactive"}\n`,
  );

  // Test 1: Update status to opposite value
  const newStatus = !testPreorder.status;
  console.log(
    `1️⃣ Test: Update preorder ${testPreorder.id} status to ${newStatus ? "Active" : "Inactive"}`,
  );
  const test1 = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
  const result1 = await test1.json();
  console.log(`   ✓ Status: ${test1.status}`);
  console.log(`   ✓ Success: ${result1.success}`);
  console.log(`   ✓ Message: ${result1.message}`);
  console.log(`   ✓ Updated status: ${result1.data.status}\n`);

  // Test 2: Verify the update persisted
  console.log(`2️⃣ Test: Verify update persisted`);
  const test2 = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 1 }),
  });
  const result2 = await test2.json();
  const verifyPreorder = result2.data.find(
    (p: any) => p.id === testPreorder.id,
  );
  if (verifyPreorder) {
    console.log(`   ✓ Found preorder after update`);
    console.log(`   ✓ Status matches: ${verifyPreorder.status === newStatus}`);
  }
  console.log();

  // Test 3: Toggle status back to original
  console.log(`3️⃣ Test: Toggle status back to original value`);
  const test3 = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: testPreorder.status }),
  });
  const result3 = await test3.json();
  console.log(
    `   ✓ Status restored to: ${result3.data.status ? "Active" : "Inactive"}\n`,
  );

  // Test 4: Invalid ID
  console.log(`4️⃣ Test: Invalid ID (non-numeric)`);
  const test4 = await fetch(`${BASE_URL}/invalid`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: true }),
  });
  const result4 = await test4.json();
  console.log(`   ✓ Status: ${test4.status}`);
  console.log(`   ✓ Error message: ${result4.error}\n`);

  // Test 5: Non-existent ID
  console.log(`5️⃣ Test: Non-existent ID (99999)`);
  const test5 = await fetch(`${BASE_URL}/99999`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: true }),
  });
  const result5 = await test5.json();
  console.log(`   ✓ Status: ${test5.status}`);
  console.log(`   ✓ Error message: ${result5.error}\n`);

  // Test 6: Invalid status type (string instead of boolean)
  console.log(`6️⃣ Test: Invalid status type (string)`);
  const test6 = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "true" }),
  });
  const result6 = await test6.json();
  console.log(`   ✓ Status: ${test6.status}`);
  console.log(`   ✓ Error message: ${result6.error}\n`);

  // Test 7: Missing status field
  console.log(`7️⃣ Test: Missing status field`);
  const test7 = await fetch(`${BASE_URL}/${testPreorder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const result7 = await test7.json();
  console.log(`   ✓ Status: ${test7.status}`);
  console.log(`   ✓ Error message: ${result7.error}\n`);

  // Test 8: Update multiple preorders
  console.log(`8️⃣ Test: Update multiple preorders sequentially`);
  const multiResponse = await fetch(`${BASE_URL}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 3 }),
  });
  const multiResult = await multiResponse.json();

  for (const preorder of multiResult.data) {
    const updateResponse = await fetch(`${BASE_URL}/${preorder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: !preorder.status }),
    });
    const updateResult = await updateResponse.json();
    console.log(
      `   ✓ Updated ID ${preorder.id}: ${preorder.status} → ${updateResult.data.status}`,
    );

    // Toggle back
    await fetch(`${BASE_URL}/${preorder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: preorder.status }),
    });
  }
  console.log();

  console.log("✅ All update tests completed!");
}

testUpdateAPI().catch(console.error);
