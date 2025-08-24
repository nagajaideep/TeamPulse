const axios = require('axios');

async function testFeedback() {
  try {
    console.log('Testing feedback API...');
    
    // First login to get a token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'student1@demo.com',
      password: 'password'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token received:', !!token);
    
    // Test feedback submission
    console.log('Step 2: Submitting feedback...');
    const feedbackData = {
      content: 'Test feedback from script',
      rating: 5,
      type: 'general'
    };
    
    const feedbackResponse = await axios.post('http://localhost:5000/api/feedback', feedbackData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Feedback submission successful:', feedbackResponse.data);
  } catch (error) {
    console.error('Error occurred:');
    console.error('Message:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
  }
}

testFeedback();
