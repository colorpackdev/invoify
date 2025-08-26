#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Checking for Chrome/Chromium installation...\n');

const chromePaths = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    '/usr/bin/chrome',
    '/usr/local/bin/chrome',
    '/opt/google/chrome/chrome',
];

console.log('📋 Checking common Chrome installation paths:');
let foundPaths = [];

for (const path of chromePaths) {
    try {
        if (fs.existsSync(path)) {
            console.log(`✅ Found: ${path}`);
            foundPaths.push(path);
        } else {
            console.log(`❌ Not found: ${path}`);
        }
    } catch (error) {
        console.log(`❌ Error checking ${path}: ${error.message}`);
    }
}

console.log('\n🔍 Checking which command for chrome/chromium:');
const whichCommands = ['google-chrome-stable', 'google-chrome', 'chromium-browser', 'chromium', 'chrome'];

for (const cmd of whichCommands) {
    try {
        const result = execSync(`which ${cmd}`, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`✅ which ${cmd}: ${result.trim()}`);
        if (!foundPaths.includes(result.trim())) {
            foundPaths.push(result.trim());
        }
    } catch (error) {
        console.log(`❌ which ${cmd}: not found`);
    }
}

console.log('\n📦 Checking package managers for Chrome/Chromium:');
const packageChecks = [
    { cmd: 'dpkg -l | grep -i chrome', desc: 'APT packages (chrome)' },
    { cmd: 'dpkg -l | grep -i chromium', desc: 'APT packages (chromium)' },
    { cmd: 'rpm -qa | grep -i chrome', desc: 'RPM packages (chrome)' },
    { cmd: 'rpm -qa | grep -i chromium', desc: 'RPM packages (chromium)' },
    { cmd: 'snap list | grep chromium', desc: 'Snap packages (chromium)' },
];

for (const check of packageChecks) {
    try {
        const result = execSync(check.cmd, { encoding: 'utf8', stdio: 'pipe' });
        if (result.trim()) {
            console.log(`✅ ${check.desc}:`);
            console.log(result.trim());
        }
    } catch (error) {
        // Silently ignore errors - package manager might not be available
    }
}

console.log('\n📊 Summary:');
if (foundPaths.length > 0) {
    console.log(`✅ Found ${foundPaths.length} Chrome/Chromium installation(s):`);
    foundPaths.forEach(path => console.log(`   - ${path}`));
    
    console.log('\n💡 To use a specific Chrome path, set the environment variable:');
    console.log(`   export CHROME_EXECUTABLE_PATH="${foundPaths[0]}"`);
} else {
    console.log('❌ No Chrome/Chromium installations found.');
    console.log('\n📦 Install Chrome/Chromium using one of these commands:');
    console.log('   # Ubuntu/Debian:');
    console.log('   sudo apt-get update && sudo apt-get install -y chromium-browser');
    console.log('   # Or for Google Chrome:');
    console.log('   wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -');
    console.log('   echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list');
    console.log('   sudo apt-get update && sudo apt-get install -y google-chrome-stable');
    console.log('   # CentOS/RHEL:');
    console.log('   sudo yum install -y chromium');
    console.log('   # Snap:');
    console.log('   sudo snap install chromium');
}

console.log('\n🔧 Environment variables:');
console.log(`   CHROME_EXECUTABLE_PATH: ${process.env.CHROME_EXECUTABLE_PATH || 'not set'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);