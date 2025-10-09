#!/usr/bin/env node

/**
 * Railway Deployment Test Script
 * Run this script to verify your Mae Terminal is ready for Railway deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚂 Mae Terminal Railway Deployment Check\n');

const checks = [
  {
    name: 'package.json exists',
    test: () => fs.existsSync('package.json'),
    fix: 'Create package.json with proper scripts'
  },
  {
    name: 'server.js exists',
    test: () => fs.existsSync('server.js'),
    fix: 'Create server.js file'
  },
  {
    name: 'railway.json exists',
    test: () => fs.existsSync('railway.json'),
    fix: 'Railway config created ✅'
  },
  {
    name: 'Node.js version compatibility',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.engines && pkg.engines.node;
    },
    fix: 'Add Node.js version requirement to engines in package.json'
  },
  {
    name: 'Start script configured',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.start;
    },
    fix: 'Add "start": "node server.js" to package.json scripts'
  },
  {
    name: 'PORT environment variable used',
    test: () => {
      const server = fs.readFileSync('server.js', 'utf8');
      return server.includes('process.env.PORT');
    },
    fix: 'Update server.js to use process.env.PORT'
  },
  {
    name: 'Railway CORS configured',
    test: () => {
      const server = fs.readFileSync('server.js', 'utf8');
      return server.includes('railway.app');
    },
    fix: 'Railway CORS configured ✅'
  },
  {
    name: 'Public directory exists',
    test: () => fs.existsSync('public') && fs.existsSync('public/index.html'),
    fix: 'Create public/index.html'
  },
  {
    name: 'Mae AI source exists',
    test: () => fs.existsSync('src') && fs.existsSync('src/mae-ai-simple.js'),
    fix: 'Create src/mae-ai-simple.js'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.test();
  const status = passed ? '✅' : '❌';
  console.log(`${index + 1}. ${check.name}: ${status}`);
  
  if (!passed) {
    console.log(`   Fix: ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your Mae Terminal is ready for Railway!');
  console.log('\n📋 Next Steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect to Railway: https://railway.app');
  console.log('3. Deploy from GitHub repository');
  console.log('4. Set NODE_ENV=production in Railway environment');
  console.log('5. Access your Mae Terminal at the Railway URL');
} else {
  console.log('⚠️  Some issues need to be fixed before deployment');
  console.log('Please address the failed checks above');
}

console.log('\n🔗 Useful Links:');
console.log('- Railway: https://railway.app');
console.log('- Deployment Guide: ./RAILWAY_DEPLOY.md');
console.log('- Mae Terminal Docs: ./README.md');