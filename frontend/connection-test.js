// Simple connection test script
console.log('🎉 Testing Friendship Quiz App Connection...');

// Test backend connection
async function testBackendConnection() {
    try {
        const response = await fetch('http://localhost:5000/api/test');
        if (response.ok) {
            console.log('✅ Backend connection successful');
            return true;
        } else {
            console.log('❌ Backend connection failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Backend not running or unreachable');
        return false;
    }
}

// Test frontend
function testFrontend() {
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
        console.log('✅ Frontend running on correct port');
        return true;
    } else {
        console.log('⚠️ Frontend may not be running on localhost:3000');
        return false;
    }
}

// Run tests
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🧪 Running connection tests...');
    
    const frontendOk = testFrontend();
    const backendOk = await testBackendConnection();
    
    if (frontendOk && backendOk) {
        console.log('🎉 All systems working! Ready to use Friendship Quiz App!');
    } else {
        console.log('⚠️ Some issues detected. Check the console for details.');
    }
});
