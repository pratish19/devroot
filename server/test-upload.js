process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

async function revealHTML() {
    // We are going to fetch the exact URL Supabase is trying to hit
    const url = process.env.SUPABASE_URL.trim() + '/storage/v1/bucket';
    console.log("🔍 Pinging the API to read the hidden HTML page...");
    
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        console.log("\n🚨 HERE IS THE WEBPAGE INTERCEPTING YOUR CONNECTION:\n");
        // This will print the first 300 characters of the HTML so we can read the <title> or <h1>
        console.log(html.substring(0, 300)); 
        
    } catch (err) {
        console.log("Fetch failed entirely:", err.message);
    }
}

revealHTML();