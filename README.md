# 💬 FlickrTalk - Private Chat Application

<div align="center">

**A modern, real-time private chat application built with React, TypeScript, and Supabase. Create temporary chat rooms with secret codes and enjoy secure, private conversations.**

</div>

## ✨ Features

### 🔐 **Private Chat Rooms**
- **Create rooms** with unique IDs and security codes
- **Join existing rooms** using room ID and security code
- **Temporary storage** - messages are not permanently stored
- **Secure access** - only users with correct codes can join

### 💬 **Real-Time Messaging**
- **Instant message delivery** across all users in the room
- **Message persistence** - messages load on page refresh
- **Cross-device communication** - works seamlessly across browsers
- **Optimistic UI updates** for smooth user experience

### 👤 **User Management**
- **Display name customization** - change your name anytime
- **Name change notifications** - other users see when names change
- **System messages** - beautiful notifications for room activities
- **User presence** - see when users join/leave rooms

### 🎨 **Modern UI/UX**
- **Responsive design** - works on desktop and mobile
- **Dark/Light themes** - toggle between themes
- **Beautiful animations** - smooth transitions and effects
- **Intuitive interface** - easy to use for all users

### 🔧 **Technical Features**
- **Real-time subscriptions** using Supabase Realtime
- **Fallback polling** for reliable message delivery
- **Error handling** with user-friendly messages
- **TypeScript** for type safety and better development

## 🚀 Live Demo

**Visit the live application:** [flickr-talk.vercel.app](https://flickr-talk.vercel.app)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Deployment**: Vercel
- **State Management**: React Context + Custom Hooks
- **Real-time**: Supabase Realtime subscriptions

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/gpl-gowthamchand/FlickrTalk.git
cd FlickrTalk
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run this SQL in your Supabase SQL editor:
```sql
-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    room_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE public.messages 
ADD CONSTRAINT messages_room_id_fkey 
FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE;

-- Enable RLS and create policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON public.messages
    FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.messages TO anon;
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
```

## 🏗️ Project Structure

```
FlickrTalk/
├── src/
│   ├── components/          # UI components
│   │   ├── chat/           # Chat-related components
│   │   ├── ui/             # Reusable UI components
│   │   └── app/            # App-specific components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # External service integrations
│   ├── pages/               # Page components
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── public/                  # Static assets
├── supabase/                # Supabase configuration
└── package.json             # Dependencies and scripts
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Get your project URL and anon key
3. Update the `.env` file with your credentials
4. Run the database setup SQL

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📱 Usage

### Creating a Room
1. Visit the application
2. Enter your display name
3. Click "Create Room"
4. Share the room ID and security code with others

### Joining a Room
1. Enter your display name
2. Input the room ID and security code
3. Click "Join Room"

### Changing Display Name
1. Click the menu (three dots) in the top right
2. Select "Change Profile Name"
3. Enter your new name
4. Other users will see a notification about the name change

## 🔒 Security Features

- **Secret codes** required to join rooms
- **Temporary storage** - messages not permanently stored
- **Room verification** - validates room existence and access
- **Anonymous access** - no user accounts required

## 🚀 Deployment

The application is automatically deployed to Vercel on every push to the main branch.

**Live URL**: [flickr-talk.vercel.app](https://flickr-talk.vercel.app)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

**G P L Gowtham Chand**
- **GitHub**: [@gpl-gowthamchand](https://github.com/gpl-gowthamchand)
- **Website**: [gowthamchand.vercel.app](https://gowthamchand.vercel.app)
- **Email**: gpl.gowthamchand@gmail.com

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

## 🤖 AI & Development Tools

This project was developed with the assistance of various AI tools and development assistants:

- **💡 Original Concept & Ideas**: ME (the genius behind this whole thing! 🤭😅)
- **🤖 ChatGPT**: Provided suggestions, planning guidance, and content recommendations
- **🚀 GitHub Copilot**: Assisted with code automation, suggestions, and development workflow
- **⚡ Cursor**: AI-powered code editor that enhanced development productivity

*Note: While AI tools provided valuable assistance, the core concept, architecture decisions, and final implementation are entirely the developer's own work and creativity.*

## 🎯 Project Vision

**FlickrTalk** was conceived as a solution for creating secure, temporary chat rooms that don't require user accounts or permanent data storage. The goal was to build something simple yet powerful - a tool that lets people have private conversations without the complexity of traditional chat applications.

---

**FlickrTalk** - Where private conversations happen securely and beautifully. ✨