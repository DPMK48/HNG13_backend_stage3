# 🚀 Quick Start Guide - SummarizeBot

Get up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version
```

If you don't have Node.js 18+, install it from [nodejs.org](https://nodejs.org/)

## Installation Steps

### 1. Install Dependencies (2 minutes)

```bash
cd HNG_backend_stage3
npm install
```

### 2. Setup Environment Variables (1 minute)

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenAI API key
nano .env
# or
code .env
```

Add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Create Data Directory

```bash
mkdir -p data/memory
```

### 4. Start Development Server (1 minute)

```bash
npm run dev
```

You should see:
```
🤖 SummarizeBot is running on port 3000
📡 A2A endpoint: http://localhost:3000/a2a/agent/summarizeBot
🔗 Webhook endpoint: http://localhost:3000/webhook
❤️  Health check: http://localhost:3000/health
🔌 WebSocket server ready at ws://localhost:3000/ws
```

### 5. Test Locally (1 minute)

Open another terminal and test:

```bash
# Health check
curl http://localhost:3000/health

# Test the bot
curl -X POST http://localhost:3000/a2a/agent/summarizeBot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "@bot summarize",
    "userId": "test-user",
    "channelId": "test-channel"
  }'
```

You should get a friendly response from the bot!

## Common Issues

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### "OPENAI_API_KEY not found"
Make sure you:
1. Created `.env` file
2. Added your actual API key
3. Restarted the dev server

### Port already in use
```bash
# Change PORT in .env
PORT=3001
```

## Next Steps

1. ✅ **Read README.md** for detailed documentation
2. ✅ **Run tests**: `npm test`
3. ✅ **Deploy to Railway**: See `DEPLOYMENT.md`
4. ✅ **Configure Telex**: Upload workflow JSON
5. ✅ **Test on Telex**: Type `@bot summarize`

## Quick Commands Reference

```bash
# Development
npm run dev              # Start with hot reload

# Production
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode

# Code Quality
npm run lint             # Check for issues
npm run format           # Format code
```

## Project Structure

```
src/
├── agents/            # Agent logic
├── tools/             # Summarization tools
├── integrations/      # Telex integration
└── utils/             # Helpers (memory, etc.)

workflows/             # Telex workflow JSON
tests/                 # Test files
data/                  # Runtime data (gitignored)
```

## Getting Help

- 📖 **Full docs**: See `README.md`
- 🚢 **Deployment**: See `DEPLOYMENT.md`
- 📝 **Blog post**: See `BLOG_POST.md`
- 🐛 **Issues**: Check existing code comments

## Ready to Deploy?

Once everything works locally:

1. Push to GitHub
2. Deploy to Railway (see `DEPLOYMENT.md`)
3. Update workflow JSON with your Railway URL
4. Upload to Telex.im
5. Test with `@bot summarize`

---

That's it! You're ready to build and deploy your AI agent! 🎉

Questions? Check `README.md` or reach out to dorathypaul48@gmail.com
