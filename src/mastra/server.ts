import 'dotenv/config';
import OpenAI from 'openai';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let Mastra: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Mastra = require('@mastra/core');
  console.log('Mastra core loaded');
} catch (err: any) {
  console.error('Mastra core not available:', err?.message || err);
}

function extractMessageContent(payload: any): string | null {
  try {
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }

    if (typeof payload === 'string' && payload.includes('=')) {
      const parsed = new URLSearchParams(payload);
      const paramsStr = parsed.get('params');
      if (paramsStr) {
        payload = { params: JSON.parse(paramsStr) };
      }
    }

    const message = payload?.params?.message;
    if (!message) return null;

    if (Array.isArray(message.parts)) {
      const textParts = message.parts
        .filter((p: any) => p.kind === 'text' || typeof p === 'string')
        .map((p: any) => (typeof p === 'string' ? p : p.text || p.data))
        .join(' ');
      if (textParts) return textParts.trim();
    }

    if (Array.isArray(message.parts) && message.parts.length > 0) {
      const firstPart = message.parts[0];
      if (typeof firstPart === 'string') return firstPart.trim();
      if (firstPart.data) return String(firstPart.data).trim();
    }

    if (message.text) return String(message.text).trim();
    
    if (typeof message === 'object') {
      return JSON.stringify(message);
    }

    return String(message).trim();
  } catch (e) {
    console.error('Error extracting message:', e);
    return null;
  }
}

async function handleSummarizeRequest(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes content concisely. Keep summaries brief and clear.',
        },
        {
          role: 'user',
          content: `Please summarize: ${message}`,
        },
      ],
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'Summary could not be generated.';
  } catch (e: any) {
    console.error('OpenAI error:', e);
    if (e.status === 429) {
      return 'Sorry, I\'m currently experiencing high demand. Please try again in a moment.';
    }
    throw new Error(`Summarization failed: ${e.message}`);
  }
}

export async function startMastra(): Promise<void> {
  if (!Mastra) {
    console.error('Mastra is not installed. Install @mastra/core and retry.');
    process.exit(1);
  }

  try {
    const MastraClass = Mastra.Mastra;
    
    if (typeof MastraClass !== 'function') {
      console.error('Mastra.Mastra is not a constructor. Available exports:', Object.keys(Mastra));
      process.exit(1);
    }

    console.log('Creating Mastra instance...');
    const mastra = new MastraClass({
      agents: {},
      config: {
        agents: {
          vectorProvider: [],
        },
      },
    });

    console.log('Mastra instance created');

    if (typeof mastra.serve === 'function') {
      await mastra.serve({ port: PORT, host: HOST });
      console.log(`Mastra server started on ${HOST}:${PORT}`);
      return;
    }

    if (typeof mastra.listen === 'function') {
      mastra.listen(PORT, HOST, () => {
        console.log(`Mastra server listening on ${HOST}:${PORT}`);
      });
      return;
    }

    console.log('Creating HTTP gateway...');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const http = require('http');
    const server = http.createServer(async (req: any, res: any) => {
      if (req.method === 'GET' && req.url && req.url.includes('/a2a/agent/summarizeBot')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(agentMetadata()));
        return;
      }

      if (req.method === 'POST' && req.url && req.url.includes('/a2a/agent/summarizeBot')) {
        let body = '';
        req.on('data', (chunk: any) => (body += chunk));
        req.on('end', async () => {
          try {
            const payload = (() => {
              try { return JSON.parse(body); } catch { return body; }
            })();
            
            const message = extractMessageContent(payload);
            if (!message) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'No message provided' }));
              return;
            }

            console.log('Processing message:', message);

            const summary = await handleSummarizeRequest(message);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              responded: true, 
              message: summary,
              mastraIntegration: 'active'
            }));
          } catch (e: any) {
            console.error('Error processing A2A request:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: String(e?.message || e) }));
          }
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

    server.listen(PORT, HOST, () => {
      console.log(`Server listening on ${HOST}:${PORT}`);
      console.log(`A2A endpoint: http://${HOST}:${PORT}/a2a/agent/summarizeBot`);
    });

  } catch (err: any) {
    console.error('Error starting Mastra:', err?.message || err);
    console.error('Stack:', err?.stack);
    process.exit(1);
  }
}

export function agentMetadata() {
  return {
    agent: 'SummarizeBot',
    status: 'ready',
    endpoint: '/a2a/agent/summarizeBot',
    method: 'POST',
    description: 'Mastra-based summarization agent for Telex',
    usage: { trigger: '@bot summarize', modes: ['brief', 'detailed'] },
  };
}

if (require.main === module) {
  startMastra().catch((e) => {
    console.error('Failed to start Mastra:', e);
    process.exit(1);
  });
}

export default { startMastra, agentMetadata };
