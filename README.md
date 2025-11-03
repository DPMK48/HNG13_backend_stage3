# SummarizeBot - AI-Powered Summarization Agent for Telex.im

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Mastra](https://img.shields.io/badge/Mastra-Framework-purple)](https://mastra.ai/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent AI agent built with Mastra that summarizes text, documents, and web pages on the Telex.im platform. SummarizeBot uses OpenAI's GPT-4 to provide both brief (bullet point) and detailed (paragraph) summaries with persistent conversation memory.

## 🎯 Features

- **Multi-Format Support**: Summarize plain text, URLs, PDF, DOCX, and TXT files
- **Flexible Summary Modes**: 
  - **Brief**: 3-7 concise bullet points
  - **Detailed**: 2-4 well-structured paragraphs
- **Persistent Memory**: Remembers conversations and previous summaries across sessions
- **Real-Time Communication**: WebSocket and HTTP endpoints for Telex.im integration
- **Casual & Helpful**: Friendly conversational tone with clear guidance
- **A2A Protocol**: Full Mastra A2A protocol compliance for Telex integration

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Telex.im Account** (Register at [telex.im](https://telex.im))

## 📦 Installation

1. **Clone the repository**:
```bash
cd HNG_backend_stage3
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
```bash
cp .env.example .env
```

4. **Configure your `.env` file**:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Telex Configuration
TELEX_WEBHOOK_URL=https://api.telex.im/webhook
AGENT_URL=https://your-railway-app.railway.app/a2a/agent/summarizeBot

# Agent Configuration
AGENT_NAME=SummarizeBot
AGENT_ID=summarizeBot

# Memory Configuration
MEMORY_STORAGE_PATH=./data/memory
```

## ⚙️ Configuration

### Getting Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy and paste it into your `.env` file

### Setting Up Telex.im Access

1. Run the invite command in your HNG app:
```
/telex-invite dorathypaul48@gmail.com
```

2. Wait for confirmation that you've been added to the organization

3. Log in to [telex.im](https://telex.im) with your registered email

## 🚀 Usage

### Development Mode

Run the bot in development with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Production Mode

Build and run for production:

```bash
npm run build
npm start
```

### Using the Bot on Telex.im

1. **Trigger the bot** by mentioning it in a Telex channel:
   ```
   @bot summarize
   ```

2. **Provide content to summarize**:
   - **Plain text**: Just paste your text
   - **Web page**: Share a URL
   - **Documents**: Share a link to a PDF, DOCX, or TXT file

3. **Specify summary mode** (optional):
   - `brief` - Get bullet points (default)
   - `detailed` - Get paragraph format

### Example Interactions

**Example 1: Summarizing text**
```
User: @bot summarize
Bot: Hey there! 👋 I'm here to help you summarize content. What would you like me to summarize?

User: Summarize this text in brief: [Your long text here]
Bot: Here's a brief summary in bullet points:
• Point 1
• Point 2
• Point 3
```

**Example 2: Summarizing a webpage**
```
User: @bot summarize https://example.com/article detailed
Bot: Here's a detailed summary:

[Paragraph 1 with main points]

[Paragraph 2 with supporting details]
```

**Example 3: Summarizing a document**
```
User: @bot summarize https://example.com/document.pdf brief
Bot: Here's a brief summary in bullet points:
• Key finding 1
• Key finding 2
• Key finding 3
```

## 🔌 API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "agent": "SummarizeBot",
  "version": "1.0.0"
}
```

### A2A Protocol Endpoint (Primary)
```http
POST /a2a/agent/summarizeBot
```

**Request Body:**
```json
{
  "message": "@bot summarize This is a text to summarize",
  "userId": "user-123",
  "channelId": "channel-456",
  "metadata": {}
}
```

**Response:**
```json
{
  "responded": true,
  "message": "Here's a brief summary...",
  "metadata": {
    "agent": "SummarizeBot",
    "timestamp": "2025-11-02T12:00:00.000Z"
  }
}
```

### Webhook Endpoint (Alternative)
```http
POST /webhook
```

**Request Body:**
```json
{
  "text": "@bot summarize content here",
  "user_id": "user-123",
  "channel_id": "channel-456"
}
```

### WebSocket Connection
```
ws://localhost:3000/ws
```

**Message Format:**
```json
{
  "action": "message",
  "text": "@bot summarize",
  "userId": "user-123"
}
```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm test -- --coverage
```

### Test Coverage

The project includes tests for:
- ✅ Summarization tools (text extraction, web scraping)
- ✅ Memory persistence (conversation and summary storage)
- ✅ API endpoints (A2A, webhook, health check)
- ✅ WebSocket communication

## 🚢 Deployment

### Deploying to Railway

1. **Install Railway CLI**:
```bash
npm i -g @railway/cli
```

2. **Login to Railway**:
```bash
railway login
```

3. **Initialize project**:
```bash
railway init
```

4. **Add environment variables** in Railway dashboard:
   - `OPENAI_API_KEY`
   - `PORT` (Railway auto-assigns)
   - `NODE_ENV=production`
   - `MEMORY_STORAGE_PATH=/data/memory`

5. **Deploy**:
```bash
railway up
```

6. **Get your deployment URL**:
```bash
railway domain
```

7. **Update workflow JSON** with your Railway URL:
   - Edit `workflows/summarizeBot.json`
   - Replace `"url"` value with your Railway app URL

### Environment Variables for Production

```env
OPENAI_API_KEY=sk-...
PORT=3000
NODE_ENV=production
AGENT_URL=https://your-app.railway.app/a2a/agent/summarizeBot
MEMORY_STORAGE_PATH=/data/memory
```

### Verifying Deployment

After deployment, test your endpoints:

```bash
# Health check
curl https://your-app.railway.app/health

# Test A2A endpoint
curl -X POST https://your-app.railway.app/a2a/agent/summarizeBot \
  -H "Content-Type: application/json" \
  -d '{"message": "@bot summarize", "userId": "test"}'
```

## 📁 Project Structure

```
HNG_backend_stage3/
├── src/
│   ├── agents/
│   │   └── summarizeAgent.ts       # Main Mastra agent definition
│   ├── tools/
│   │   ├── index.ts                # Tool exports
│   │   └── summarization.ts        # Summarization utilities
│   ├── integrations/
│   │   └── telex.ts                # Telex A2A & WebSocket server
│   ├── utils/
│   │   └── memory.ts               # Persistent memory storage
│   └── index.ts                    # Application entry point
├── workflows/
│   └── summarizeBot.json           # Telex workflow configuration
├── tests/
│   ├── tools.test.ts               # Tool tests
│   ├── memory.test.ts              # Memory tests
│   └── integration.test.ts         # Integration tests
├── data/                           # Memory storage (gitignored)
├── dist/                           # Compiled output (gitignored)
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment template
├── .gitignore
├── jest.config.js                  # Jest configuration
├── package.json
├── Procfile                        # Railway deployment config
├── tsconfig.json                   # TypeScript configuration
└── README.md
```

## 🔍 How It Works

### 1. Message Reception
When a user sends `@bot summarize` on Telex.im, the message is routed to the A2A endpoint.

### 2. Trigger Detection
The bot checks if the message contains the trigger phrase `@bot summarize`.

### 3. Context Loading
The bot loads the user's conversation history and previous summaries from persistent storage.

### 4. Intent Understanding
Using OpenAI GPT-4, the bot understands what the user wants to summarize (text, URL, or file).

### 5. Tool Selection
Based on the content type, the appropriate tool is invoked:
- **summarize-text**: For plain text
- **summarize-url**: For web pages
- **summarize-file**: For PDF, DOCX, TXT files

### 6. Content Extraction
The tool extracts and preprocesses the content:
- Web scraping for URLs
- PDF/DOCX parsing for documents
- Direct text processing

### 7. Summary Generation
GPT-4 generates a summary in the requested format:
- **Brief**: 3-7 bullet points
- **Detailed**: 2-4 paragraphs

### 8. Memory Storage
The conversation and summary are saved to persistent storage for future reference.

### 9. Response Delivery
The formatted summary is sent back to the user on Telex.im.

## 🛠️ Technologies Used

- **[Mastra](https://mastra.ai/)**: AI agent framework
- **[OpenAI GPT-4](https://openai.com/)**: Language model for summarization
- **[Express.js](https://expressjs.com/)**: Web server framework
- **[WebSocket (ws)](https://github.com/websockets/ws)**: Real-time communication
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development
- **[Cheerio](https://cheerio.js.org/)**: Web scraping
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)**: PDF text extraction
- **[mammoth](https://www.npmjs.com/package/mammoth)**: DOCX text extraction
- **[Jest](https://jestjs.io/)**: Testing framework

## 📊 Viewing Agent Logs

To view interactions with your agent on Telex:

```
https://api.telex.im/agent-logs/{channel-id}.txt
```

Get your `channel-id` from the Telex URL bar:
```
https://telex.im/telex-im/home/colleagues/{channel-id}/...
                                         ^^^^^^^^^^^^^^^^
```

## 🐛 Troubleshooting

### Bot doesn't respond
- ✅ Check if the trigger phrase `@bot summarize` is correct
- ✅ Verify your OpenAI API key is valid
- ✅ Check server logs for errors
- ✅ Ensure the agent URL in workflow JSON is correct

### Memory not persisting
- ✅ Check `MEMORY_STORAGE_PATH` is writable
- ✅ Verify `data/memory` directory exists
- ✅ Check file permissions

### Deployment issues
- ✅ Verify all environment variables are set in Railway
- ✅ Check build logs for errors
- ✅ Ensure `Procfile` is configured correctly
- ✅ Test endpoints after deployment

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Dorothy Paul**
- Email: dorathypaul48@gmail.com
- HNG Internship - Stage 3 Backend Task

## 🙏 Acknowledgments

- [HNG Internship](https://hng.tech/) for the opportunity
- [Mastra](https://mastra.ai/) for the excellent AI agent framework
- [Telex.im](https://telex.im/) for the integration platform
- [OpenAI](https://openai.com/) for GPT-4

## 📚 Additional Resources

- [Mastra Documentation](https://docs.mastra.ai/)
- [Telex A2A Protocol](https://docs.telex.im/a2a)
- [OpenAI API Reference](https://platform.openai.com/docs/)

---

Built with ❤️ for HNG Internship Stage 3
