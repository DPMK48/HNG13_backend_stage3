# Building an AI Summarization Agent with Mastra and Telex.im

*A comprehensive guide to creating an intelligent bot that summarizes content across multiple formats*

---

## Introduction

As part of the HNG Internship Stage 3 Backend Task, I built **SummarizeBot** - an AI-powered agent that integrates with Telex.im to help users quickly summarize text, documents, and web pages. This blog post walks through my journey of building this agent using the Mastra framework, the challenges I faced, and the solutions I implemented.

## The Challenge

The task was clear but complex:
- Build an AI agent using TypeScript and Mastra
- Integrate it with Telex.im using the A2A protocol
- Make it useful and intelligent
- Deploy it to a production environment

I decided to create a summarization bot because information overload is a real problem. Whether it's long articles, PDF documents, or chat histories, people need quick ways to extract key information.

## Tech Stack

Here's what I chose and why:

### Core Technologies
- **Mastra**: A powerful AI agent framework that simplifies building intelligent systems
- **TypeScript**: For type safety and better developer experience
- **OpenAI GPT-4**: The brain behind the summarization
- **Express.js**: Web server for handling HTTP requests
- **WebSocket (ws)**: Real-time communication with Telex

### Supporting Libraries
- **Cheerio**: Web scraping for URL summarization
- **pdf-parse**: Extracting text from PDF files
- **Mammoth**: Processing DOCX documents
- **Jest**: Testing framework for quality assurance

## Architecture Overview

The bot follows a clean, modular architecture:

```
User Message → Telex.im → A2A Endpoint → Agent → Tools → Memory → Response
```

### Key Components

1. **Agent Layer**: The Mastra agent that orchestrates everything
2. **Tools Layer**: Specialized functions for different content types
3. **Integration Layer**: Telex A2A protocol implementation
4. **Memory Layer**: Persistent storage for conversations and summaries
5. **Server Layer**: Express + WebSocket server

## Implementation Journey

### 1. Setting Up the Project

First, I created a solid foundation with TypeScript, proper configuration, and a clear folder structure:

```
src/
├── agents/          # Mastra agent definitions
├── tools/           # Summarization tools
├── integrations/    # Telex integration
└── utils/           # Helper functions
```

The key was keeping concerns separated. Each module has a single responsibility, making the code maintainable and testable.

### 2. Building the Summarization Tools

This was where things got interesting. I needed to handle three different content types:

#### Plain Text Tool
The simplest case - just process the text directly:

```typescript
export const summarizeTextTool = createTool({
  id: 'summarize-text',
  name: 'Summarize Text',
  description: 'Summarizes plain text content',
  inputSchema: SummarizeTextSchema,
  execute: async ({ context }) => {
    const { text, mode } = context;
    const preparedText = prepareTextForSummary(text);
    return {
      content: preparedText,
      mode,
      type: 'text',
    };
  },
});
```

#### URL Scraping Tool
More complex - had to scrape web pages and extract meaningful content:

```typescript
export async function scrapeWebpage(url: string): Promise<string> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);
  
  // Remove non-content elements
  $('script, style, nav, footer, iframe, noscript').remove();
  
  // Extract main content
  const mainContent = $('article, main, .content, .post, body').first();
  const text = mainContent.text() || $('body').text();
  
  return text.replace(/\s+/g, ' ').trim();
}
```

**Challenge**: Different websites have different structures. I had to use multiple selectors to find the main content reliably.

**Solution**: Try common content selectors in order of specificity, falling back to body text if needed.

#### Document Processing Tool
The most challenging - parsing PDFs and DOCX files:

```typescript
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
```

**Challenge**: Files can be large and complex, with formatting that doesn't translate well to plain text.

**Solution**: Set content length limits (15,000 characters) and truncate intelligently while preserving meaning.

### 3. Implementing the Mastra Agent

The agent is the heart of the system. It needed clear instructions and the right personality:

```typescript
export const summarizeAgent = new Agent({
  name: 'SummarizeBot',
  id: 'summarizeBot',
  model: {
    provider: 'openai',
    name: 'gpt-4-turbo-preview',
    toolChoice: 'auto',
  },
  instructions: `You are SummarizeBot, a friendly and helpful AI assistant...`,
  tools: [summarizeTextTool, summarizeUrlTool, summarizeFileTool],
});
```

**Key Design Decision**: I gave the agent a casual, encouraging personality. Technical accuracy is important, but so is user experience. The bot greets users warmly and provides clear guidance.

### 4. Building the Memory System

One unique requirement was persistent memory - remembering conversations across sessions:

```typescript
export class MemoryStore {
  async addMessage(userId: string, role: 'user' | 'assistant', content: string) {
    const memory = await this.loadUserMemory(userId);
    
    memory.conversations.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // Keep only last 50 messages
    if (memory.conversations.length > 50) {
      memory.conversations = memory.conversations.slice(-50);
    }

    await this.saveUserMemory(memory);
  }
}
```

**Challenge**: How to store memory efficiently without a database?

**Solution**: JSON files per user. Simple, no dependencies, and easy to debug. For production scale, this could be swapped with Redis or a proper database.

### 5. Integrating with Telex.im

The Telex integration required implementing the A2A protocol:

```typescript
app.post('/a2a/agent/summarizeBot', async (req, res) => {
  const { message, userId, channelId } = req.body;

  // Check for trigger
  const triggerPattern = /@bot\s+summarize/i;
  const isTriggered = triggerPattern.test(message);

  if (!isTriggered) {
    return res.json({
      responded: false,
      message: 'Agent not triggered',
    });
  }

  // Process and respond
  const response = await generateAgentResponse(userId, message);

  res.json({
    responded: true,
    message: response,
    metadata: {
      agent: 'SummarizeBot',
      timestamp: new Date().toISOString(),
    },
  });
});
```

**Challenge**: Understanding the A2A protocol format and implementing it correctly.

**Solution**: Carefully studied the sample workflow JSON and tested with different message formats.

### 6. Adding WebSocket Support

For real-time communication, I implemented WebSocket alongside HTTP:

```typescript
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', async (data: Buffer) => {
    const message = JSON.parse(data.toString());
    
    // Process message
    const response = await generateAgentResponse(message.userId, message.text);
    
    // Send response
    ws.send(JSON.stringify({
      action: 'response',
      responded: true,
      message: response,
    }));
  });
});
```

## Challenges and Solutions

### Challenge 1: Token Limits
**Problem**: GPT-4 has token limits. Long documents could exceed them.

**Solution**: 
- Truncate content to 15,000 characters before processing
- Let GPT-4 know content might be truncated
- Add "..." indicator when truncating

### Challenge 2: Web Scraping Reliability
**Problem**: Different websites have vastly different structures.

**Solution**:
- Try multiple content selectors in order of specificity
- Remove known non-content elements (nav, footer, ads)
- Fall back to body text if specific selectors fail

### Challenge 3: Memory Management
**Problem**: Unlimited conversation history could cause memory bloat.

**Solution**:
- Limit to last 50 conversations per user
- Limit to last 20 summaries per user
- Implement cleanup for old user data (30+ days inactive)

### Challenge 4: Error Handling
**Problem**: Many things can go wrong (network errors, invalid URLs, corrupted files).

**Solution**:
- Comprehensive try-catch blocks
- User-friendly error messages
- Graceful degradation
- Detailed logging for debugging

### Challenge 5: Testing
**Problem**: Testing AI agents is tricky because responses aren't deterministic.

**Solution**:
- Test tool functions independently with known inputs
- Test API endpoints with mock data
- Test memory persistence separately
- Integration tests for the full flow

## Deployment Process

Deploying to Railway was straightforward:

1. **Prepare environment**: Set all required environment variables
2. **Create Procfile**: Tell Railway how to start the app
3. **Deploy**: Push to Railway using their CLI
4. **Update workflow JSON**: Point to the Railway URL
5. **Test**: Verify all endpoints work in production

## Lessons Learned

### What Worked Well
1. **Modular architecture**: Separation of concerns made development smooth
2. **TypeScript**: Caught many bugs before runtime
3. **Comprehensive testing**: Gave confidence in the code
4. **Clear documentation**: Helped me stay organized

### What I'd Do Differently
1. **Add rate limiting**: Prevent abuse of OpenAI API
2. **Implement caching**: Cache summaries for identical content
3. **Add analytics**: Track usage patterns and popular features
4. **Better file size limits**: More granular control over document sizes

### Unexpected Benefits
- **Learning Mastra**: Excellent framework, will use again
- **Understanding A2A protocol**: Valuable for future integrations
- **Memory management**: Interesting problem to solve

## Performance Metrics

The bot performs well:
- **Response time**: 2-5 seconds for text, 5-10 seconds for documents
- **Accuracy**: GPT-4 provides high-quality summaries
- **Reliability**: Error handling ensures graceful failures
- **Memory footprint**: Minimal, thanks to file-based storage

## Future Improvements

If I continue working on this project, I'd add:

1. **Multi-language support**: Summarize content in different languages
2. **Custom summary lengths**: Let users specify exact length
3. **Summary comparisons**: Compare multiple documents
4. **Export options**: Save summaries as PDF or TXT
5. **Batch processing**: Summarize multiple items at once
6. **Analytics dashboard**: Show usage statistics
7. **User preferences**: Remember preferred summary modes

## Conclusion

Building SummarizeBot was an incredible learning experience. The combination of Mastra's powerful framework, OpenAI's intelligence, and Telex's integration capabilities resulted in a genuinely useful tool.

Key takeaways:
- **Mastra simplifies AI agent development** - Focus on logic, not boilerplate
- **Good architecture scales** - Modular design made adding features easy
- **User experience matters** - Technical capability + friendly personality = great bot
- **Testing is essential** - Comprehensive tests caught many issues early

The HNG Internship Stage 3 task pushed me to explore new technologies and solve real problems. I'm excited to see how this agent performs in real-world usage and potentially expand its capabilities.

## Resources

- **GitHub Repository**: [Link to your repo]
- **Live Demo**: [Your Railway URL]
- **Mastra Documentation**: https://docs.mastra.ai/
- **Telex Platform**: https://telex.im/

## Call to Action

Want to try SummarizeBot? Head over to Telex.im and type `@bot summarize` in any channel!

Have questions or suggestions? Reach out:
- **Email**: dorathypaul48@gmail.com
- **Twitter**: Share your thoughts with @mastra and @hnginternship

---

*Built with ❤️ for HNG Internship Stage 3*

**Tags**: #AI #Mastra #Telex #HNGInternship #TypeScript #OpenAI #Chatbot #Summarization
