# 🚀 CodeNexus

<div align="center">

![CodeNexus Banner](https://img.shields.io/badge/CodeNexus-Competitive%20Programming-blueviolet?style=for-the-badge&logo=code&logoColor=white)

**A modern competitive programming platform for developers to sharpen their coding skills**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [API](#-api-reference)

</div>

---

## ✨ Features

### 🎯 Core Features
- **50 Coding Challenges** - Ranging from Easy to Hard difficulty
- **Multi-Language Support** - C++, Python, Java, JavaScript
- **Real-time Code Execution** - Instant feedback on submissions
- **Smart Test Cases** - Sample and hidden test cases for each problem

### 📊 Progress Tracking
- **Activity Heatmap** - GitHub-style contribution graph
- **XP & Leveling System** - Earn XP and level up as you solve challenges
- **Streak Tracking** - Maintain daily solving streaks
- **Achievement Badges** - Unlock badges for milestones

### 🎓 Learning Paths
- **Dynamic Learning Paths** - Database-driven, fully customizable
- **Skill Trees** - Visual progression through topics
- **Hints System** - Unlock hints when stuck (costs XP)
- **Editorials** - Detailed solutions after solving

### ⚔️ Competitive Features
- **Battle Mode** - 1v1 coding battles with real-time matching
- **Leaderboards** - Global rankings by XP
- **Tournaments** - Compete in timed events
- **Teams/Clans** - Join or create coding teams

### 👥 Social Features
- **Friends System** - Add friends and track their progress
- **Discussions** - Comment and discuss solutions
- **Solution Sharing** - Share your solutions publicly
- **Activity Feed** - See what others are solving

---

## 🎮 Demo

### Challenge Interface
<img src="docs/challenge-view.png" alt="Challenge View" width="700"/>

### Heatmap & Profile
<img src="docs/profile-heatmap.png" alt="Profile Heatmap" width="700"/>

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/codenexus.git
cd codenexus
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase_complete_schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### 4. Configure Environment
Create a `.env` file in the root directory:
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_super_secret_jwt_key
```

### 5. Start the Server
```bash
npm start
```

Visit `http://localhost:3000` 🎉

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT (JSON Web Tokens) |
| **Code Execution** | Server-side sandboxed execution |
| **Styling** | Custom CSS with glassmorphism |

---

## 📁 Project Structure

```
codenexus/
├── public/
│   ├── index.html        # Main HTML file
│   ├── app.js            # Frontend JavaScript
│   └── style.css         # Styles
├── server.js             # Express server & API routes
├── supabase_complete_schema.sql  # Database schema
├── .env                  # Environment variables
├── package.json
└── README.md
```

---

## 📚 API Reference

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Register new user |
| `/api/login` | POST | Login and get JWT token |
| `/api/user` | GET | Get current user profile |

### Challenges
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/challenges` | GET | List all challenges |
| `/api/challenges/:id` | GET | Get challenge details |
| `/api/run` | POST | Run code against test cases |

### Learning Paths
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/learning-paths` | GET | List all learning paths |
| `/api/learning-paths/:id` | GET | Get path with challenges |
| `/api/learning-paths/:id/start` | POST | Start a learning path |

### Activity
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/activity/heatmap` | GET | Get user's activity heatmap |
| `/api/activity/feed` | GET | Get global activity feed |

### Social
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leaderboard` | GET | Get global leaderboard |
| `/api/friends` | GET | Get user's friends list |
| `/api/friends/add` | POST | Send friend request |

---

## 🗄 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `challenges` - Coding problems with test cases
- `user_activity` - Daily activity tracking

### Feature Tables
- `learning_paths` - Dynamic learning paths
- `learning_path_challenges` - Path-challenge mapping
- `battles` - 1v1 battle records
- `tournaments` - Tournament events
- `friendships` - Friend connections
- `achievements` - Unlockable badges

---

## 🎨 Customization

### Adding New Challenges
Add to the `initialChallenges` array in `server.js`:
```javascript
{
    id: 51,
    title: "Your Challenge",
    difficulty: "Medium",
    category: "Arrays",
    description: "Problem description...",
    points: 150,
    test_cases: [
        { input: "test input", expected: "expected output" },
        { input: "hidden test", expected: "hidden output", hidden: true }
    ],
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
    editorial: 'Solution explanation...',
    tags: ['arrays', 'sorting'],
    time_limit: 300
}
```

### Adding New Learning Paths
1. Go to Supabase Dashboard → Table Editor → `learning_paths`
2. Insert a new row with name, description, icon, difficulty_level, xp_reward
3. Link challenges in `learning_path_challenges` table
4. Refresh the app - new path appears automatically!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [LeetCode](https://leetcode.com) - Inspiration for challenge format
- [Supabase](https://supabase.com) - Amazing open-source Firebase alternative
- [Font Awesome](https://fontawesome.com) - Icons
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor

---

<div align="center">

**Made with ❤️ by CodeNexus Team**

⭐ Star this repo if you found it helpful!

</div>
