#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting web deployment process..."

# Build the web app
echo "📦 Building web app..."
npm run build:web

# Check if build was successful
if [ ! -d "web-build" ]; then
    echo "❌ Build failed: web-build directory not found"
    exit 1
fi

# Create a temporary deployment directory
echo "📁 Creating deployment directory..."
rm -rf deploy-temp
mkdir deploy-temp
cp -r web-build/* deploy-temp/

# Add a custom 404.html for SPA routing
echo "📝 Creating 404.html for SPA routing..."
cat > deploy-temp/404.html << EOL
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Esspress Yo</title>
    <script>
        // Single Page App redirect
        sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/'">
</head>
<body>
    Redirecting...
</body>
</html>
EOL

# Add robots.txt
echo "📝 Creating robots.txt..."
cat > deploy-temp/robots.txt << EOL
User-agent: *
Allow: /
Sitemap: https://www.espressyosupport.com/sitemap.xml
EOL

# Add sitemap.xml
echo "📝 Creating sitemap.xml..."
cat > deploy-temp/sitemap.xml << EOL
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://www.espressyosupport.com/</loc>
        <lastmod>$(date +%Y-%m-%d)</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>
EOL

echo "✅ Deployment files prepared successfully!"
echo "📁 Deployment files are in the deploy-temp directory"
echo "🚀 Ready to deploy to Netlify!"

# Instructions for deployment
echo "
📋 Netlify Deployment Instructions:
1. Make sure you have the Netlify CLI installed:
   npm install -g netlify-cli

2. Login to Netlify (if not already logged in):
   netlify login

3. Link your project to Netlify (if not already linked):
   netlify link

4. Deploy to Netlify:
   netlify deploy --prod

5. Configure your custom domain in Netlify:
   - Go to Site settings > Domain management
   - Add your custom domain: www.espressyosupport.com
   - Follow the DNS configuration instructions

6. Set up environment variables in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add all variables from your .env.production file
" 