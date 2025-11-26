# Crystal Clicker - Competitive Idle Game

A competitive web-based clicker game with user authentication, server-side persistence, weekly leaderboards, and engaging visual/audio effects.

## Features

- 🎮 **Engaging Gameplay**: Click to earn crystals, purchase upgrades and producers
- 👥 **User Authentication**: Register and login with username/password (no email required)
- 🏆 **Weekly Leaderboards**: Compete with other players for top rankings
- 🥇 **Trophy System**: Earn trophies for top 10 placements each week
- 💾 **Server Persistence**: Your progress is saved to the server
- ⏰ **Offline Progress**: Earn crystals even when you're away (up to 24 hours)
- ✨ **Visual Effects**: Particle effects and smooth animations
- 🔊 **Sound Effects**: Satisfying audio feedback for actions
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled tasks for weekly resets

### Frontend
- **HTML5** + **CSS3** + **JavaScript** (Vanilla)
- **HTML5 Canvas** - Particle effects
- **Web Audio API** - Sound effects
- **Modern CSS** - Glassmorphism, gradients, animations

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Setup

1. **Install MongoDB** (if running locally):
   - Download from https://www.mongodb.com/try/download/community
   - Start MongoDB service

2. **Configure Environment Variables**:
   - Edit `server/.env` file
   - Update `MONGODB_URI` with your MongoDB connection string
   - Change `JWT_SECRET` to a secure random string

3. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```
   Server will run on http://localhost:3000

5. **Open the Game**:
   - Open `client/index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     cd client
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server client -p 8000
     ```
   - Navigate to http://localhost:8000

## Game Mechanics

### Clicking
- Click the crystal to earn currency
- Each click earns you crystals based on your click value
- Visual particle effects and sound feedback on each click

### Upgrades
- **Click Multiplier**: Increases your click power by 50% per level
- **Auto Clicker**: Automatically generates clicks per second

### Producers
- **Basic Producer**: Generates 1 crystal/sec
- **Advanced Producer**: Generates 10 crystals/sec
- **Elite Producer**: Generates 100 crystals/sec
- **Legendary Producer**: Generates 1000 crystals/sec

### Cost Scaling
- All upgrades and producers increase in cost by 15% after each purchase
- This creates exponential progression

### Leaderboard
- Weekly competition based on total crystals earned
- Resets every Monday at 00:00 UTC
- Top 10 players receive trophies:
  - 🥇 1st Place: Gold Trophy
  - 🥈 2nd Place: Silver Trophy
  - 🥉 3rd Place: Bronze Trophy
  - 🏅 4th-10th: Participation Trophy

### Offline Progress
- Producers continue generating crystals while you're offline
- Capped at 24 hours of offline earnings
- Notification shows earnings when you return

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify JWT token

### Game
- `GET /api/game/state` - Load game state
- `POST /api/game/save` - Save game state
- `POST /api/game/click` - Record click
- `POST /api/game/purchase` - Purchase upgrade/producer

### Leaderboard
- `GET /api/leaderboard/current` - Current week's leaderboard
- `GET /api/leaderboard/history` - Past leaderboards
- `GET /api/leaderboard/user/:userId` - User's ranking history

### Trophies
- `GET /api/trophies/:userId` - Get user's trophies

## Project Structure

```
clicker-game/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── GameState.js
│   │   ├── Leaderboard.js
│   │   └── Trophy.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── gameRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   └── trophyRoutes.js
│   ├── server.js
│   ├── .env
│   └── package.json
├── client/
│   ├── js/
│   │   ├── api.js
│   │   ├── particles.js
│   │   ├── audio.js
│   │   ├── ui.js
│   │   └── game.js
│   ├── assets/
│   │   └── images/
│   │       ├── click-button.png
│   │       ├── trophy-icons/
│   │       └── upgrade-icons/
│   ├── index.html
│   └── styles.css
└── README.md
```

## Deployment

### Backend Deployment (Heroku, Railway, DigitalOcean, etc.)

1. Set environment variables on your hosting platform
2. Deploy the `server` directory
3. Ensure MongoDB is accessible (use MongoDB Atlas for cloud hosting)

### Frontend Deployment

1. Update `API_URL` in `client/js/api.js` to your deployed backend URL
2. Deploy the `client` directory to any static hosting (Netlify, Vercel, GitHub Pages, etc.)

## Development

### Running Locally
- Backend: `cd server && npm start`
- Frontend: Open `client/index.html` or use a local server

### Auto-save
- Game automatically saves every 30 seconds
- Also saves when you logout

### Weekly Reset
- Automated cron job runs every Monday at 00:00
- Completes current leaderboard
- Awards trophies to top 10 players
- Creates new leaderboard for the new week

## Troubleshooting

### Can't connect to server
- Ensure MongoDB is running
- Check `.env` configuration
- Verify server is running on port 3000

### CORS errors
- Make sure the backend CORS is configured correctly
- Update `API_URL` in `api.js` to match your backend URL

### Images not loading
- Check that image files are in the correct directories
- Verify file paths in HTML/CSS

## Credits

Created with modern web technologies and best practices for incremental game development.

## License

MIT License - Feel free to use and modify for your own projects!
