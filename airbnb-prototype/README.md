# 🏠 Airbnb Prototype

A full-stack Airbnb clone with AI-powered travel concierge features.

## ✨ Features

### For Travelers
- 🔍 Search properties by location, dates, and guest count
- 📅 Book properties with availability checking
- ⭐ Save favorite properties
- 🤖 AI Travel Concierge (personalized itineraries, restaurant recommendations, packing lists)
- 👤 Profile management with avatar upload

### For Property Owners
- 🏡 Add, edit, and delete properties
- 📸 Upload property photos (up to 10 per property)
- 📊 Owner dashboard with statistics
- 📬 Manage booking requests (accept/decline)
- 📈 View booking history

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: MySQL 8.0
- **AI Agent**: Python, FastAPI, LangChain, Ollama
- **External APIs**: Tavily (search), Open-Meteo (weather & geocoding)

---

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run the application on **any system** (Windows, Mac, Linux):

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed

### One-Command Setup
```bash
docker-compose up -d
```

That's it! Open [http://localhost:5173](http://localhost:5173) in your browser.

**📖 For detailed Docker instructions**, see [DOCKER_README.md](./DOCKER_README.md)

### Quick Docker Commands
```bash
# Start everything
docker-compose up -d

# With AI Agent
docker-compose --profile with-ai up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Or use Makefile
make up        # Start services
make up-ai     # Start with AI
make logs      # View logs
make down      # Stop services
```

---

## 🛠️ Manual Setup (Development)

If you prefer to run services individually:

### Prerequisites
- Node.js 18+
- Python 3.11+
- MySQL 8.0
- (Optional) Ollama for AI features

### 1. Database Setup
```bash
# Start MySQL (Docker)
docker run -d \
  -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=pass123 \
  -e MYSQL_DATABASE=airbnb_dev \
  --name airbnb-mysql \
  mysql:8.0

# Or use your local MySQL installation
```

### 2. Backend Server
```bash
cd server
npm install

# Create .env file
echo "DATABASE_URL=mysql://root:pass123@localhost:3307/airbnb_dev" > .env

# Run migrations
npx prisma migrate deploy

# Start server
npm run dev
```

Server runs on http://localhost:4000

### 3. Frontend Client
```bash
cd client
npm install
npm run dev
```

Client runs on http://localhost:5173

### 4. AI Agent (Optional)
```bash
cd ai-agent
pip install -r requirements.txt

# Install and start Ollama (for full AI features)
# Download from https://ollama.com
ollama pull llama3.1:8b

# Start AI agent
uvicorn main:app --reload --port 8001
```

AI Agent runs on http://localhost:8001

---

## 📁 Project Structure

```
airbnb-prototype/
├── client/                # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (auth)
│   │   └── api.js        # Axios instance
│   └── Dockerfile
├── server/               # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── index.js      # Entry point
│   ├── prisma/           # Database schema & migrations
│   ├── uploads/          # User uploads (avatars, photos)
│   └── Dockerfile
├── ai-agent/             # FastAPI AI service
│   ├── main.py           # AI concierge logic
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml    # Docker orchestration
├── Makefile              # Convenience commands
└── README.md
```

---

## 🔑 Key Features Explained

### Authentication & Roles
- **Session-based authentication** with MySQL session store
- **Two user roles**: TRAVELER (browse/book) and OWNER (manage properties)
- **Protected routes** based on user role

### Property Management (Owners)
- Create properties with rich details (location, pricing, amenities)
- Upload multiple photos per property
- Set availability date ranges
- Real-time booking request management

### Booking System
- **Date availability checking** with conflict detection
- **Booking statuses**: PENDING → ACCEPTED/CANCELLED
- **Accepted bookings block dates** for other travelers
- Travelers can view their booking history

### AI Travel Concierge
- **Personalized itineraries** based on location, dates, and preferences
- **Weather-aware recommendations** via Open-Meteo API
- **Local POI search** via Tavily API
- **Restaurant suggestions** with dietary filters
- **Smart packing lists** based on weather and activities
- **Fallback mode** works without LLM (generic recommendations)

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - Search properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (owner)
- `PUT /api/properties/:id` - Update property (owner)
- `DELETE /api/properties/:id` - Delete property (owner)
- `GET /api/properties/mine` - Get my properties (owner)

### Bookings
- `POST /api/bookings` - Create booking (traveler)
- `GET /api/bookings` - Get my bookings
- `PUT /api/bookings/:id/status` - Accept/decline booking (owner)
- `PUT /api/bookings/:id/cancel` - Cancel booking (traveler)

### Favorites
- `POST /api/favorites/:propertyId` - Add favorite
- `DELETE /api/favorites/:propertyId` - Remove favorite

### AI Agent
- `POST /agent/plan` - Generate travel plan

---

## 🧪 Testing the Application

### Test as Traveler
1. Sign up with role "Traveler"
2. Search for properties (try "Miami, FL, USA")
3. View property details
4. Make a booking request
5. Click "Agent AI" to get travel recommendations

### Test as Owner
1. Sign up with role "Owner"
2. Click "Add Property" button
3. Fill in property details and upload photos
4. View your dashboard
5. Accept/decline booking requests

---

## 🐛 Troubleshooting

### Port conflicts
If ports 3307, 4000, 5173, or 8001 are in use, change them in `docker-compose.yml`

### Database connection errors
```bash
# Check if MySQL is running
docker-compose ps mysql

# View MySQL logs
docker-compose logs mysql
```

### AI Agent not working
- Ensure Ollama is installed and running
- Check AI agent logs: `docker-compose logs ai-agent`
- AI will work in fallback mode without Ollama (generic recommendations)

### Build errors
```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 📝 Environment Variables

Create `.env` files for custom configuration:

**Server** (`server/.env`):
```env
DATABASE_URL=mysql://root:pass123@localhost:3307/airbnb_dev
SESSION_SECRET=your-secret-key
CLIENT_ORIGIN=http://localhost:5173
```

**AI Agent** (`ai-agent/.env`):
```env
GOOGLE_API_KEY=your_gemini_api_key  => This is required (shifted to google api key for better responses)
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1:8b
TAVILY_API_KEY=your_tavily_key
```

---

## 📄 License

This is a prototype project for educational purposes.

---

## 🤝 Contributing

This project is designed for team collaboration. Each team member can:
1. Clone the repository
2. Run `docker-compose up -d`
3. Start coding!

No need to install Node.js, Python, or MySQL manually.

---

## 📞 Support

For issues or questions:
1. Check [DOCKER_README.md](./DOCKER_README.md) for Docker-specific help
2. View logs: `docker-compose logs -f`
3. Rebuild: `docker-compose up -d --build`

---

**Built with ❤️ for easy deployment and team collaboration**

