# 🎺 TRUMPETER TV

A modern Christian streaming and learning platform built with Next.js 15, featuring live TV streaming, interactive courses, and community features.

![TRUMPETER TV Logo](public/logo.svg)

## ✨ Features

### 📺 Live Streaming
- YouTube Live integration
- Facebook Live support
- Real-time streaming with chat

### 📚 PreciousMinds Learning Platform
- Interactive courses inspired by Brilliant.org
- XP and leveling system
- Learning streaks and badges
- Leaderboard
- Multiple lesson types:
  - Text & Images
  - Multiple Choice Questions
  - Drag & Drop
  - Code Execution
  - Math Notation (LaTeX)
  - Interactive Simulations

### 🎬 Video Library
- YouTube video integration
- Category organization
- Search functionality

### 🎵 Music
- Gospel music streaming
- Playlist support

### 🙏 Community
- Prayer requests
- Testimonies
- Community engagement

### 📖 Bible Quiz
- Interactive quiz questions
- Score tracking

### ⚙️ Admin Dashboard
- Manage slider images
- Configure live stream URLs
- Add/remove videos
- Slider interval control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/PreciousAlakpa/TrumpeterTv.git

# Navigate to project
cd TrumpeterTv

# Install dependencies
bun install
# or
npm install

# Run development server
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Access

```
Email: admin@trumpetertv.com
Password: TrumpeterTV2024!
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **State:** React Context + localStorage

## 📁 Project Structure

```
trumpeter-tv/
├── public/
│   ├── logo.svg          # Main logo
│   └── logo-text.svg     # Text-only logo
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home page (slider)
│   │   ├── live/page.tsx     # Live streaming
│   │   ├── learn/page.tsx    # Learning platform
│   │   ├── watch/page.tsx    # Video library
│   │   ├── music/page.tsx    # Music page
│   │   ├── community/page.tsx # Community
│   │   ├── quiz/page.tsx     # Bible quiz
│   │   └── admin/dashboard/  # Admin panel
│   ├── components/
│   │   ├── Logo.tsx          # Logo component
│   │   └── ui/               # UI components
│   ├── contexts/
│   │   └── DataContext.tsx   # Global state
│   └── lib/
│       ├── utils.ts          # Utilities
│       └── data.ts           # Type definitions
├── tailwind.config.ts
├── package.json
└── README.md
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PreciousAlakpa/TrumpeterTv)

## 📝 Environment Variables

Create a `.env.local` file for optional features:

```env
# Optional: Supabase for cloud database (not required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

> **Note:** The app works without any environment variables using localStorage.

## 🎨 Customization

### Change Logo
Replace files in `public/`:
- `logo.svg` - Main logo with background
- `logo-text.svg` - Transparent text logo

### Change Brand Colors
Edit `tailwind.config.ts` and `src/app/globals.css`

### Add Courses
Edit `src/contexts/DataContext.tsx` - modify `defaultCourses` and `defaultLessons`

## 👤 Designer

**Designed by Precious Alakpa**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
