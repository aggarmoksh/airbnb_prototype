# 👥 Team Setup Guide

Quick guide for team members to get the Airbnb Prototype running on their machines.

## 🎯 Goal
Get the entire application running in under 5 minutes on **any operating system**.

---

## 📋 Step 1: Install Docker Desktop

### Windows
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Run the installer
3. Restart your computer
4. Open Docker Desktop and wait for it to start

### Mac
1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Drag Docker.app to Applications folder
3. Open Docker Desktop from Applications
4. Wait for it to start (whale icon in menu bar)

### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add yourself to docker group (logout and login after this)
sudo usermod -aG docker $USER
```

---

## 📥 Step 2: Clone the Repository

```bash
git clone <repository-url>
cd airbnb-prototype
```

---

## 🚀 Step 3: Start the Application

### Option A: Using Script (Easiest)

**Windows:**
```cmd
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Option B: Using Docker Compose Directly

**Without AI Agent:**
```bash
docker-compose up -d
```

**With AI Agent (optional):**
```bash
docker-compose --profile with-ai up -d
```

### Option C: Using Makefile (if you have `make`)

```bash
make up        # Without AI
make up-ai     # With AI
```

---

## ✅ Step 4: Verify Everything is Running

1. **Open your browser** to http://localhost:5173
2. You should see the Airbnb sign-up page
3. **Create an account** (choose Traveler or Owner role)
4. Start using the app!

---

## 🔍 Troubleshooting

### "Port is already allocated" Error

**Windows:**
```cmd
netstat -ano | findstr :5173
taskkill /PID <pid> /F
```

**Mac/Linux:**
```bash
lsof -ti:5173 | xargs kill -9
```

Or change the port in `docker-compose.yml`:
```yaml
client:
  ports:
    - "5174:80"  # Changed from 5173 to 5174
```

### Services Not Starting

**View logs:**
```bash
docker-compose logs -f
```

**Check which services are running:**
```bash
docker-compose ps
```

**Restart everything:**
```bash
docker-compose down
docker-compose up -d
```

### Database Connection Issues

Wait 30-60 seconds for MySQL to initialize on first run:
```bash
docker-compose logs mysql
```

Once you see "ready for connections", restart the server:
```bash
docker-compose restart server
```

### Complete Reset

```bash
# Stop and remove everything (including database data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

---

## 📱 What You Get

Once running, you have access to:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React app (Signup/Login/Browse) |
| **Backend API** | http://localhost:4000 | Express REST API |
| **AI Agent** | http://localhost:8001 | Travel concierge (if enabled) |
| **Database** | localhost:3307 | MySQL (use any client) |

---

## 🛠️ Daily Development Workflow

### Start your day
```bash
docker-compose up -d
```

### View logs while developing
```bash
docker-compose logs -f
```

### Stop at end of day
```bash
docker-compose down
```

### After pulling new code
```bash
docker-compose down
docker-compose up -d --build
```

---

## 🎨 Making Code Changes

### Frontend Changes (React)
1. Edit files in `client/src/`
2. Rebuild and restart:
   ```bash
   docker-compose up -d --build client
   ```

### Backend Changes (Node.js)
1. Edit files in `server/src/`
2. Rebuild and restart:
   ```bash
   docker-compose up -d --build server
   ```

### Database Schema Changes
1. Edit `server/prisma/schema.prisma`
2. Create migration:
   ```bash
   docker-compose exec server npx prisma migrate dev --name your_migration_name
   ```

### AI Agent Changes (Python)
1. Edit `ai-agent/main.py`
2. Rebuild and restart:
   ```bash
   docker-compose up -d --build ai-agent
   ```

---

## 🔐 Default Credentials

### Database
- **Host**: localhost
- **Port**: 3307
- **User**: root
- **Password**: pass123
- **Database**: airbnb_dev

### Application
- Create your own account on signup page
- Choose either **Traveler** or **Owner** role

---

## 🤖 AI Features (Optional)

To use the AI Travel Concierge:

1. **Install Ollama** on your machine (not in Docker):
   - Download from https://ollama.com
   
2. **Pull the model:**
   ```bash
   ollama pull llama3.1:8b
   ```

3. **Ensure Ollama is running** (it auto-starts usually)

4. **Start app with AI:**
   ```bash
   docker-compose --profile with-ai up -d
   ```

**Without Ollama**, the AI will still work but return generic recommendations.

---

## 📊 Useful Docker Commands

```bash
# See what's running
docker-compose ps

# View logs of all services
docker-compose logs -f

# View logs of specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mysql

# Restart a service
docker-compose restart server

# Stop everything
docker-compose down

# Stop and remove all data
docker-compose down -v

# Rebuild everything from scratch
docker-compose build --no-cache
docker-compose up -d

# Access MySQL shell
docker exec -it airbnb-mysql mysql -u root -ppass123 airbnb_dev

# Access server container shell
docker exec -it airbnb-server sh
```

---

## 🎓 Learning Resources

- **Docker Basics**: https://docs.docker.com/get-started/
- **Docker Compose**: https://docs.docker.com/compose/
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
- **Prisma Docs**: https://www.prisma.io/docs

---

## 💡 Tips for Team Collaboration

1. **Always pull before starting work:**
   ```bash
   git pull
   docker-compose up -d --build
   ```

2. **Share your environment setup:**
   - If you changed anything in `docker-compose.yml`, communicate with team
   - Don't commit `.env` files (they're in `.gitignore`)

3. **Database consistency:**
   - Share migration files (`server/prisma/migrations/`)
   - Never modify migration files after they're committed

4. **Clean docker occasionally:**
   ```bash
   docker system prune -a
   ```

5. **Use feature branches:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## ❓ FAQ

**Q: Do I need to install Node.js or Python?**  
A: No! Docker handles everything.

**Q: Can I use my local database instead?**  
A: Yes, but you'll need to update `DATABASE_URL` in the server's environment.

**Q: How do I see API requests?**  
A: Check server logs: `docker-compose logs -f server`

**Q: How do I reset the database?**  
A: `docker-compose down -v` then `docker-compose up -d`

**Q: The app is slow in Docker**  
A: Increase Docker Desktop resources (Settings → Resources → Advanced)

**Q: Can I develop without Docker?**  
A: Yes! See the "Manual Setup" section in the main README.

---

## 🆘 Still Having Issues?

1. Check logs: `docker-compose logs -f`
2. Verify Docker is running: `docker ps`
3. Try a complete reset:
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up -d
   ```
4. Ask your team on Slack/Discord
5. Check the main [README.md](./README.md) and [DOCKER_README.md](./DOCKER_README.md)

---

**Happy coding! 🎉**

Remember: If it works in Docker on your machine, it will work the same on everyone else's machine!

