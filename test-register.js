// Test simple d'inscription sans CSRF
const testRegisterWithoutCSRF = async () => {
  const data = {
    name: "Test User 2",
    email: "test2@example.com", 
    password: "password123",
    password_confirmation: "password123"
  };

  console.log("🧪 Testing registration without CSRF...");
  
  try {
    const response = await fetch('http://127.0.0.1:8081/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(data)
    });

    console.log("📨 Response status:", response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Success:", result);
    } else {
      const error = await response.text();
      console.error("❌ Error:", error);
    }
  } catch (error) {
    console.error("🚨 Network error:", error);
  }
};

// Exécuter le test
testRegisterWithoutCSRF();
