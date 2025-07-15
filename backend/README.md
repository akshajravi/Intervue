# Intervue Backend API

A FastAPI-based backend for the Intervue interview preparation platform.

## Features

- **FastAPI Framework**: Modern, fast web framework for Python APIs
- **PostgreSQL Database**: Async database operations with SQLAlchemy
- **CORS Support**: Pre-configured for React frontend (localhost:5173)
- **Environment Configuration**: Flexible settings management
- **Health Check Endpoints**: Monitor API status and system health
- **Structured Architecture**: Clean separation of concerns
- **AI Service Integration**: Ready for OpenAI and Azure services
- **Migration Support**: Gradual migration from Firebase/Supabase

## Project Structure

```
backend/
├── app/
│   ├── api/                # API route handlers
│   │   ├── __init__.py
│   │   └── health.py       # Health check endpoints
│   ├── core/               # Core configuration
│   │   ├── __init__.py
│   │   └── config.py       # Environment settings
│   ├── db/                 # Database configuration
│   │   ├── __init__.py
│   │   └── database.py     # Database setup and connection
│   ├── models/             # SQLAlchemy models
│   │   ├── __init__.py
│   │   └── base.py         # Base model class
│   ├── schemas/            # Pydantic schemas
│   │   └── __init__.py
│   ├── services/           # Business logic
│   │   └── __init__.py
│   └── __init__.py
├── tests/                  # Test files
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables example
└── README.md              # This file
```

## Quick Start

### 1. Prerequisites

- Python 3.9 or higher
- PostgreSQL database
- Virtual environment (recommended)

### 2. Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Setup

```bash
# Copy environment example
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - DATABASE_URL: PostgreSQL connection string
# - SECRET_KEY: Secret key for JWT tokens
# - OPENAI_API_KEY: OpenAI API key (optional)
```

### 4. Database Setup

```bash
# Make sure PostgreSQL is running
# Create database (replace with your database name)
createdb intervue_db

# Update DATABASE_URL in .env file
DATABASE_URL=postgresql://username:password@localhost:5432/intervue_db
```

### 5. Run the Development Server

```bash
# Start the FastAPI server
python main.py

# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

## API Endpoints

### Health Check Endpoints

- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/detailed` - Detailed system health information
- `GET /api/v1/test/cors` - Test CORS configuration with React frontend

### Testing CORS with React Frontend

To test the connection between your React app and this backend:

1. Start the backend server (http://localhost:8000)
2. Start your React app (http://localhost:5173)
3. Make a request to the CORS test endpoint:

```javascript
// In your React app
fetch('http://localhost:8000/api/v1/test/cors')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Application environment | `development` |
| `DEBUG` | Enable debug mode | `True` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SECRET_KEY` | JWT secret key | Required |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `AZURE_SPEECH_KEY` | Azure Speech Service key | Optional |
| `LOG_LEVEL` | Logging level | `INFO` |

## Development

### Adding New Endpoints

1. Create route handlers in `app/api/`
2. Define Pydantic schemas in `app/schemas/`
3. Add business logic in `app/services/`
4. Create database models in `app/models/`
5. Register routes in `main.py`

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run tests
pytest

# Run tests with coverage
pytest --cov=app tests/
```

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## Production Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy with the following settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables for Production

Make sure to set these in your production environment:
- `DATABASE_URL`: Production PostgreSQL URL
- `SECRET_KEY`: Strong secret key
- `ENVIRONMENT`: `production`
- `DEBUG`: `False`
- All API keys for external services

## Migration from Firebase/Supabase

This backend is designed to support gradual migration:

1. **Phase 1**: Run both systems in parallel
2. **Phase 2**: Migrate specific features to FastAPI
3. **Phase 3**: Complete migration and deprecate old services

The configuration includes Firebase settings for seamless integration during migration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and ensure they pass
6. Submit a pull request

## Support

For issues and questions:
- Check the API documentation at `/docs`
- Review the health check endpoints
- Check logs for detailed error information 
- Ensure all environment variables are properly set