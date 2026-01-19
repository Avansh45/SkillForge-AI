// Run this in your browser console to check your JWT token
function checkTokenRole() {
  const token = localStorage.getItem('skillforgeToken');
  
  if (!token) {
    console.error('❌ No token found in localStorage');
    return;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format');
      return;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    console.log('✅ Token Payload:', payload);
    console.log('📧 Email:', payload.sub);
    console.log('🎭 Role:', payload.role);
    console.log('⏰ Expires:', new Date(payload.exp * 1000));
    console.log('🕐 Issued:', new Date(payload.iat * 1000));
    
    // Check if token is expired
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      console.error('❌ TOKEN IS EXPIRED!');
    } else {
      console.log('✅ Token is valid');
    }
    
    // Check role
    if (payload.role === 'INSTRUCTOR') {
      console.log('✅ Role is INSTRUCTOR - should work for question updates');
    } else {
      console.error('❌ Role is ' + payload.role + ' - needs to be INSTRUCTOR');
    }
    
  } catch (e) {
    console.error('❌ Error decoding token:', e);
  }
}

checkTokenRole();
