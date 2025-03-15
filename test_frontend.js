// Test script for frontend demo user functionality
// Run this in the browser console when on the login page

async function testDemoUserLogin() {
  console.log('Starting frontend demo user test...');
  
  // Check if we're on the login page
  if (!window.location.pathname.includes('/candidate/login')) {
    console.error('This test should be run on the candidate login page');
    return false;
  }
  
  try {
    // Import the auth service
    const authService = await import('/src/services/authService.js');
    
    console.log('Testing demo user login...');
    
    // Click the demo user button if it exists, otherwise use the API directly
    const demoButton = document.querySelector('button[data-testid="demo-login-button"]');
    
    if (demoButton) {
      console.log('Found demo login button, clicking it...');
      demoButton.click();
    } else {
      console.log('Demo button not found, using API directly...');
      await authService.default.loginAsDemo();
    }
    
    // Wait for the login process to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we're logged in
    const user = authService.default.getCurrentUser();
    
    if (!user) {
      console.error('Login failed: No user found in localStorage');
      return false;
    }
    
    console.log('Login successful!', user);
    
    // Check if we're redirected to the dashboard
    if (!window.location.pathname.includes('/candidate/dashboard')) {
      console.error('Redirection failed: Not on dashboard page');
      return false;
    }
    
    console.log('Successfully redirected to dashboard');
    
    // Test passed
    console.log('✅ Frontend demo user test passed!');
    return true;
  } catch (error) {
    console.error('Test failed with error:', error);
    return false;
  }
}

// Run the test
testDemoUserLogin().then(result => {
  console.log(`Test ${result ? 'PASSED' : 'FAILED'}`);
}); 