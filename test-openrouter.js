// Test script to verify OpenRouter API key
async function testOpenRouter() {
  const apiKey = "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";
  
  console.log("Testing OpenRouter API...");
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Visual Patch Editor Test"
      },
      body: JSON.stringify({
        model: "qwen/qwen3-coder",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant." 
          },
          { role: "user", content: "Say 'Hello World' if you can read this." }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return false;
    }

    const data = await response.json();
    console.log("API Response:", data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log("✅ API Key is working! Response:", data.choices[0].message.content);
      return true;
    } else {
      console.error("❌ Invalid response format");
      return false;
    }
    
  } catch (error) {
    console.error("❌ API Test failed:", error.message);
    return false;
  }
}

// Run the test
testOpenRouter().then(success => {
  if (success) {
    console.log("🎉 OpenRouter API is working correctly!");
  } else {
    console.log("⚠️  OpenRouter API has issues. You may need to update the API key.");
  }
}); 