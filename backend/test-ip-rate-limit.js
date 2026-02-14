/**
 * Test IP Rate Limiting Per Poll
 * Run: node test-ip-rate-limit.js
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000';
const TEST_POLL_ID = 'test123'; // Replace with actual poll ID
const TEST_FINGERPRINT = 'a'.repeat(64);

async function testRateLimit() {
  console.log('🧪 Testing IP Rate Limit Per Poll (5 attempts per 10 min)\n');

  // Test 1: First 5 attempts should succeed (or fail with ALREADY_VOTED)
  console.log('Test 1: First 5 vote attempts...');
  for (let i = 1; i <= 5; i++) {
    try {
      const response = await axios.post(`${API_URL}/api/vote`, {
        pollId: TEST_POLL_ID,
        optionId: '0',
        fingerprint: TEST_FINGERPRINT + i // Different fingerprints
      });
      console.log(`  Attempt ${i}: ✅ ${response.data.data?.message || 'Success'}`);
    } catch (error) {
      const code = error.response?.data?.error?.code;
      if (code === 'ALREADY_VOTED' || code === 'IP_LIMIT_EXCEEDED') {
        console.log(`  Attempt ${i}: ⚠️  ${code}`);
      } else {
        console.log(`  Attempt ${i}: ❌ ${error.response?.data?.error?.message || error.message}`);
      }
    }
  }

  // Test 2: 6th attempt should be rate limited
  console.log('\nTest 2: 6th attempt (should be rate limited)...');
  try {
    const response = await axios.post(`${API_URL}/api/vote`, {
      pollId: TEST_POLL_ID,
      optionId: '0',
      fingerprint: TEST_FINGERPRINT + '6'
    });
    console.log('  ❌ FAILED: Should have been rate limited');
  } catch (error) {
    const code = error.response?.data?.error?.code;
    if (code === 'RATE_LIMIT_EXCEEDED') {
      console.log(`  ✅ PASSED: ${error.response.data.error.message}`);
    } else {
      console.log(`  ⚠️  Got: ${code} - ${error.response?.data?.error?.message}`);
    }
  }

  console.log('\n✅ Test complete');
}

testRateLimit().catch(console.error);
