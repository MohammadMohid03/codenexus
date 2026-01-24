-- CodeNexus Full Feature Database Schema v2
-- Run this in Supabase SQL Editor

-- ============================================
-- CORE TABLES (Updated)
-- ============================================

-- Users table (enhanced)
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_time_spent INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'dark';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id INTEGER;

-- Challenges table (enhanced)
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS time_limit INTEGER DEFAULT 0;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS hints JSONB DEFAULT '[]';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS editorial TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS solution_code TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS solve_count INTEGER DEFAULT 0;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- ============================================
-- STREAK & ACTIVITY TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    challenges_solved INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity(user_id, activity_date);

-- ============================================
-- BATTLE MODE
-- ============================================

CREATE TABLE IF NOT EXISTS battles (
    id SERIAL PRIMARY KEY,
    player1_id UUID REFERENCES users(id),
    player2_id UUID REFERENCES users(id),
    challenge_id INTEGER REFERENCES challenges(id),
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, active, completed, cancelled
    winner_id UUID REFERENCES users(id),
    player1_time INTEGER,
    player2_time INTEGER,
    player1_code TEXT,
    player2_code TEXT,
    xp_reward INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS battle_queue (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    difficulty VARCHAR(20),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================
-- TOURNAMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    challenge_ids INTEGER[],
    status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, active, completed
    prize_xp INTEGER DEFAULT 500,
    max_participants INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tournament_participants (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    rank INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id)
);

-- ============================================
-- SKILL TREES
-- ============================================

CREATE TABLE IF NOT EXISTS skill_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    challenges_required INTEGER DEFAULT 5
);

INSERT INTO skill_categories (name, description, icon, color, challenges_required) VALUES
('Arrays', 'Master array manipulation and traversal', 'fa-list', '#38bdf8', 5),
('Strings', 'String processing and pattern matching', 'fa-font', '#22c55e', 5),
('Recursion', 'Recursive problem solving', 'fa-rotate', '#f59e0b', 5),
('Dynamic Programming', 'Optimal substructure problems', 'fa-brain', '#ef4444', 8),
('Trees', 'Tree traversal and manipulation', 'fa-sitemap', '#818cf8', 6),
('Graphs', 'Graph algorithms and traversal', 'fa-project-diagram', '#ec4899', 7),
('Sorting', 'Sorting algorithms', 'fa-sort', '#14b8a6', 5),
('Searching', 'Search algorithms', 'fa-search', '#f97316', 5)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES skill_categories(id),
    progress INTEGER DEFAULT 0,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,
    UNIQUE(user_id, category_id)
);

-- ============================================
-- SOCIAL FEATURES
-- ============================================

-- Friends
CREATE TABLE IF NOT EXISTS friendships (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- Teams/Clans
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    avatar_url TEXT,
    leader_id UUID REFERENCES users(id),
    total_xp INTEGER DEFAULT 0,
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussions
CREATE TABLE IF NOT EXISTS discussions (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_solution BOOLEAN DEFAULT FALSE,
    parent_id INTEGER REFERENCES discussions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discussion_likes (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(discussion_id, user_id)
);

-- Solutions
CREATE TABLE IF NOT EXISTS user_solutions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(20),
    execution_time INTEGER,
    memory_used INTEGER,
    is_public BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solution_likes (
    id SERIAL PRIMARY KEY,
    solution_id INTEGER REFERENCES user_solutions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(solution_id, user_id)
);

-- ============================================
-- LEARNING FEATURES
-- ============================================

-- Learning Paths
CREATE TABLE IF NOT EXISTS learning_paths (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20),
    challenge_ids INTEGER[],
    xp_reward INTEGER DEFAULT 200,
    badge_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO learning_paths (name, description, difficulty, challenge_ids, xp_reward, badge_name) VALUES
('Getting Started', 'Perfect for beginners learning the basics', 'Easy', ARRAY[1, 2], 100, 'Beginner'),
('Data Structures 101', 'Master fundamental data structures', 'Medium', ARRAY[1, 2, 3], 200, 'Data Master'),
('Algorithm Expert', 'Advanced algorithmic challenges', 'Hard', ARRAY[3, 4, 5], 500, 'Algorithm Expert')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS user_learning_paths (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    path_id INTEGER REFERENCES learning_paths(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, path_id)
);

-- Hint Usage
CREATE TABLE IF NOT EXISTS hint_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    hint_level INTEGER DEFAULT 1,
    xp_cost INTEGER DEFAULT 10,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id, hint_level)
);

-- ============================================
-- USER PREFERENCES & CUSTOMIZATION
-- ============================================

CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(50) DEFAULT 'dark',
    editor_theme VARCHAR(50) DEFAULT 'dracula',
    font_size INTEGER DEFAULT 14,
    tab_size INTEGER DEFAULT 4,
    auto_complete BOOLEAN DEFAULT TRUE,
    line_numbers BOOLEAN DEFAULT TRUE,
    word_wrap BOOLEAN DEFAULT TRUE,
    default_language VARCHAR(20) DEFAULT 'cpp',
    keyboard_shortcuts JSONB DEFAULT '{"run": "Ctrl+Enter", "submit": "Ctrl+Shift+Enter"}',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE
);

-- Code Templates
CREATE TABLE IF NOT EXISTS code_templates (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    language VARCHAR(20) NOT NULL,
    code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- QUALITY OF LIFE
-- ============================================

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

-- Notes
CREATE TABLE IF NOT EXISTS user_notes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    content TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

-- ============================================
-- ACHIEVEMENTS & BADGES
-- ============================================

CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    xp_reward INTEGER DEFAULT 50,
    requirement_type VARCHAR(50), -- challenges_solved, streak, xp_earned, etc.
    requirement_value INTEGER,
    rarity VARCHAR(20) DEFAULT 'common' -- common, rare, epic, legendary
);

INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_value, rarity) VALUES
('First Steps', 'Solve your first challenge', 'fa-baby', 25, 'challenges_solved', 1, 'common'),
('Problem Solver', 'Solve 10 challenges', 'fa-lightbulb', 50, 'challenges_solved', 10, 'common'),
('Challenge Master', 'Solve 50 challenges', 'fa-trophy', 200, 'challenges_solved', 50, 'rare'),
('Century Club', 'Solve 100 challenges', 'fa-medal', 500, 'challenges_solved', 100, 'epic'),
('On Fire', 'Maintain a 7-day streak', 'fa-fire', 100, 'streak', 7, 'common'),
('Dedicated', 'Maintain a 30-day streak', 'fa-fire-flame-curved', 300, 'streak', 30, 'rare'),
('Unstoppable', 'Maintain a 100-day streak', 'fa-meteor', 1000, 'streak', 100, 'legendary'),
('XP Hunter', 'Earn 1000 XP', 'fa-coins', 50, 'xp_earned', 1000, 'common'),
('XP Master', 'Earn 10000 XP', 'fa-gem', 200, 'xp_earned', 10000, 'rare'),
('Speed Demon', 'Solve a challenge in under 5 minutes', 'fa-bolt', 75, 'speed', 300, 'rare'),
('Battle Winner', 'Win your first battle', 'fa-swords', 100, 'battles_won', 1, 'common'),
('Champion', 'Win 10 battles', 'fa-crown', 300, 'battles_won', 10, 'rare'),
('Social Butterfly', 'Add 5 friends', 'fa-users', 50, 'friends', 5, 'common'),
('Team Player', 'Join a team', 'fa-people-group', 50, 'team', 1, 'common'),
('Helpful', 'Get 10 likes on discussions', 'fa-heart', 100, 'discussion_likes', 10, 'common'),
('Night Owl', 'Solve a challenge between 12-5 AM', 'fa-moon', 50, 'special', 1, 'rare'),
('Early Bird', 'Solve a challenge between 5-7 AM', 'fa-sun', 50, 'special', 2, 'rare')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    message TEXT,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_discussions_challenge ON discussions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_solutions_challenge ON user_solutions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id, status);
