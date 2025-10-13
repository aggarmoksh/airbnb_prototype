# 🐳 Docker Setup for Airbnb Prototype

This guide will help you run the entire Airbnb Prototype application using Docker on any system (Windows, Mac, Linux).

## 📋 Prerequisites

1. **Install Docker Desktop**:
   - **Windows/Mac**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)
   - **Linux**: Install Docker Engine and Docker Compose
   
2. **Verify Installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

## 🚀 Quick Start (Without AI Agent)

Run the entire application with one command:

```bash
docker-compose up -d
```

This will start:
- ✅ MySQL Database (port 3307)
- ✅ Backend Server (port 4000)
- ✅ Frontend Client (port 5173)

**Access the application**: Open your browser to [http://localhost:5173](http://localhost:5173)

## 🤖 With AI Agent (Optional)

If you want to use the AI Concierge feature:

### Option 1: Without Ollama (Fallback Mode)
```bash
docker-compose --profile with-ai up -d
```
The AI agent will return generic recommendations without LLM.

### Option 2: With Ollama (Full AI Features)

1. **Install Ollama** on your host machine:
   - Download from [ollama.com](https://ollama.com)
   
2. **Pull the model**:
   ```bash
   ollama pull llama3.1:8b
   ```

3. **Ensure Ollama is running** on your host (it usually starts automatically)

4. **Start with AI profile**:
   ```bash
   docker-compose --profile with-ai up -d
   ```

The AI agent will connect to Ollama on your host machine via `host.docker.internal:11434`.

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 4000 | http://localhost:4000 |
| AI Agent | 8001 | http://localhost:8001 |
| MySQL | 3307 | localhost:3307 |

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f ai-agent
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove All Data (including database)
```bash
docker-compose down -v
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Access Database
```bash
docker exec -it airbnb-mysql mysql -u root -ppass123 airbnb_dev
```

### View Running Containers
```bash
docker-compose ps
```

## 🔧 Environment Variables

Create a `.env` file in the root directory for custom configuration:

```env
# Optional: Tavily API Key for AI search features
TAVILY_API_KEY=your_tavily_api_key_here

# Optional: Custom database password
MYSQL_ROOT_PASSWORD=your_custom_password

# Optional: Session secret
SESSION_SECRET=your_secret_key
```

## 📦 What Gets Created

When you run Docker Compose, it creates:

1. **Docker Network** (`airbnb-network`): Allows services to communicate
2. **MySQL Volume** (`mysql_data`): Persists database data
3. **Uploads Volume**: Stores user avatars and property photos

## 🐛 Troubleshooting

### Port Already in Use
If you get "port already allocated" errors:

```bash
# Change ports in docker-compose.yml
# For example, change 5173:80 to 5174:80
```

### Database Connection Issues
```bash
# Wait for MySQL to be ready (takes ~30 seconds on first run)
docker-compose logs mysql

# Restart server if it started before MySQL was ready
docker-compose restart server
```

### AI Agent Can't Connect to Ollama
```bash
# On Mac/Windows with Docker Desktop, use:
# OLLAMA_BASE_URL: http://host.docker.internal:11434

# On Linux, use:
# OLLAMA_BASE_URL: http://172.17.0.1:11434
```

### Rebuild Everything from Scratch
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📝 Development vs Production

### Development Mode
For development with hot-reload, use the traditional setup:
```bash
# Terminal 1: Server
cd server && npm install && npm run dev

# Terminal 2: Client
cd client && npm install && npm run dev

# Terminal 3: AI Agent (optional)
cd ai-agent && pip install -r requirements.txt && uvicorn main:app --reload --port 8001
```

### Production Mode
Use Docker Compose as described above for production-like deployment.

## 🔐 Security Notes

For production deployment:
1. Change default passwords in `docker-compose.yml`
2. Set strong `SESSION_SECRET`
3. Use environment variables instead of hardcoded values
4. Enable HTTPS with a reverse proxy (nginx/traefik)
5. Restrict database access

## 📱 Cross-Platform Testing

The Docker setup ensures identical behavior across:
- ✅ Windows 10/11
- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (Ubuntu, Debian, Fedora, etc.)

Your teammates can simply:
1. Clone the repository
2. Run `docker-compose up -d`
3. Open http://localhost:5173

No need to install Node.js, Python, or MySQL!

## 🆘 Need Help?

Check logs for errors:
```bash
docker-compose logs -f
```

Or stop everything and start fresh:
```bash
docker-compose down -v
docker-compose up -d
```

---

**Happy coding!** 🎉

