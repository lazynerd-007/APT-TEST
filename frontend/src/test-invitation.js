// Test script for candidate invitation
const candidateService = require('./services/candidateService').default;

async function testInvitation() {
  console.log('Testing candidate invitation process...');
  
  try {
    // Test data
    const inviteData = {
      assessment_id: '1',
      candidates: [
        { name: 'John Doe', email: 'john.doe@example.com' },
        { name: 'Jane Smith', email: 'jane.smith@example.com' }
      ],
      message: 'Please complete this assessment within 3 days. Good luck!'
    };
    
    console.log('Sending invitation to candidates:', inviteData.candidates.map(c => c.email).join(', '));
    
    // Call the service
    const response = await candidateService.inviteCandidates(inviteData);
    
    console.log('Invitation response:', response);
    console.log(`Successfully invited ${response.success_count} candidates`);
    
    if (response.failed_count > 0) {
      console.error('Failed to invite some candidates:', response.failed);
    }
    
    // Test verification
    console.log('\nTesting access code verification...');
    
    // For testing, we'll use a known test account
    const verifyData = {
      email: 'candidate@example.com',
      accessCode: 'TEST123'
    };
    
    console.log(`Verifying access code for ${verifyData.email}...`);
    
    try {
      const verifyResponse = await candidateService.verifyAccessCode(
        verifyData.email, 
        verifyData.accessCode
      );
      
      console.log('Verification successful:', verifyResponse);
    } catch (error) {
      console.error('Verification failed:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testInvitation().catch(console.error); 