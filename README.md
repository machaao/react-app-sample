# react-todo

A project created with MACH-AI

## Overview

This project was created with [MACH-AI](https://machai.live) - your AI coding assistant for building production-scale personalized web and mobile apps.

## Features

- 🚀 **Production Ready**: Built with best practices for scalability
- 🤖 **AI-Powered**: Enhanced with MACH-AI development tools
- 🔧 **MACHAAO Integration**: Ready for MACHAAO platform deployment
- 📱 **Cross-Platform**: Supports web and mobile development

## Quick Start

### Prerequisites

- Python 3.10+ or Node.js 16+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd react-todo

# Install dependencies
npm install
```

### Configuration

1. **Create a MACHAAO App**:
   - Visit [MACHAAO Developer Portal](https://portal.messengerx.io)
   - Create a new app and get your credentials

2. **Set up environment variables**:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your MACHAAO credentials:
   # - MACHAAO_API_TOKEN
   # - MACHAAO_APP_ID
   # - MACHAAO_DEVELOPER_TOKEN
   ```

### Running the Application

**Development Mode** (Frontend + Backend):
```bash
# Terminal 1: Start backend server
npm run dev:server

# Terminal 2: Start frontend dev server
npm run dev
```

**Production Mode**:
```bash
# Build and start
npm run build
npm start
```

The app will be available at:
- Frontend: http://localhost:5173 (dev mode)
- Backend API: http://localhost:3000
- Production: http://localhost:3000 (serves both)

## Development with MACH-AI

This project is optimized for development with MACH-AI. To get started:

1. **Install MACH-AI**:
   ```bash
   bash <(curl -fsSL https://cdn.machaao.com/static/mach-ai/install.sh)
   ```

2. **Start AI-assisted development**:
   ```bash
   cd react-todo
   mach-ai
   ```

3. **Add files to AI context**:
   ```
   /add src/
   /add *.py
   ```

4. **Start coding with AI**:
   Just describe what you want to build, and MACH-AI will help you implement it!

## MACHAAO Platform Integration

This project is ready for deployment on the MACHAAO platform:

### API Integration

```bash
// Example MACHAAO API usage
const response = await fetch(`${process.env.MACHAAO_API_BASE_URL}/users`, {
    headers: {
        'Authorization': `Bearer ${process.env.MACHAAO_API_TOKEN}`,
        'Content-Type': 'application/json'
    }
});
```

### Deployment

Deploy directly to MACHAAO platform using MACH-AI:

```bash
# In your project directory with MACH-AI
/deploy
```

## Project Structure

```
react-todo/
├── src/
├── app.py          # Main application
├── config.py       # Configuration
└── utils/          # Utilities
├── README.md
└── requirements.txt    # Python dependencies
package.json       # Node.js dependencies (if applicable)
.env              # Environment variables
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# MACHAAO API Configuration
MACHAAO_API_TOKEN=your_api_token_here
MACHAAO_BASE_URL=https://api.machaao.com/v1

# Application Configuration
PORT=3000
NODE_ENV=development
```

### MACHAAO App Setup

1. Create an app on [MACHAAO Developer Portal](https://dev.machaao.com)
2. Get your API token
3. Configure the token in your environment

## Available Scripts

- `npm start` or `python app.py` - Start the application
- `npm test` or `python -m pytest` - Run tests
- `npm run build` - Build for production

## API Documentation

### Endpoints

- `GET /` - Health check
- `POST /webhook` - MACHAAO webhook handler
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes using MACH-AI for AI-assisted development
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## Support

- 📧 Email: support@machaao.com
- 🌐 Website: [machai.live](https://machai.live)
- 📖 Documentation: [MACH-AI Docs](https://github.com/machaao/mach-ai)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using [MACH-AI](https://machai.live) - Your AI Coding Assistant**
