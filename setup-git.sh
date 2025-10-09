#!/bin/bash

# Mae Terminal Git Setup Script
# Run this to prepare your project for Railway deployment via GitHub

echo "🚀 Setting up Mae Terminal for Railway deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
else
    echo "✅ Git repository already initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOL
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Temporary folders
.tmp/
temp/

# ZIP files (deployment artifacts)
*.zip

# Railway
.railway/
EOL
else
    echo "✅ .gitignore already exists"
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Prepare Mae Terminal for Railway deployment

- Added Railway configuration (railway.json)
- Updated CORS for Railway domains  
- Added deployment documentation
- Configured production environment settings"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Create a GitHub repository at: https://github.com/new"
echo "2. Copy the repository URL (e.g., https://github.com/username/mae-terminal-puzzle.git)"
echo "3. Run: git remote add origin <your-repo-url>"
echo "4. Run: git push -u origin main"
echo "5. Deploy on Railway: https://railway.app"
echo ""
echo "🔗 Or use GitHub CLI if you have it installed:"
echo "   gh repo create mae-terminal-puzzle --public --source=. --remote=origin --push"
echo ""
echo "📚 See RAILWAY_DEPLOY.md for detailed deployment instructions"