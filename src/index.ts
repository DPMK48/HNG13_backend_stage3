import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pdf from 'pdf-parse';

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

// Helper function to extract text from PDF
async function extractPdfText(pdfUrl: string): Promise<string> {
  try {
    console.log(`📄 Downloading PDF from: ${pdfUrl}`);
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    
    const data = await pdf(response.data);
    console.log(`✅ PDF extracted: ${data.numpages} pages, ${data.text.length} characters`);
    return data.text.substring(0, 5000); // First 5000 chars
  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    throw new Error(`Failed to extract PDF: ${error}`);
  }
}

// Helper function to scrape URLs
async function scrapeUrl(url: string): Promise<string> {
  try {
    console.log(`🌐 Scraping URL: ${url}`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    
    const $ = cheerio.load(response.data);
    $('script, style, nav, footer').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    console.log(`✅ Scraped ${text.length} characters from URL`);
    return text.substring(0, 3000);
  } catch (error) {
    console.error('❌ URL scraping error:', error);
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

// A2A endpoint info (GET)
app.get('/a2a/agent/summarizeBot', (req, res) => {
  res.json({
    agent: 'SummarizeBot',
    status: 'ready',
    endpoint: '/a2a/agent/summarizeBot',
    method: 'POST',
    description: 'AI-powered summarization agent for Telex',
    usage: {
      trigger: '@bot summarize',
      modes: ['brief', 'detailed'],
      supports: ['text', 'URLs']
    },
    example: {
      request: {
        method: 'POST',
        body: {
          prompt: '@bot summarize brief: Your text here...'
        }
      }
    }
  });
});

// Helper function to extract message content from Telex A2A format
function extractMessageContent(body: any): { text: string; fileInfo?: any } {
  console.log('📥 Received request body (raw):', JSON.stringify(body, null, 2));

  // Some webhook clients send a stringified JSON in `payload` or `body` — try to parse it
  if (typeof body.payload === 'string') {
    try {
      const parsed = JSON.parse(body.payload);
      console.log('🔁 Parsed stringified `payload` into JSON');
      body = { ...body, ...parsed };
    } catch (e) {
      console.log('⚠️ Could not parse stringified payload');
    }
  }

  // Try several common locations for the message object
  const messageObj = body.params?.message || body.message || body.data?.message || null;

  if (messageObj?.parts && Array.isArray(messageObj.parts)) {
    const parts = messageObj.parts;
    let textContent = '';
    let fileInfo = null;

    for (const part of parts) {
      if (!part) continue;
      // text part (simple)
      if (part.kind === 'text' && typeof part.text === 'string') {
        textContent += part.text + ' ';
        continue;
      }

      // data part may contain an array of messages or plain strings
      if (part.kind === 'data' && Array.isArray(part.data)) {
        const dataArr = part.data;

        // If the data array contains plain strings, join them and treat as text
        const lastElem = dataArr[dataArr.length - 1];
        if (typeof lastElem === 'string') {
          textContent = lastElem;
        } else if (lastElem?.kind === 'text' && typeof lastElem.text === 'string') {
          // If last element is an object with kind/text
          textContent = lastElem.text;
        }

        // Look for file information inside any text entries
        for (const item of dataArr) {
          let itemText = '';
          if (typeof item === 'string') itemText = item;
          else if (item?.kind === 'text' && typeof item.text === 'string') itemText = item.text;

          if (itemText && itemText.includes('file_link:')) {
            const lines = itemText.split('\n');
            const fileLinkLine = lines.find((l: string) => l.includes('file_link:'));
            const fileTypeLine = lines.find((l: string) => l.includes('file_type:'));
            const fileNameLine = lines.find((l: string) => l.toLowerCase().includes('file name:'));

            if (fileLinkLine) {
              fileInfo = {
                link: fileLinkLine.split('file_link:')[1]?.trim(),
                type: fileTypeLine?.split('file_type:')[1]?.trim(),
                name: fileNameLine?.split(':')[1]?.trim(),
              };
            }
          }
        }
      }
    }

    const trimmed = (textContent || '').trim();
    console.log('🔎 Parsed message text (from parts):', trimmed ? trimmed.slice(0, 200) : '<empty>');
    if (fileInfo) console.log('🔗 Parsed file info:', fileInfo);
    return { text: trimmed, fileInfo };
  }

  // Fallback to a few common simple fields
  const userMessage = body.prompt || body.params?.prompt || body.message?.text || body.text || body.body || '';
  console.log('🔎 Parsed message text (fallback):', userMessage ? String(userMessage).slice(0, 200) : '<empty>');
  return { text: String(userMessage || '').trim() };
}

// Helper function to extract URLs from text (including HTML links)
function extractUrls(text: string): string[] {
  const urls: string[] = [];
  
  // Extract from HTML anchor tags
  const hrefRegex = /href="([^"]+)"/g;
  let match;
  while ((match = hrefRegex.exec(text)) !== null) {
    urls.push(match[1]);
  }
  
  // Extract plain URLs
  const urlRegex = /https?:\/\/[^\s<>"]+/g;
  const plainUrls = text.match(urlRegex);
  if (plainUrls) {
    urls.push(...plainUrls);
  }
  
  return [...new Set(urls)]; // Remove duplicates
}

// A2A endpoint for Telex (POST)
app.post('/a2a/agent/summarizeBot', async (req, res) => {
  try {
    console.log('🔔 Received A2A request');
    
    const { text: userMessage, fileInfo } = extractMessageContent(req.body);
    
    if (!userMessage && !fileInfo) {
      console.log('❌ No message or file provided');
      return res.status(400).json({ error: 'No message provided' });
    }

    console.log('📝 User message:', userMessage);
    console.log('📎 File info:', fileInfo);

    // Check if bot is mentioned
    if (!userMessage.toLowerCase().includes('@bot')) {
      return res.json({ 
        response: "Hi! Mention me with '@bot summarize' to use me!" 
      });
    }

    let content = userMessage;
    let context = '';
    
    try {
      // Handle PDF files
      if (fileInfo && fileInfo.type === 'pdf' && fileInfo.link) {
        console.log('📄 Processing PDF file...');
        const pdfText = await extractPdfText(fileInfo.link);
        context = `\n\nPDF Content from "${fileInfo.name}":\n${pdfText}`;
        content = userMessage + context;
      }
      
      // Handle URLs (websites)
      const urls = extractUrls(userMessage);
      if (urls.length > 0) {
        console.log('🌐 Found URLs:', urls);
        for (const url of urls) {
          try {
            const scrapedContent = await scrapeUrl(url);
            context += `\n\nWebsite content from ${url}:\n${scrapedContent}`;
          } catch (error) {
            console.error(`Failed to scrape ${url}:`, error);
            context += `\n\nCouldn't access ${url}`;
          }
        }
        content = userMessage + context;
      }
      
      // Generate summary with OpenAI
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.includes('sk-')) {
        console.log('🤖 Generating summary with OpenAI...');
        const response = await handleSummarizeRequest(content);
        console.log('✅ Summary generated successfully');
        return res.json({ response });
      } else {
        return res.json({ 
          response: "🤖 SummarizeBot received your request! (OpenAI API key not configured for full processing)"
        });
      }
      
    } catch (error: unknown) {
      console.error('❌ Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle specific error cases
      if (errorMessage.includes('429')) {
        return res.json({ 
          response: "Sorry, I'm currently experiencing high demand. Please try again in a moment! 🙏" 
        });
      }
      
      if (errorMessage.includes('PDF') || errorMessage.includes('scrape')) {
        return res.json({ 
          response: `I had trouble accessing that content: ${errorMessage}. Please try again or use a different source.` 
        });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
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
  console.log(`✅ SummarizeBot started successfully!`);
  console.log(`🚀 Running on ${HOST}:${PORT}`);
  console.log(`📡 A2A endpoint: http://${HOST}:${PORT}/a2a/agent/summarizeBot`);
  console.log(`❤️  Health: http://${HOST}:${PORT}/health`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
});
