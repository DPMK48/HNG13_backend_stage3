# SummarizeBot - Deployment Info

## �� Live Deployment

**Production URL:** https://web-production-0518.up.railway.app/

### Endpoints

- **Root:** https://web-production-0518.up.railway.app/
- **Health Check:** https://web-production-0518.up.railway.app/health
- **A2A Agent:** https://web-production-0518.up.railway.app/a2a/agent/summarizeBot

## 🔗 Telex Integration

Upload `workflow.json` to Telex.im to integrate the bot.

## 📝 Next Steps

1. ✅ Upload workflow.json to Telex
2. ✅ Test on Telex by typing: `@bot summarize <your text>`
3. ✅ Write blog post
4. ✅ Tweet about your agent

## 🎯 Example Usage on Telex

```
@bot summarize brief: Artificial intelligence is revolutionizing industries worldwide.
```

```
@bot summarize detailed https://example.com/article
```

## 🔑 Environment Variables (Already Set on Railway)

- `OPENAI_API_KEY` ✅
- `NODE_ENV=production` ✅
- `PORT` (Auto-assigned by Railway) ✅

---

**Author:** dorathypaul48@gmail.com  
**Repository:** https://github.com/DPMK48/HNG13_backend_stage3
