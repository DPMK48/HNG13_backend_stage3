# Deployment Guide for SummarizeBot

This guide walks you through deploying SummarizeBot to Railway.

## Prerequisites

- [ ] Railway account (sign up at [railway.app](https://railway.app))
- [ ] GitHub repository with your code
- [ ] OpenAI API key
- [ ] Telex.im account registered

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure these files are committed:
- `Procfile` - Railway needs this to know how to start your app
- `package.json` - With all dependencies
- `.env.example` - Template for environment variables
- All source code in `src/` directory

### 2. Create a Railway Project

**Option A: Using Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to existing project or create new
railway link
```

**Option B: Using Railway Dashboard**

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js and deploy

### 3. Configure Environment Variables

In Railway dashboard, add these variables:

```
OPENAI_API_KEY=your_actual_openai_api_key_here
PORT=3000
NODE_ENV=production
AGENT_NAME=SummarizeBot
AGENT_ID=summarizeBot
MEMORY_STORAGE_PATH=/app/data/memory
```

**Important**: Railway automatically assigns a PORT, but we set a default.

### 4. Deploy

**Using Railway CLI:**
```bash
railway up
```

**Using GitHub:**
Railway will auto-deploy on every push to main branch.

### 5. Get Your Deployment URL

```bash
# Using CLI
railway domain

# Or in Railway dashboard
# Click on your project → Settings → Domains
```

Your URL will be something like: `https://your-app.railway.app`

### 6. Update Workflow JSON

Edit `workflows/summarizeBot.json` and update the URL:

```json
{
  "nodes": [
    {
      "url": "https://your-actual-railway-url.railway.app/a2a/agent/summarizeBot"
    }
  ]
}
```

### 7. Test Your Deployment

```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Test A2A endpoint
curl -X POST https://your-app.railway.app/a2a/agent/summarizeBot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "@bot summarize",
    "userId": "test-user",
    "channelId": "test-channel"
  }'
```

You should get a response from the bot!

### 8. Configure Telex.im

1. Log in to Telex.im
2. Navigate to Integrations or Workflows
3. Create a new workflow
4. Upload your `workflows/summarizeBot.json` file
5. Activate the workflow

### 9. Test on Telex

1. Go to any channel in Telex.im
2. Type: `@bot summarize`
3. The bot should respond!

## Monitoring

### View Logs

**Railway CLI:**
```bash
railway logs
```

**Railway Dashboard:**
Go to your project → Deployments → Click on latest deployment → View logs

### View Telex Logs

```
https://api.telex.im/agent-logs/{your-channel-id}.txt
```

Get `channel-id` from Telex URL bar.

## Troubleshooting

### Bot Not Responding

1. **Check Railway logs** for errors:
   ```bash
   railway logs
   ```

2. **Verify environment variables** are set correctly in Railway dashboard

3. **Test the endpoint directly**:
   ```bash
   curl https://your-app.railway.app/health
   ```

4. **Check Telex workflow** is activated

5. **Verify OpenAI API key** is valid and has credits

### Deployment Failed

1. **Check build logs** in Railway dashboard
2. **Ensure all dependencies** are in `package.json`
3. **Verify Node.js version** compatibility (18+)
4. **Check for TypeScript errors** locally:
   ```bash
   npm run build
   ```

### Memory Issues

If memory storage isn't working:

1. **Check permissions** on `/app/data/memory` directory
2. **Verify MEMORY_STORAGE_PATH** environment variable
3. **Check Railway logs** for file system errors

### High Response Times

1. **Check OpenAI API status**: https://status.openai.com/
2. **Review content size** - large documents take longer
3. **Check Railway instance resources** in dashboard
4. **Consider upgrading Railway plan** if needed

## Scaling

### Vertical Scaling
Railway automatically handles this based on your plan.

### Horizontal Scaling
For multiple instances, you'll need to:
1. Use a shared database for memory (Redis, PostgreSQL)
2. Configure session stickiness
3. Upgrade to Railway Pro plan

## Updating Your Deployment

### Using Railway CLI
```bash
# Make your changes
git add .
git commit -m "Update feature"
git push

# Railway auto-deploys from GitHub
# Or manually trigger:
railway up
```

### Using GitHub
Just push to your main branch. Railway will automatically deploy.

## Rollback

If something goes wrong:

```bash
# List deployments
railway deployments

# Rollback to previous
railway rollback
```

Or use the Railway dashboard → Deployments → Click on previous deployment → Redeploy

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
AGENT_URL=http://localhost:3000/a2a/agent/summarizeBot
```

### Production
```env
NODE_ENV=production
AGENT_URL=https://your-app.railway.app/a2a/agent/summarizeBot
```

## Security Best Practices

1. **Never commit `.env`** - Use environment variables in Railway
2. **Rotate API keys** regularly
3. **Use HTTPS only** in production (Railway provides this)
4. **Limit request sizes** to prevent abuse
5. **Monitor usage** to detect anomalies

## Cost Optimization

1. **Monitor OpenAI API usage** - Set billing limits
2. **Implement caching** for repeated summaries
3. **Use Railway's free tier** for testing
4. **Upgrade only when needed**

## Next Steps

After successful deployment:

1. ✅ Test thoroughly on Telex.im
2. ✅ Monitor logs for any errors
3. ✅ Share your bot with the HNG community
4. ✅ Write your blog post
5. ✅ Tweet about your achievement (@mastra)

## Support

Need help? 
- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- HNG Community: [HNG Slack/Discord]

---

Congratulations on deploying your AI agent! 🎉
