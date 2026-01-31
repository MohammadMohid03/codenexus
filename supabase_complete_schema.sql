-- ============================================================
-- CODENEXUS COMPLETE DATABASE SCHEMA
-- Version: 3.0 (Master Combined Schema)
-- Run this ONCE in Supabase SQL Editor to set up everything
-- ============================================================

-- ============================================
-- SECTION 1: CORE TABLE ENHANCEMENTS
-- ============================================

-- Users table (enhanced)
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;

-- Safely handle last_active: add if missing, or upgrade to TIMESTAMPTZ if it exists as DATE
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_active') THEN
        ALTER TABLE users ALTER COLUMN last_active TYPE TIMESTAMPTZ USING last_active::TIMESTAMPTZ;
    ELSE
        ALTER TABLE users ADD COLUMN last_active TIMESTAMPTZ;
    END IF;
END $$;

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
-- SECTION 2: STREAK & ACTIVITY TRACKING
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
-- SECTION 3: BATTLE MODE
-- ============================================

CREATE TABLE IF NOT EXISTS battles (
    id SERIAL PRIMARY KEY,
    player1_id UUID REFERENCES users(id),
    player2_id UUID REFERENCES users(id),
    challenge_id INTEGER REFERENCES challenges(id),
    status VARCHAR(20) DEFAULT 'waiting',
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
-- SECTION 4: TOURNAMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    challenge_ids INTEGER[],
    status VARCHAR(20) DEFAULT 'upcoming',
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
-- SECTION 5: SKILL TREES
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
-- SECTION 6: SOCIAL FEATURES
-- ============================================

CREATE TABLE IF NOT EXISTS friendships (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

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
-- SECTION 7: DYNAMIC LEARNING PATHS
-- ============================================

-- Drop old learning_paths table if it exists with different structure
DROP TABLE IF EXISTS user_learning_paths CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;

-- New dynamic learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'fa-route',
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    xp_reward INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bridge table linking paths to specific challenges
CREATE TABLE IF NOT EXISTS learning_path_challenges (
    id SERIAL PRIMARY KEY,
    path_id INTEGER REFERENCES learning_paths(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(path_id, challenge_id)
);

-- User progress tracking for paths
CREATE TABLE IF NOT EXISTS user_path_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    path_id INTEGER REFERENCES learning_paths(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, path_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_path_challenges_path ON learning_path_challenges(path_id);
CREATE INDEX IF NOT EXISTS idx_user_path_progress_user ON user_path_progress(user_id);

-- ============================================
-- SECTION 8: HINTS & USER PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS hint_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    hint_level INTEGER DEFAULT 1,
    xp_cost INTEGER DEFAULT 10,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id, hint_level)
);

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
-- SECTION 9: BOOKMARKS & NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS user_notes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    content TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

-- ============================================
-- SECTION 10: ACHIEVEMENTS & BADGES
-- ============================================

CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    xp_reward INTEGER DEFAULT 50,
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    rarity VARCHAR(20) DEFAULT 'common'
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
-- SECTION 11: NOTIFICATIONS
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
-- SECTION 12: PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_discussions_challenge ON discussions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_solutions_challenge ON user_solutions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id, status);

-- ============================================
-- SECTION 13: DISABLE ROW LEVEL SECURITY
-- (Required for server-side operations)
-- ============================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_path_progress DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 14: SEED LEARNING PATHS DATA
-- ============================================

-- Insert the default learning paths
INSERT INTO learning_paths (id, name, description, icon, difficulty_level, xp_reward, sort_order) VALUES
(1, 'Getting Started', 'Perfect for beginners learning the basics', 'fa-seedling', 'beginner', 100, 1),
(2, 'Data Structures 101', 'Master fundamental data structures', 'fa-database', 'intermediate', 200, 2),
(3, 'Algorithm Expert', 'Advanced algorithmic challenges', 'fa-rocket', 'advanced', 500, 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    difficulty_level = EXCLUDED.difficulty_level,
    xp_reward = EXCLUDED.xp_reward,
    sort_order = EXCLUDED.sort_order;

-- Link challenges to paths (runs after challenges are seeded by server)
-- Path 1: Getting Started (Easy challenges)
INSERT INTO learning_path_challenges (path_id, challenge_id, sort_order)
SELECT 1, id, ROW_NUMBER() OVER (ORDER BY id)
FROM challenges
WHERE difficulty = 'Easy'
LIMIT 5
ON CONFLICT (path_id, challenge_id) DO NOTHING;

-- Path 2: Data Structures 101 (Arrays and Strings)
INSERT INTO learning_path_challenges (path_id, challenge_id, sort_order)
SELECT 2, id, ROW_NUMBER() OVER (ORDER BY id)
FROM challenges
WHERE category IN ('Arrays', 'Strings')
LIMIT 10
ON CONFLICT (path_id, challenge_id) DO NOTHING;

-- Path 3: Algorithm Expert (Medium and Hard challenges)
INSERT INTO learning_path_challenges (path_id, challenge_id, sort_order)
SELECT 3, id, ROW_NUMBER() OVER (ORDER BY id)
FROM challenges
WHERE difficulty IN ('Medium', 'Hard')
LIMIT 15
ON CONFLICT (path_id, challenge_id) DO NOTHING;

-- ============================================
-- DONE! Your database is now fully set up.
-- ============================================
