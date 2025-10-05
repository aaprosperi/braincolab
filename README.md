# 🧠 Brain Co-Lab

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aaprosperi/braincolab)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

Multi-AI Chat Application with Vercel AI Gateway - Connect with multiple AI models (GPT-4, Claude, Gemini, etc.) through a single interface.

## ✨ Features

- 🤖 **Multi-Model Support**: Access 17+ AI models from OpenAI, Anthropic, Google, Meta, and more
- 💰 **Cost Tracking**: Real-time usage and cost monitoring per model
- 🔄 **Model Switching**: Seamlessly switch between different AI models
- 🎨 **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- 🔐 **Secure**: API keys managed through Vercel environment variables
- ⚡ **Fast**: Optimized for performance with Vercel Edge Functions
- 📊 **Usage Analytics**: Track your AI usage and spending

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (for deployment)
- API Gateway key from Vercel

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/aaprosperi/braincolab.git
cd braincolab
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file:
```env
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key_here
```

4. **Run development server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variable: `AI_GATEWAY_API_KEY`
4. Deploy!

The app auto-deploys on push to the main branch.

### Manual Deployment

```bash
npm run build
npm start
```

## 🛠️ Configuration

### Supported AI Models

| Provider | Models | Pricing |
|----------|--------|---------|
| OpenAI | GPT-3.5, GPT-4, GPT-4o | $0.0005 - $0.06/1K tokens |
| Anthropic | Claude Haiku, Sonnet, Opus | $0.00025 - $0.075/1K tokens |
| Google | Gemini Flash, Pro, 2.0 | $0 - $0.005/1K tokens |
| Meta | Llama 3.3 70B | $0.00018/1K tokens |
| Others | Mistral, Grok, DeepSeek, Perplexity | Various |

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app URL (for production) | No |

## 📁 Project Structure

```
braincolab/
├── pages/
│   ├── api/          # API routes
│   │   ├── chat.js   # Main chat endpoint
│   │   └── credits.js # Credits tracking
│   ├── _app.js       # App wrapper
│   ├── index.js      # Landing page
│   └── multiAI.js    # Multi-AI chat interface
├── styles/
│   └── globals.css   # Global styles
├── public/           # Static assets
├── package.json      # Dependencies
└── vercel.json       # Vercel configuration
```

## 🔧 API Routes

### `/api/chat`
- **Method**: POST
- **Body**: `{ messages, model }`
- **Response**: AI model response with usage data

### `/api/credits`
- **Method**: GET
- **Response**: Current credit balance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for hosting and AI Gateway
- [Next.js](https://nextjs.org) for the framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- All AI model providers

## 📧 Support

For support, email aaprosperi@gmail.com or open an issue on GitHub.

---

Built with ❤️ by [Brain Co-Lab Team](https://github.com/aaprosperi)