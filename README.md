# HeyPico.ai Full-Stack Test Project

A comprehensive full-stack AI-powered location assistant application with FastAPI backend and React frontend, featuring intelligent place search using Google Maps API and LLM integration.


## 📁 Project Structure

```
├── backend/                 # FastAPI backend service
│   ├── services/           # Business logic services
│   │   ├── llm_service.py  # LLM integration and chat logic
│   │   ├── maps_service.py # Google Maps API integration
│   │   ├── auth_service.py # Authentication and JWT handling
│   │   └── rate_limiter.py # Rate limiting implementation
│   ├── configs/            # Configuration management
│   ├── main.py            # FastAPI application entry point
│   └── requirements.txt   # Python dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── modules/       # Feature-based modules
│   │   │   ├── AIChat/    # Chat interface components
│   │   │   └── Map/       # Map integration components
│   │   ├── libs/          # Utility libraries
│   │   └── configs/       # Frontend configuration
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # Styling configuration
├── llm/                   # Local LLM service (Ollama)
└── docker-compose.yml     # Multi-service orchestration
```

## 🚀 Features Overview

### Core Features Implemented

✅ **AI Chat Interface**
- Interactive chat UI
- Markdown support for rich text responses
- Message history persistence using local storage
- Loading states and error handling
- Clear chat functionality

✅ **Intelligent Location Search**
- Natural language processing for location queries
- Google Maps API integration for place discovery
- Smart intent detection to determine when location search is needed
- Follow-up question handling for previously searched places

✅ **Interactive Maps Integration**
- Embedded Google Maps with multiple location markers
- Place details display (name, rating, address, reviews)
- Direct links to Google Maps for directions
- Responsive map container with modern UI

✅ **Authentication & Security**
- JWT-based authentication system (now only dummy bypass) because we don't use database here
- Rate limiting to prevent API abuse (now only in memory)
- CORS protection with configurable origins
- Secure token storage and validation

✅ **Modern UI/UX**
- Clean, responsive design using DaisyUI and TailwindCSS
- Dark/light theme support
- Mobile-friendly interface
- Intuitive chat bubbles with user/AI distinction

## 🎯 Requirements Achievement

This project successfully meets all the specified requirements:

### ✅ Local/Cloud LLM Integration (OpenAI Compatible API)
- **Flexible LLM Configuration**: Supports both local and cloud LLM (OpenAI Compatible) providers
- **Local Setup**: Ollama integration (I use phi3:3.8b model)
- **Open WebUI**: Successfully installed and accessible at `http://localhost:3000`

### ✅ Google Maps Integration
- **Embedded Maps**: Interactive maps showing search results
- **Place Details**: Rich information display with ratings and reviews
- **Navigation Links**: Direct integration with Google Maps for directions
- **Responsive Design**: Maps adapt to different screen sizes

### ✅ Backend API with Best Practices
- **FastAPI Framework**: Modern, fast, and well-documented API
- **Rate Limiting**: Implemented to prevent abuse and ensure fair usage
- **Authentication**: Secure JWT-based auth system
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

### ✅ Frontend User Interface
- **React + TypeScript**: Modern, type-safe frontend development
- **Real-time Chat**: Smooth messaging experience with loading states
- **Map Integration**: Seamless display of location results
- **Responsive Design**: Works across desktop and mobile devices

## 🧠 LLM Configuration

### Cloud LLM (Current Setup)

Due to hardware limitations on MacBook, the project is configured to use **Cloud LLM (OpenAI)** by default:

```env
# Cloud LLM Configuration (Recommended for production)
USE_LOCAL_LLM=false
CLOUD_LLM_API_KEY=your_openai_api_key
CLOUD_MODEL_NAME=gpt-3.5-turbo
CLOUD_LLM_URL=https://api.openai.com/v1/chat/completions
```

### Local LLM (Available but Optional)

Local LLM setup is **successfully installed** and can be tested via Open WebUI:

```env
# Local LLM Configuration (For testing/development)
USE_LOCAL_LLM=true
LOCAL_LLM_URL=http://host.docker.internal:11434/v1/chat/completions
LOCAL_MODEL_NAME=phi3:3.8b
```

**Access Local App:**
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

**Access Local LLM:**
- Open WebUI: `http://localhost:3000`
- Ollama API: `http://localhost:11434`

## 🛡️ Rate Limiting & Security

### Rate Limiting Implementation

Implemented comprehensive rate limiting to ensure API stability:

```python
# Rate limiting configuration
class RateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
```

**Features:**
- ⏱️ Token-based rate limiting (10 requests per minute per user)
- 🔄 Sliding window algorithm for request tracking
- 📊 Real-time request monitoring and counting
- ⚠️ Graceful error responses when limits exceeded
- 💾 In-memory storage for rate limit data

**Limitations:**
- ⚠️ Rate limiter uses in-memory storage only (no database integration)
- 🔄 Rate limit data is reset when server restarts
- 📊 Not suitable for distributed/multi-instance deployments
- 💡 Designed for demonstration or single-instance production only

### Security Measures

**JWT Authentication:**
- 🔐 Secure token-based authentication system
- ⏰ Configurable token expiration (default: 24 hours)
- 🔒 HMAC SHA-256 signature verification
- 👤 User identification through token payload

**Additional Security:**
- 🌐 CORS protection with configurable origins
- 🛡️ Input validation and sanitization
- 🚫 No sensitive data logging
- 🔒 Environment-based configuration management

**Security Limitations:**
- ⚠️ Uses dummy authentication (username/password from env)
- 🔄 No user registration or password hashing
- 💾 No persistent user session management
- 📝 Designed for demonstration purposes only

## 🎨 Frontend UI Features

### Chat Interface
- **Modern Design**: Clean chat bubbles with user/AI distinction
- **Rich Text**: Markdown rendering for formatted responses
- **Interactive Elements**: Buttons, loading states, and animations
- **Responsive Layout**: Adapts to different screen sizes

### Map Integration
- **Embedded Maps**: Google Maps with custom styling
- **Multiple Markers**: Display multiple locations simultaneously
- **Place Cards**: Rich information display with ratings
- **Navigation Links**: Direct integration with Google Maps

### User Experience
- **Real-time Updates**: Instant message delivery and responses
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API calls
- **Persistent Storage**: Chat history saved locally

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose
- Google Maps API keys (Server API Key and Embed API Key)
- OpenAI API key (for cloud LLM)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd heypico.ai-fullstack-test
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:
   ```env
   # Google Maps API Keys
   GMAPS_SERVER_KEY=your_google_maps_server_api_key
   GMAPS_EMBED_KEY=your_google_maps_embed_api_key

   # Authentication
   DUMMY_BYPASS_UNAME=your_username
   DUMMY_BYPASS_PASSWORD=your_password
   FRONTEND_ORIGIN=http://localhost:5173

   # LLM Configuration (Choose one)
   # For Cloud LLM (Recommended)
   USE_LOCAL_LLM=false
   CLOUD_LLM_API_KEY=your_openai_api_key

   # For Local LLM (Optional)
   # USE_LOCAL_LLM=true
   ```

### Development Mode

#### Option 1: Docker Development (Recommended)

```bash
# Build and start all services
docker compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker compose -f docker-compose.dev.yml up -d --build
```

**Services will be available at:**
- 🌐 Frontend: `http://localhost:5173`
- 🔧 Backend: `http://localhost:8000`
- 📚 API Docs: `http://localhost:8000/docs`
- 🤖 Open WebUI (Local LLM): `http://localhost:3000`

#### Option 2: Local Development

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

## 📖 API Documentation

Once the backend is running, comprehensive API documentation is available:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Endpoints

- `GET /healthz` - Health check endpoint
- `POST /v1/auth` - Authentication endpoint
- `POST /v1/chat` - AI chat with location search

### Authentication Flow

1. **Get Token:**
   ```bash
   curl -X POST http://localhost:8000/v1/auth \
     -H "Content-Type: application/json" \
     -d '{"username":"your_username","password":"your_password"}'
   ```

2. **Use Token:**
   ```bash
   curl -X POST http://localhost:8000/v1/chat \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"message":"Find me good restaurants in New York"}'
   ```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pip install pytest pytest-asyncio httpx
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:coverage
```

## 🚀 Production Deployment

### Docker Production Build

```bash
# Build production images
docker compose -f docker-compose.yml build

# Deploy to production
docker compose -f docker-compose.yml up -d
```

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|----------|
| `GMAPS_SERVER_KEY` | Google Maps Server API Key | Yes | - |
| `GMAPS_EMBED_KEY` | Google Maps Embed API Key | Yes | - |
| `CLOUD_LLM_API_KEY` | OpenAI API Key | Yes* | - |
| `DUMMY_BYPASS_UNAME` | Auth username | No | `admin` |
| `DUMMY_BYPASS_PASSWORD` | Auth password | No | `password` |
| `USE_LOCAL_LLM` | Use local vs cloud LLM | No | `false` |
| `FRONTEND_ORIGIN` | Frontend URL for CORS | No | `http://localhost:5173` |

*Required when `USE_LOCAL_LLM=false`

## 🔧 Troubleshooting

### Common Issues

1. **LLM Connection Issues**
   - Verify API keys are correct
   - Check network connectivity
   - Ensure Ollama is running for local LLM

2. **Google Maps Not Loading**
   - Verify API keys have proper permissions
   - Check API quotas in Google Cloud Console
   - Ensure Maps JavaScript API is enabled

3. **Rate Limiting Errors**
   - Wait for rate limit window to reset
   - Check if multiple users are using same token
   - Adjust rate limits in configuration if needed

4. **Docker Issues**
   - Run `docker compose down -v` to clean volumes
   - Rebuild with `docker compose build --no-cache`
   - Check port conflicts

### Development Tips

- 📊 Use `docker compose logs <service-name>` to view service logs
- 🔄 Backend auto-reloads on code changes in development mode
- ⚡ Frontend supports hot module replacement (HMR)
- 📚 API documentation is automatically generated from FastAPI schemas
- 🤖 Test local LLM via Open WebUI before integrating

---

**Built with ❤️ By Gading Nasution using FastAPI, React, and modern web technologies**
