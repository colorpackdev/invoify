#!/bin/bash

echo "🚀 Installing Chrome/Chromium dependencies for PDF generation..."

# Detect the operating system
if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    echo "📦 Detected Debian/Ubuntu system"
    
    echo "📋 Updating package list..."
    sudo apt-get update
    
    echo "🔧 Installing required dependencies..."
    sudo apt-get install -y \
        libnss3 \
        libnspr4 \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm1 \
        libgtk-3-0 \
        libasound2 \
        libxss1 \
        libgconf-2-4
    
    echo "🌐 Installing Chromium browser..."
    sudo apt-get install -y chromium-browser
    
    # Alternative: Install Google Chrome
    echo "🔄 Alternative: Installing Google Chrome (recommended)..."
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
    sudo apt-get update
    sudo apt-get install -y google-chrome-stable

elif [ -f /etc/redhat-release ]; then
    # RHEL/CentOS/Fedora
    echo "📦 Detected RHEL/CentOS/Fedora system"
    
    echo "🔧 Installing required dependencies..."
    sudo yum install -y \
        nss \
        nspr \
        atk \
        at-spi2-atk \
        libdrm \
        libxkbcommon \
        libXcomposite \
        libXdamage \
        libXrandr \
        mesa-libgbm \
        gtk3 \
        alsa-lib
    
    echo "🌐 Installing Chromium browser..."
    sudo yum install -y chromium

elif command -v snap >/dev/null 2>&1; then
    # Snap package manager
    echo "📦 Detected Snap package manager"
    echo "🌐 Installing Chromium via Snap..."
    sudo snap install chromium

else
    echo "❌ Unsupported operating system. Please install Chrome/Chromium manually."
    echo "📚 Visit: https://www.google.com/chrome/ or https://www.chromium.org/"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "🔍 Checking Chrome installation..."
node scripts/check-chrome.js

echo ""
echo "🎉 Setup complete! PDF generation should now work."
echo "💡 If you still have issues, set CHROME_EXECUTABLE_PATH environment variable:"
echo "   export CHROME_EXECUTABLE_PATH=\"/usr/bin/google-chrome-stable\""