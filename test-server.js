// Test script to check if server.js can be imported without syntax errors
import('./src/server.js')
  .then(() => {
    console.log('✅ Server file can be imported successfully - no syntax errors');
  })
  .catch((error) => {
    console.error('❌ Server file has syntax errors:', error.message);
    console.error('Stack trace:', error.stack);
  });
