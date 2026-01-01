// API Testing Script - Run with: node test-api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

async function testEndpoint(name, url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    const data = await response.json();
    
    if (response.ok) {
      tests.passed++;
      tests.results.push({ name, status: 'PASS', code: response.status });
      console.log(`✅ ${name} - PASSED`);
    } else {
      tests.failed++;
      tests.results.push({ name, status: 'FAIL', code: response.status, error: data });
      console.log(`❌ ${name} - FAILED (${response.status})`);
    }
  } catch (error) {
    tests.failed++;
    tests.results.push({ name, status: 'ERROR', error: error.message });
    console.log(`❌ ${name} - ERROR: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  // Test Salons API
  await testEndpoint('Get All Salons', '/salons');
  await testEndpoint('Get Salon by ID', '/salons/1');
  
  // Test Services API
  await testEndpoint('Get Services', '/services?salon_id=1');
  
  // Test Staff API
  await testEndpoint('Get Staff', '/staff?salon_id=1');
  
  // Test Availability API
  await testEndpoint('Get Availability', '/availability?salon_id=1&staff_id=1&date=2025-01-15');
  
  // Test Bookings API (requires auth)
  await testEndpoint('Get Bookings', '/bookings');
  
  // Test Payment Order Creation
  await testEndpoint('Create Payment Order', '/payment/create-order', 'POST', { amount: 50000 });

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`Total Tests: ${tests.passed + tests.failed}`);
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(2)}%`);

  if (tests.failed > 0) {
    console.log('\n⚠️  Failed Tests:');
    tests.results
      .filter(r => r.status !== 'PASS')
      .forEach(r => console.log(`  - ${r.name}: ${r.error || 'Unknown error'}`));
  }

  process.exit(tests.failed > 0 ? 1 : 0);
}

runTests();
