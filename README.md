# HeyPico.ai Full-Stack Test Project

A full-stack application with FastAPI backend and React frontend for place search functionality using Google Maps API.

## Project Structure

```
├── backend/           # FastAPI backend service
│   ├── services/      # Business logic services
│   ├── main.py        # FastAPI application entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/          # React frontend application
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── llm/              # LLM service
│   └── Dockerfile
└── docker-compose.yml # Multi-service orchestration
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose
- Google Maps API keys (Server API Key and Embed API Key)

## Environment Setup

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

   # Auth Configuration
   DUMMY_BYPASS_UNAME=your_username
   DUMMY_BYPASS_PASSWORD=your_password
   FRONTEND_ORIGIN=http://localhost:5173
   ```

## Development Mode

### Option 1: Local Development (Recommended)

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

#### Frontend Setup
```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Option 2: Docker Development

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

Services will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Backend API docs: `http://localhost:8000/docs`

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Main Endpoints

- `GET /healthz` - Health check endpoint
- `POST /v1/places/search` - Search for places using Google Maps API

### Authentication

Request a token using the `/v1/auth` endpoint with the dummy credentials:
```bash
curl -X POST http://localhost:8000/v1/auth -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

Use the returned token for authenticated requests:
```bash
Authorization: Bearer <token>
```

## Testing

### Backend Testing
```bash
cd backend

# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Frontend Testing
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Production Deployment

### Docker Production Build

1. **Update environment variables for production**
   ```env
   FRONTEND_ORIGIN=https://your-domain.com
   DUMMY_BYPASS_UNAME=your_username
   DUMMY_BYPASS_PASSWORD=your_password
   ```

2. **Build and deploy with Docker Compose**
   ```bash
   # Build production images
   docker-compose -f docker-compose.yml build

   # Deploy to production
   docker-compose -f docker-compose.yml up -d
   ```

### Manual Production Deployment

#### Backend Deployment
```bash
cd backend

# Install production dependencies
pip install -r requirements.txt

# Run with production ASGI server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Frontend Deployment
```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Serve static files (using serve or your preferred static server)
npx serve -s dist -l 5173
```

### Cloud Deployment Options

#### AWS/GCP/Azure
- Use container services (ECS, Cloud Run, Container Instances)
- Deploy Docker images to container registries
- Set up load balancers and SSL certificates

#### Vercel/Netlify (Frontend)
```bash
# Frontend can be deployed to Vercel/Netlify
# Build command: npm run build
# Output directory: dist
```

#### Railway/Render (Full-stack)
- Connect your Git repository
- Configure environment variables
- Deploy both services with automatic builds

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|----------|
| `GMAPS_SERVER_KEY` | Google Maps Server API Key | Yes | - |
| `GMAPS_EMBED_KEY` | Google Maps Embed API Key | Yes | - |
| `DUMMY_BYPASS_UNAME` | Dummy username for auth | No | `admin` |
| `DUMMY_BYPASS_PASSWORD` | Dummy password for auth | No | `password` |
| `FRONTEND_ORIGIN` | Frontend URL for CORS | No | `http://localhost:5173` |

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_ORIGIN` matches your frontend URL
   - Check that CORS middleware is properly configured

2. **Google Maps API Errors**
   - Verify API keys are correct and have proper permissions
   - Check API quotas and billing in Google Cloud Console

3. **Docker Issues**
   - Run `docker-compose down -v` to clean up volumes
   - Rebuild images with `docker-compose build --no-cache`

4. **Port Conflicts**
   - Change ports in `docker-compose.yml` if defaults are occupied
   - Update `FRONTEND_ORIGIN` accordingly

### Development Tips

- Use `docker-compose logs <service-name>` to view service logs
- Backend auto-reloads on code changes in development mode
- Frontend supports hot module replacement (HMR)
- API documentation is automatically generated from FastAPI schemas

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
