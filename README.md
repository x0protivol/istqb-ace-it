# ISTQB Exam Mastery App

A comprehensive web application for practicing ISTQB Foundation Level certification exams with interactive learning features.

## Features

- 📚 **Question Bank Management**: Upload and manage ISTQB questions from PDF files
- 🎯 **Practice Exams**: Take timed practice exams with real-time feedback
- 📊 **Progress Tracking**: Monitor your learning progress with detailed statistics
- 💡 **Hints & Explanations**: Get helpful hints and detailed explanations for each question
- 🏆 **Results Analysis**: Review your performance with detailed breakdowns
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for backend functionality)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd istqb-ace-it
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Supabase and OpenAI credentials (OpenAI optional but recommended for best results):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Set up the following database tables:

### Questions Table
```sql
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  hint TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
  source_pdf TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Stats Table
```sql
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  average_time INTEGER DEFAULT 0,
  exams_taken INTEGER DEFAULT 0,
  last_exam_date TIMESTAMP WITH TIME ZONE
);
```

### Exam Sessions Table
```sql
CREATE TABLE exam_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  question_ids UUID[] NOT NULL,
  answers INTEGER[] NOT NULL,
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  total_time INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

3. Set up Supabase Storage bucket named `pdfs` for file uploads
4. Configure Row Level Security (RLS) policies as needed

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui components
│   └── PDFUpload.tsx
├── hooks/         # Custom React hooks
│   ├── useExam.ts
│   ├── useQuestions.ts
│   └── useUserStats.ts
├── lib/           # Utility functions and configurations
│   ├── supabase.ts
│   └── utils.ts
├── pages/         # Page components
│   ├── Dashboard.tsx
│   ├── Index.tsx
│   ├── Quiz.tsx
│   └── Results.tsx
└── main.tsx       # Application entry point
```

## Technologies Used

- [Vite](https://vitejs.dev/) - Build tool and dev server
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Router](https://reactrouter.com/) - Routing
- [Supabase](https://supabase.com/) - Backend as a Service
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Lucide React](https://lucide.dev/) - Icons

## Troubleshooting

### Application Crashes on Load
If the application crashes when you first load it, it's likely due to missing Supabase environment variables. Make sure you have:

1. Created a `.env` file in the root directory
2. Added your Supabase URL and anonymous key
3. Restarted the development server

### Build Errors
If you encounter build errors, try:
```bash
npm install
npm run build
```

### Database Connection Issues
Ensure your Supabase project is active and the database tables are properly set up with the correct schema.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
