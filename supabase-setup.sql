-- ISTQB Exam Mastery App Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer < array_length(options, 1)),
  explanation TEXT NOT NULL,
  hint TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
  source_pdf TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Stats Table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  average_time INTEGER DEFAULT 0,
  exams_taken INTEGER DEFAULT 0,
  last_exam_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Sessions Table
CREATE TABLE IF NOT EXISTS exam_sessions (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_completed ON exam_sessions(completed);

-- Insert sample questions for testing
INSERT INTO questions (question, options, correct_answer, explanation, hint, category, difficulty) VALUES
(
  'What is the primary objective of software testing?',
  ARRAY[
    'To find all defects in the software',
    'To prove that the software is bug-free', 
    'To reduce the risk of failures in operation',
    'To increase development speed'
  ],
  2,
  'The primary objective of testing is to reduce the risk of failures occurring in an operational environment by finding defects and providing information about software quality.',
  'Focus on risk reduction rather than proving perfection.',
  'Fundamentals of Testing',
  'Medium'
),
(
  'Which of the following is NOT a principle of testing?',
  ARRAY[
    'Testing shows the presence of defects',
    'Exhaustive testing is possible',
    'Early testing saves time and money',
    'Defect clustering'
  ],
  1,
  'Exhaustive testing is impossible because it would require testing all possible combinations of inputs and preconditions, which is not feasible for non-trivial software.',
  'Think about what is practically impossible in testing.',
  'Testing Principles',
  'Easy'
),
(
  'What is the main characteristic of black-box testing?',
  ARRAY[
    'Tests are based on code structure',
    'Tests are based on specifications and requirements',
    'Tests require knowledge of internal design',
    'Tests focus on code coverage'
  ],
  1,
  'Black-box testing is based on specifications, requirements, and the functionality of the software without knowledge of its internal structure.',
  'Consider what information is used to design the tests.',
  'Test Design Techniques',
  'Easy'
),
(
  'Which testing level focuses on testing individual components or modules?',
  ARRAY[
    'System testing',
    'Integration testing',
    'Unit testing',
    'Acceptance testing'
  ],
  2,
  'Unit testing focuses on testing individual components or modules in isolation to verify they work correctly.',
  'Think about the smallest testable unit of software.',
  'Test Levels',
  'Easy'
),
(
  'What is the purpose of regression testing?',
  ARRAY[
    'To test new features only',
    'To ensure previously working functionality still works after changes',
    'To test only the user interface',
    'To test performance under load'
  ],
  1,
  'Regression testing ensures that previously working functionality still works correctly after new changes or fixes have been made.',
  'Focus on what happens to existing functionality after changes.',
  'Test Types',
  'Medium'
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_stats table
CREATE TRIGGER update_user_stats_updated_at 
    BEFORE UPDATE ON user_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to questions
CREATE POLICY "Questions are viewable by everyone" ON questions
    FOR SELECT USING (true);

CREATE POLICY "Questions are insertable by everyone" ON questions
    FOR INSERT WITH CHECK (true);

-- Create policies for user_stats
CREATE POLICY "User stats are viewable by everyone" ON user_stats
    FOR SELECT USING (true);

CREATE POLICY "User stats are insertable by everyone" ON user_stats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "User stats are updatable by everyone" ON user_stats
    FOR UPDATE USING (true);

-- Create policies for exam_sessions
CREATE POLICY "Exam sessions are viewable by everyone" ON exam_sessions
    FOR SELECT USING (true);

CREATE POLICY "Exam sessions are insertable by everyone" ON exam_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Exam sessions are updatable by everyone" ON exam_sessions
    FOR UPDATE USING (true);

-- Insert initial user stats record
INSERT INTO user_stats (total_questions, correct_answers, total_points, current_streak, best_streak, average_time, exams_taken)
VALUES (0, 0, 0, 0, 0, 0, 0)
ON CONFLICT DO NOTHING; 