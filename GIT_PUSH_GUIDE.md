# Push to GitHub - Simple Guide

## First Time Setup (Only Once)

### 1. Create GitHub Repository
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name it: `salon-platform`
4. Click "Create repository"
5. Copy the repository URL (looks like: https://github.com/YOUR_USERNAME/salon-platform.git)

### 2. Initialize Git in Your Project
Open terminal in your project folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/salon-platform.git
git push -u origin main
```

**Replace YOUR_USERNAME with your actual GitHub username!**

---

## Update Existing Repository (Every Time)

When you make changes and want to push:

```bash
# Step 1: Add all changes
git add .

# Step 2: Commit with a message
git commit -m "Your update message here"

# Step 3: Push to GitHub
git push
```

### Example:
```bash
git add .
git commit -m "Added home service packages"
git push
```

---

## Quick Commands

### Check Status
```bash
git status
```

### See What Changed
```bash
git diff
```

### View Commit History
```bash
git log --oneline
```

### Undo Last Commit (if not pushed)
```bash
git reset --soft HEAD~1
```

---

## Common Issues

### "Permission denied"
- Make sure you're logged into GitHub
- Use personal access token instead of password
- Or set up SSH keys

### "Repository not found"
- Check the repository URL is correct
- Make sure repository exists on GitHub

### "Nothing to commit"
- No changes were made
- Or files are in .gitignore

---

## That's It!

**Every time you update:**
1. `git add .`
2. `git commit -m "message"`
3. `git push`

**Done!** ✅
