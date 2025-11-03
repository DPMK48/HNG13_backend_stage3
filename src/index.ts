import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
app.use(express.json());

// Verify OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY environment variable is not set!');
  console.error('Please add it to your Railway environment variables.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-health-check',
});

// Helper function to scrape URLs
async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    
    const $ = cheerio.load(response.data);
    $('script, style, nav, footer').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    return text.substring(0, 3000);
  } catch (error) {
    throw new Error(`Failed to scrape URL: ${error}`);
  }
}

// Main bot logic
async function handleSummarizeRequest(prompt: string): Promise<string> {
  const urlMatch = prompt.match(/https?:\/\/[^\s]+/);
  
  let content = prompt;
  let context = '';
  
  if (urlMatch) {
    const url = urlMatch[0];
    try {
      const scrapedContent = await scrapeUrl(url);
      context = `\nScraped content from ${url}:\n${scrapedContent}`;
    } catch (error) {
      return `Sorry, I couldn't access that URL. ${error}`;
    }
  }
  
  const isBrief = prompt.toLowerCase().includes('brief');
  const isDetailed = prompt.toLowerCase().includes('detailed');
  
  const systemPrompt = `You are SummarizeBot, a helpful assistant that summarizes content.
  
Guidelines:
- If user asks for "brief" summary, provide 3-5 bullet points
- If user asks for "detailed" summary, provide 2-3 paragraphs  
- Default to brief format if not specified
- Be casual and friendly
- If they just say "@bot summarize" with no content, ask what they want summarized`;

  const userPrompt = `${prompt}${context}`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });
  
  return response.choices[0]?.message?.content || 'Sorry, I could not generate a summary.';
}

// A2A endpoint for Telex
app.post('/a2a/agent/summarizeBot', async (req, res) => {
  try {
    const { prompt, message } = req.body;
    const userMessage = prompt || message || '';
    
    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Check if bot is mentioned
    if (!userMessage.toLowerCase().includes('@bot')) {
      return res.json({ 
        response: "Hi! Mention me with '@bot summarize' to use me!" 
      });
    }

    const response = await handleSummarizeRequest(userMessage);
    
    return res.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', agent: 'SummarizeBot', version: '1.0.0' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'SummarizeBot',
    description: 'AI-powered summarization bot',
    endpoints: {
      health: '/health',
      a2a: '/a2a/agent/summarizeBot'
    }
  });
});

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0'; // Railway requires binding to 0.0.0.0

app.listen(PORT, HOST, () => {
  console.log(`🤖 SummarizeBot is running on ${HOST}:${PORT}`);
  console.log(`📡 A2A endpoint available`);
  console.log(`❤️  Health check: /health`);
  console.log(`🔑 OpenAI Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
});
