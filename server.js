const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Debug: Log environment variables (remove in production)
console.log('Environment check:');
console.log('- PORT:', PORT);
console.log('- SUPABASE_URL:', supabaseUrl ? 'Set ✓' : 'MISSING!');
console.log('- SUPABASE_ANON_KEY:', supabaseKey ? 'Set ✓' : 'MISSING!');

if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Missing Supabase credentials!');
    console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed Data
const initialChallenges = [
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        category: "Arrays",
        description: "Given an array of integers and a target integer, print the indices of the two numbers such that they add up to target.\n\nInput Format:\nFirst line: N (size of array)\nSecond line: N space-separated integers\nThird line: Target integer\n\nOutput Format:\nTwo space-separated indices (sorted).",
        points: 100,
        test_cases: [
            { input: "4\n2 7 11 15\n9", expected: "0 1" },
            { input: "3\n3 2 4\n6", expected: "1 2" },
            { input: "2\n3 3\n6", expected: "0 1" }
        ],
        hints: ['Think about using a hash map', 'Store each number and its index', 'Check if target - current exists'],
        editorial: 'Use a hash map to store values. For each element, check if (target - element) exists in the map.',
        tags: ['arrays', 'hash-map', 'two-pointers'],
        time_limit: 600
    },
    {
        id: 2,
        title: "Palindrome Number",
        difficulty: "Easy",
        category: "Math",
        description: "Given an integer x, return true if x is a palindrome, and false otherwise. Print 'true' or 'false'.\n\nInput Format:\nA single integer x.\n\nOutput Format:\n'true' or 'false'.",
        points: 100,
        test_cases: [
            { input: "121", expected: "true" },
            { input: "-121", expected: "false" },
            { input: "10", expected: "false" }
        ],
        hints: ['Negative numbers are not palindromes', 'Try reversing the number', 'Compare original with reversed'],
        editorial: 'Reverse the number and compare with original. Handle negative numbers separately.',
        tags: ['math', 'string'],
        time_limit: 300
    },
    {
        id: 3,
        title: "Reverse String",
        difficulty: "Easy",
        category: "Strings",
        description: "Write a function that reverses a string. The input string is given as an array of characters.\n\nInput Format:\nA single string.\n\nOutput Format:\nThe reversed string.",
        points: 100,
        test_cases: [
            { input: "hello", expected: "olleh" },
            { input: "Hannah", expected: "hannaH" }
        ],
        hints: ['Use two pointers', 'Swap from both ends', 'Built-in functions also work'],
        editorial: 'Use two pointers starting from both ends and swap characters until they meet.',
        tags: ['strings', 'two-pointers'],
        time_limit: 300
    },
    {
        id: 4,
        title: "Factorial",
        difficulty: "Medium",
        category: "Math",
        description: "Calculate the factorial of a non-negative integer N.\n\nInput Format:\nA single integer N.\n\nOutput Format:\nThe factorial of N.",
        points: 150,
        test_cases: [
            { input: "5", expected: "120" },
            { input: "0", expected: "1" },
            { input: "3", expected: "6" }
        ],
        hints: ['Base case is 0! = 1', 'Use recursion or iteration', 'n! = n * (n-1)!'],
        editorial: 'Use recursion with base case 0! = 1, or iterate from 1 to n multiplying.',
        tags: ['math', 'recursion'],
        time_limit: 300
    },
    {
        id: 5,
        title: "Find Maximum",
        difficulty: "Easy",
        category: "Arrays",
        description: "Find the maximum element in an array.\n\nInput Format:\nFirst line: N (size)\nSecond line: N integers\n\nOutput Format:\nThe maximum integer.",
        points: 100,
        test_cases: [
            { input: "5\n1 5 3 9 2", expected: "9" },
            { input: "3\n-1 -5 -2", expected: "-1" }
        ],
        hints: ['Start with first element', 'Compare each element', 'Track the maximum so far'],
        editorial: 'Initialize max with first element, iterate through array updating max when larger found.',
        tags: ['arrays', 'iteration'],
        time_limit: 300
    },
    {
        id: 6,
        title: "Fibonacci Sequence",
        difficulty: "Medium",
        category: "Recursion",
        description: "Given N, print the Nth Fibonacci number (0-indexed).\n\nInput Format:\nA single integer N.\n\nOutput Format:\nThe Nth Fibonacci number.",
        points: 150,
        test_cases: [
            { input: "0", expected: "0" },
            { input: "1", expected: "1" },
            { input: "10", expected: "55" }
        ],
        hints: ['F(0)=0, F(1)=1', 'F(n) = F(n-1) + F(n-2)', 'Consider using memoization'],
        editorial: 'Use dynamic programming or memoization to avoid recalculating values.',
        tags: ['recursion', 'dynamic-programming'],
        time_limit: 300
    },
    {
        id: 7,
        title: "Binary Search",
        difficulty: "Medium",
        category: "Searching",
        description: "Given a sorted array and a target, return the index of the target or -1 if not found.\n\nInput Format:\nFirst line: N (size)\nSecond line: N sorted integers\nThird line: Target\n\nOutput Format:\nIndex or -1.",
        points: 150,
        test_cases: [
            { input: "5\n1 2 3 4 5\n3", expected: "2" },
            { input: "5\n1 2 3 4 5\n6", expected: "-1" }
        ],
        hints: ['Array is sorted', 'Compare with middle element', 'Narrow search space by half'],
        editorial: 'Use binary search: compare target with mid, search left or right half accordingly.',
        tags: ['searching', 'binary-search'],
        time_limit: 300
    },
    {
        id: 8,
        title: "Merge Sorted Arrays",
        difficulty: "Hard",
        category: "Arrays",
        description: "Merge two sorted arrays into one sorted array.\n\nInput Format:\nFirst line: N M\nSecond line: N integers (sorted)\nThird line: M integers (sorted)\n\nOutput Format:\nMerged sorted array.",
        points: 200,
        test_cases: [
            { input: "3 3\n1 3 5\n2 4 6", expected: "1 2 3 4 5 6" },
            { input: "2 2\n1 2\n3 4", expected: "1 2 3 4" }
        ],
        hints: ['Use two pointers', 'Compare elements from both arrays', 'Handle remaining elements'],
        editorial: 'Use two pointers to compare and merge. Time complexity O(n+m).',
        tags: ['arrays', 'two-pointers', 'sorting'],
        time_limit: 600
    }
];

async function seedDatabase() {
    try {
        const { data: existingChallenges, error } = await supabase
            .from('challenges')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Error checking challenges table:', error.message);
            console.log('Make sure you have created the tables in Supabase. See the SQL schema below.');
            return;
        }

        if (!existingChallenges || existingChallenges.length === 0) {
            const { error: insertError } = await supabase
                .from('challenges')
                .insert(initialChallenges);

            if (insertError) {
                console.error('Error seeding challenges:', insertError.message);
            } else {
                console.log('Database seeded with initial challenges');
            }
        } else {
            console.log('Challenges already exist, skipping seed');
        }
    } catch (err) {
        console.error('Error seeding database:', err);
    }
}

// Initialize database on startup
seedDatabase();
console.log('Connected to Supabase');

// Map frontend language names to Piston (runtime/version)
const RUNTIMES = {
    'cpp': { language: 'c++', version: '10.2.0' },
    'python': { language: 'python', version: '3.10.0' },
    'java': { language: 'java', version: '15.0.2' },
    'c': { language: 'c', version: '10.2.0' },
    'rust': { language: 'rust', version: '1.68.2' }
};

// --- AUTH ROUTES ---

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${email},username.eq.${username}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or username already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                username,
                email,
                password: hashedPassword,
                level: 1,
                xp: 0,
                solved_challenges: []
            })
            .select()
            .single();

        if (error) {
            console.error('Signup Error:', error);
            return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                username: newUser.username,
                email: newUser.email,
                level: newUser.level,
                xp: newUser.xp
            }
        });
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                username: user.username,
                email: user.email,
                level: user.level,
                xp: user.xp,
                solvedChallenges: user.solved_challenges
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Middleware to verify token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

app.get('/api/auth/profile', authenticate, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email, level, xp, solved_challenges, created_at')
            .eq('id', req.userId)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        // Map to expected format
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            level: user.level,
            xp: user.xp,
            solvedChallenges: user.solved_challenges,
            joinedAt: user.created_at
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// --- CHALLENGE ROUTES ---

app.get('/api/challenges', async (req, res) => {
    try {
        const { data: challenges, error } = await supabase
            .from('challenges')
            .select('*');

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch challenges' });
        }

        const publicChallenges = challenges.map(c => ({
            id: c.id,
            title: c.title,
            difficulty: c.difficulty,
            category: c.category,
            description: c.description,
            points: c.points,
            testCases: c.test_cases.map(tc => ({ input: tc.input, hidden: true }))
        }));
        res.json(publicChallenges);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch challenges' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('username, level, xp, solved_challenges')
            .order('xp', { ascending: false })
            .limit(10);

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }

        // Map to expected format
        const formattedUsers = users.map(u => ({
            username: u.username,
            level: u.level,
            xp: u.xp,
            solvedChallenges: u.solved_challenges
        }));

        res.json(formattedUsers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

async function executeWithPiston(language, code, input) {
    const runtime = RUNTIMES[language];
    if (!runtime) throw new Error("Unsupported language");

    try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
            stdin: input
        });
        return response.data;
    } catch (error) {
        console.error("Piston Error:", error.message);
        return { run: { output: "Error executing code on server." } };
    }
}

app.post('/api/run', async (req, res) => {
    const { code, language, challengeId, token } = req.body;

    let userId = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;
        } catch (err) {
            console.error('Invalid token during execution');
        }
    }

    try {
        const { data: challenge, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('id', parseInt(challengeId))
            .single();

        if (error || !challenge) {
            return res.json({ status: 'error', output: 'Challenge not found.' });
        }

        let allPassed = true;
        let outputLog = `Compiling ${language}...\n`;

        for (let i = 0; i < challenge.test_cases.length; i++) {
            const testCase = challenge.test_cases[i];
            const result = await executeWithPiston(language, code, testCase.input);

            const actualOutput = (result.run.stdout || "").trim();
            const expectedOutput = testCase.expected.trim();
            const errorOutput = result.run.stderr;

            if (errorOutput) {
                outputLog += `\nTest Case ${i + 1}: Check Compilation/Runtime Error\nTotal Output:\n${result.run.output}\n`;
                allPassed = false;
                break;
            }

            if (actualOutput === expectedOutput) {
                outputLog += `Test Case ${i + 1}: ✅ Passed\n`;
            } else {
                outputLog += `Test Case ${i + 1}: ❌ Failed\n   Input: ${testCase.input.replace(/\n/g, ' ')}\n   Expected: ${expectedOutput}\n   Actual: ${actualOutput}\n`;
                allPassed = false;
            }
        }

        if (allPassed) {
            outputLog += `\nResults: All Test Cases Passed! 🎉 (+${challenge.points} XP)`;

            if (userId) {
                const { data: user } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (user && !user.solved_challenges.includes(challenge.id)) {
                    const newSolvedChallenges = [...user.solved_challenges, challenge.id];
                    const newXp = user.xp + challenge.points;
                    const newLevel = Math.floor(newXp / 500) + 1;

                    await supabase
                        .from('users')
                        .update({
                            solved_challenges: newSolvedChallenges,
                            xp: newXp,
                            level: newLevel
                        })
                        .eq('id', userId);
                }
            }
        } else {
            outputLog += `\nResults: Some tests failed. Keep trying!`;
        }

        res.json({
            status: allPassed ? 'success' : 'error',
            output: outputLog,
            points: allPassed ? challenge.points : 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during execution' });
    }
});

// ============================================
// STREAK & ACTIVITY ROUTES
// ============================================

// Update user streak and activity
async function updateUserActivity(userId, xpEarned = 0, challengeSolved = false) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
        // Get or create today's activity
        const { data: existing } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', userId)
            .eq('activity_date', today)
            .single();

        if (existing) {
            await supabase
                .from('user_activity')
                .update({
                    challenges_solved: existing.challenges_solved + (challengeSolved ? 1 : 0),
                    xp_earned: existing.xp_earned + xpEarned
                })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('user_activity')
                .insert({
                    user_id: userId,
                    activity_date: today,
                    challenges_solved: challengeSolved ? 1 : 0,
                    xp_earned: xpEarned
                });
        }

        // Update streak
        const { data: user } = await supabase
            .from('users')
            .select('last_active, streak_count, best_streak')
            .eq('id', userId)
            .single();

        if (user) {
            const lastActive = user.last_active;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            let newStreak = user.streak_count;
            if (lastActive === yesterdayStr) {
                newStreak = user.streak_count + 1;
            } else if (lastActive !== today) {
                newStreak = 1;
            }

            const bestStreak = Math.max(user.best_streak || 0, newStreak);

            await supabase
                .from('users')
                .update({
                    last_active: today,
                    streak_count: newStreak,
                    best_streak: bestStreak
                })
                .eq('id', userId);

            return { streak: newStreak, bestStreak };
        }
    } catch (err) {
        console.error('Error updating activity:', err);
    }
    return { streak: 0, bestStreak: 0 };
}

// Get user activity (heat map data)
app.get('/api/activity/:userId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', req.params.userId)
            .order('activity_date', { ascending: false })
            .limit(365);

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Get user streak info
app.get('/api/streak/:userId', async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('streak_count, best_streak, last_active')
            .eq('id', req.params.userId)
            .single();

        if (error) throw error;
        res.json({
            currentStreak: user.streak_count || 0,
            bestStreak: user.best_streak || 0,
            lastActive: user.last_active
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch streak' });
    }
});

// ============================================
// BATTLE MODE ROUTES
// ============================================

// Join battle queue
app.post('/api/battles/queue', authenticate, async (req, res) => {
    try {
        const { difficulty } = req.body;
        
        // Check if already in queue
        const { data: existing } = await supabase
            .from('battle_queue')
            .select('*')
            .eq('user_id', req.userId)
            .single();

        if (existing) {
            return res.json({ status: 'already_queued', message: 'Already in queue' });
        }

        // Check for opponent in queue
        const { data: opponent } = await supabase
            .from('battle_queue')
            .select('*')
            .eq('difficulty', difficulty)
            .neq('user_id', req.userId)
            .order('joined_at', { ascending: true })
            .limit(1)
            .single();

        if (opponent) {
            // Match found! Create battle
            const { data: challenges } = await supabase
                .from('challenges')
                .select('id')
                .eq('difficulty', difficulty.charAt(0).toUpperCase() + difficulty.slice(1));

            const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

            const { data: battle, error } = await supabase
                .from('battles')
                .insert({
                    player1_id: opponent.user_id,
                    player2_id: req.userId,
                    challenge_id: randomChallenge.id,
                    status: 'active',
                    started_at: new Date().toISOString()
                })
                .select()
                .single();

            // Remove opponent from queue
            await supabase.from('battle_queue').delete().eq('id', opponent.id);

            res.json({ status: 'matched', battle });
        } else {
            // Add to queue
            await supabase.from('battle_queue').insert({
                user_id: req.userId,
                difficulty
            });

            res.json({ status: 'queued', message: 'Waiting for opponent...' });
        }
    } catch (err) {
        console.error('Battle queue error:', err);
        res.status(500).json({ error: 'Failed to join queue' });
    }
});

// Leave battle queue
app.delete('/api/battles/queue', authenticate, async (req, res) => {
    try {
        await supabase.from('battle_queue').delete().eq('user_id', req.userId);
        res.json({ status: 'left_queue' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to leave queue' });
    }
});

// Get active battle
app.get('/api/battles/active', authenticate, async (req, res) => {
    try {
        const { data: battle } = await supabase
            .from('battles')
            .select('*, challenges(*)')
            .or(`player1_id.eq.${req.userId},player2_id.eq.${req.userId}`)
            .eq('status', 'active')
            .single();

        res.json(battle || null);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch battle' });
    }
});

// Submit battle solution
app.post('/api/battles/:battleId/submit', authenticate, async (req, res) => {
    try {
        const { code, language } = req.body;
        const battleId = req.params.battleId;

        const { data: battle } = await supabase
            .from('battles')
            .select('*, challenges(*)')
            .eq('id', battleId)
            .single();

        if (!battle || battle.status !== 'active') {
            return res.status(400).json({ error: 'Battle not found or not active' });
        }

        const isPlayer1 = battle.player1_id === req.userId;
        const challenge = battle.challenges;

        // Run tests
        let allPassed = true;
        for (const testCase of challenge.test_cases) {
            const result = await executeWithPiston(language, code, testCase.input);
            const actualOutput = (result.run.stdout || "").trim();
            if (actualOutput !== testCase.expected.trim()) {
                allPassed = false;
                break;
            }
        }

        if (allPassed) {
            const timeField = isPlayer1 ? 'player1_time' : 'player2_time';
            const codeField = isPlayer1 ? 'player1_code' : 'player2_code';
            const elapsedTime = Math.floor((Date.now() - new Date(battle.started_at).getTime()) / 1000);

            const updateData = {
                [timeField]: elapsedTime,
                [codeField]: code
            };

            // Check if other player already finished
            const otherTimeField = isPlayer1 ? 'player2_time' : 'player1_time';
            if (battle[otherTimeField]) {
                // Battle complete
                const winnerId = elapsedTime < battle[otherTimeField] ? req.userId : 
                                 (isPlayer1 ? battle.player2_id : battle.player1_id);
                updateData.status = 'completed';
                updateData.winner_id = winnerId;
                updateData.ended_at = new Date().toISOString();

                // Award XP to winner
                await supabase
                    .from('users')
                    .update({ xp: supabase.raw('xp + 100') })
                    .eq('id', winnerId);
            }

            await supabase.from('battles').update(updateData).eq('id', battleId);

            res.json({
                status: 'success',
                time: elapsedTime,
                battleComplete: !!updateData.status,
                won: updateData.winner_id === req.userId
            });
        } else {
            res.json({ status: 'failed', message: 'Tests did not pass' });
        }
    } catch (err) {
        console.error('Battle submit error:', err);
        res.status(500).json({ error: 'Failed to submit solution' });
    }
});

// Get battle history
app.get('/api/battles/history', authenticate, async (req, res) => {
    try {
        const { data: battles } = await supabase
            .from('battles')
            .select('*, challenges(title, difficulty)')
            .or(`player1_id.eq.${req.userId},player2_id.eq.${req.userId}`)
            .eq('status', 'completed')
            .order('ended_at', { ascending: false })
            .limit(20);

        res.json(battles || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// ============================================
// TOURNAMENT ROUTES
// ============================================

// Get all tournaments
app.get('/api/tournaments', async (req, res) => {
    try {
        const { data: tournaments } = await supabase
            .from('tournaments')
            .select('*')
            .order('start_date', { ascending: false });

        res.json(tournaments || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});

// Get tournament details
app.get('/api/tournaments/:id', async (req, res) => {
    try {
        const { data: tournament } = await supabase
            .from('tournaments')
            .select('*')
            .eq('id', req.params.id)
            .single();

        const { data: participants } = await supabase
            .from('tournament_participants')
            .select('*, users(username)')
            .eq('tournament_id', req.params.id)
            .order('score', { ascending: false });

        res.json({ ...tournament, participants: participants || [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tournament' });
    }
});

// Join tournament
app.post('/api/tournaments/:id/join', authenticate, async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('tournament_participants')
            .select('id')
            .eq('tournament_id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already joined' });
        }

        await supabase.from('tournament_participants').insert({
            tournament_id: req.params.id,
            user_id: req.userId
        });

        res.json({ status: 'joined' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to join tournament' });
    }
});

// ============================================
// SKILL TREE ROUTES
// ============================================

// Get skill categories
app.get('/api/skills/categories', async (req, res) => {
    try {
        const { data } = await supabase.from('skill_categories').select('*');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get user skills
app.get('/api/skills/:userId', async (req, res) => {
    try {
        const { data } = await supabase
            .from('user_skills')
            .select('*, skill_categories(*)')
            .eq('user_id', req.params.userId);

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

// ============================================
// SOCIAL FEATURES - FRIENDS
// ============================================

// Get friends list
app.get('/api/friends', authenticate, async (req, res) => {
    try {
        const { data: friendships } = await supabase
            .from('friendships')
            .select('*, friend:friend_id(id, username, level, xp, streak_count)')
            .eq('user_id', req.userId)
            .eq('status', 'accepted');

        res.json(friendships || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

// Get friend requests
app.get('/api/friends/requests', authenticate, async (req, res) => {
    try {
        const { data } = await supabase
            .from('friendships')
            .select('*, user:user_id(id, username, level)')
            .eq('friend_id', req.userId)
            .eq('status', 'pending');

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Send friend request
app.post('/api/friends/request', authenticate, async (req, res) => {
    try {
        const { friendId } = req.body;

        // Check if already friends or pending
        const { data: existing } = await supabase
            .from('friendships')
            .select('id')
            .or(`and(user_id.eq.${req.userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${req.userId})`)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Request already exists' });
        }

        await supabase.from('friendships').insert({
            user_id: req.userId,
            friend_id: friendId,
            status: 'pending'
        });

        res.json({ status: 'sent' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send request' });
    }
});

// Accept friend request
app.post('/api/friends/accept/:requestId', authenticate, async (req, res) => {
    try {
        const { data: request } = await supabase
            .from('friendships')
            .select('*')
            .eq('id', req.params.requestId)
            .eq('friend_id', req.userId)
            .single();

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('id', req.params.requestId);

        // Create reverse friendship
        await supabase.from('friendships').insert({
            user_id: req.userId,
            friend_id: request.user_id,
            status: 'accepted'
        });

        res.json({ status: 'accepted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to accept request' });
    }
});

// Search users (for adding friends)
app.get('/api/users/search', authenticate, async (req, res) => {
    try {
        const { q } = req.query;
        const { data } = await supabase
            .from('users')
            .select('id, username, level, xp')
            .ilike('username', `%${q}%`)
            .neq('id', req.userId)
            .limit(10);

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to search users' });
    }
});

// ============================================
// SOCIAL FEATURES - TEAMS
// ============================================

// Get all teams
app.get('/api/teams', async (req, res) => {
    try {
        const { data } = await supabase
            .from('teams')
            .select('*')
            .order('total_xp', { ascending: false });

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Get team details
app.get('/api/teams/:id', async (req, res) => {
    try {
        const { data: team } = await supabase
            .from('teams')
            .select('*')
            .eq('id', req.params.id)
            .single();

        const { data: members } = await supabase
            .from('users')
            .select('id, username, level, xp')
            .eq('team_id', req.params.id);

        res.json({ ...team, members: members || [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// Create team
app.post('/api/teams', authenticate, async (req, res) => {
    try {
        const { name, description } = req.body;

        const { data: team, error } = await supabase
            .from('teams')
            .insert({
                name,
                description,
                leader_id: req.userId
            })
            .select()
            .single();

        if (error) throw error;

        await supabase
            .from('users')
            .update({ team_id: team.id })
            .eq('id', req.userId);

        res.json(team);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create team' });
    }
});

// Join team
app.post('/api/teams/:id/join', authenticate, async (req, res) => {
    try {
        await supabase
            .from('users')
            .update({ team_id: req.params.id })
            .eq('id', req.userId);

        await supabase
            .from('teams')
            .update({ member_count: supabase.raw('member_count + 1') })
            .eq('id', req.params.id);

        res.json({ status: 'joined' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to join team' });
    }
});

// ============================================
// DISCUSSIONS & SOLUTIONS
// ============================================

// Get discussions for a challenge
app.get('/api/challenges/:id/discussions', async (req, res) => {
    try {
        const { data } = await supabase
            .from('discussions')
            .select('*, users(username)')
            .eq('challenge_id', req.params.id)
            .is('parent_id', null)
            .order('likes', { ascending: false });

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch discussions' });
    }
});

// Post discussion
app.post('/api/challenges/:id/discussions', authenticate, async (req, res) => {
    try {
        const { content, isSolution, parentId } = req.body;

        const { data, error } = await supabase
            .from('discussions')
            .insert({
                challenge_id: req.params.id,
                user_id: req.userId,
                content,
                is_solution: isSolution || false,
                parent_id: parentId || null
            })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to post discussion' });
    }
});

// Like discussion
app.post('/api/discussions/:id/like', authenticate, async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('discussion_likes')
            .select('id')
            .eq('discussion_id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already liked' });
        }

        await supabase.from('discussion_likes').insert({
            discussion_id: req.params.id,
            user_id: req.userId
        });

        await supabase
            .from('discussions')
            .update({ likes: supabase.raw('likes + 1') })
            .eq('id', req.params.id);

        res.json({ status: 'liked' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to like' });
    }
});

// Get solutions for a challenge
app.get('/api/challenges/:id/solutions', async (req, res) => {
    try {
        const { data } = await supabase
            .from('user_solutions')
            .select('*, users(username)')
            .eq('challenge_id', req.params.id)
            .eq('is_public', true)
            .order('likes', { ascending: false });

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch solutions' });
    }
});

// ============================================
// LEARNING FEATURES
// ============================================

// Get learning paths
app.get('/api/learning-paths', async (req, res) => {
    try {
        const { data } = await supabase.from('learning_paths').select('*');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch learning paths' });
    }
});

// Get user's learning path progress
app.get('/api/learning-paths/progress', authenticate, async (req, res) => {
    try {
        const { data } = await supabase
            .from('user_learning_paths')
            .select('*, learning_paths(*)')
            .eq('user_id', req.userId);

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Start learning path
app.post('/api/learning-paths/:id/start', authenticate, async (req, res) => {
    try {
        await supabase.from('user_learning_paths').insert({
            user_id: req.userId,
            path_id: req.params.id
        });

        res.json({ status: 'started' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to start path' });
    }
});

// Get hints (costs XP)
app.post('/api/challenges/:id/hint', authenticate, async (req, res) => {
    try {
        const { hintLevel } = req.body;
        const xpCost = hintLevel * 10;

        // Check if already unlocked
        const { data: existing } = await supabase
            .from('hint_usage')
            .select('id')
            .eq('user_id', req.userId)
            .eq('challenge_id', req.params.id)
            .eq('hint_level', hintLevel)
            .single();

        if (existing) {
            const { data: challenge } = await supabase
                .from('challenges')
                .select('hints')
                .eq('id', req.params.id)
                .single();

            return res.json({ hint: challenge.hints[hintLevel - 1], alreadyUnlocked: true });
        }

        // Check user XP
        const { data: user } = await supabase
            .from('users')
            .select('xp')
            .eq('id', req.userId)
            .single();

        if (user.xp < xpCost) {
            return res.status(400).json({ error: 'Not enough XP' });
        }

        // Deduct XP and unlock hint
        await supabase
            .from('users')
            .update({ xp: user.xp - xpCost })
            .eq('id', req.userId);

        await supabase.from('hint_usage').insert({
            user_id: req.userId,
            challenge_id: req.params.id,
            hint_level: hintLevel,
            xp_cost: xpCost
        });

        const { data: challenge } = await supabase
            .from('challenges')
            .select('hints')
            .eq('id', req.params.id)
            .single();

        res.json({ hint: challenge.hints[hintLevel - 1], xpDeducted: xpCost });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get hint' });
    }
});

// Get editorial (after solving)
app.get('/api/challenges/:id/editorial', authenticate, async (req, res) => {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('solved_challenges')
            .eq('id', req.userId)
            .single();

        if (!user.solved_challenges.includes(parseInt(req.params.id))) {
            return res.status(403).json({ error: 'Solve the challenge first' });
        }

        const { data: challenge } = await supabase
            .from('challenges')
            .select('editorial, solution_code')
            .eq('id', req.params.id)
            .single();

        res.json(challenge);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get editorial' });
    }
});

// ============================================
// USER SETTINGS & CUSTOMIZATION
// ============================================

// Get user settings
app.get('/api/settings', authenticate, async (req, res) => {
    try {
        let { data } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', req.userId)
            .single();

        if (!data) {
            // Create default settings
            const { data: newSettings } = await supabase
                .from('user_settings')
                .insert({ user_id: req.userId })
                .select()
                .single();
            data = newSettings;
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update user settings
app.put('/api/settings', authenticate, async (req, res) => {
    try {
        const updates = req.body;
        
        await supabase
            .from('user_settings')
            .upsert({ user_id: req.userId, ...updates });

        res.json({ status: 'updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Update profile
app.put('/api/profile', authenticate, async (req, res) => {
    try {
        const { bio, github_url, twitter_url, website_url, avatar_url, banner_url, title } = req.body;

        await supabase
            .from('users')
            .update({ bio, github_url, twitter_url, website_url, avatar_url, banner_url, title })
            .eq('id', req.userId);

        res.json({ status: 'updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ============================================
// CODE TEMPLATES
// ============================================

// Get user templates
app.get('/api/templates', authenticate, async (req, res) => {
    try {
        const { data } = await supabase
            .from('code_templates')
            .select('*')
            .eq('user_id', req.userId);

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Save template
app.post('/api/templates', authenticate, async (req, res) => {
    try {
        const { name, language, code, isDefault } = req.body;

        if (isDefault) {
            await supabase
                .from('code_templates')
                .update({ is_default: false })
                .eq('user_id', req.userId)
                .eq('language', language);
        }

        const { data, error } = await supabase
            .from('code_templates')
            .insert({
                user_id: req.userId,
                name,
                language,
                code,
                is_default: isDefault || false
            })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save template' });
    }
});

// Delete template
app.delete('/api/templates/:id', authenticate, async (req, res) => {
    try {
        await supabase
            .from('code_templates')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);

        res.json({ status: 'deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// ============================================
// BOOKMARKS & NOTES
// ============================================

// Get bookmarks
app.get('/api/bookmarks', authenticate, async (req, res) => {
    try {
        const { data } = await supabase
            .from('bookmarks')
            .select('*, challenges(*)')
            .eq('user_id', req.userId);

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

// Toggle bookmark
app.post('/api/bookmarks/:challengeId', authenticate, async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', req.userId)
            .eq('challenge_id', req.params.challengeId)
            .single();

        if (existing) {
            await supabase.from('bookmarks').delete().eq('id', existing.id);
            res.json({ status: 'removed' });
        } else {
            await supabase.from('bookmarks').insert({
                user_id: req.userId,
                challenge_id: req.params.challengeId
            });
            res.json({ status: 'added' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle bookmark' });
    }
});

// Get note for challenge
app.get('/api/notes/:challengeId', authenticate, async (req, res) => {
    try {
        const { data } = await supabase
            .from('user_notes')
            .select('*')
            .eq('user_id', req.userId)
            .eq('challenge_id', req.params.challengeId)
            .single();

        res.json(data || { content: '' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});

// Save note
app.put('/api/notes/:challengeId', authenticate, async (req, res) => {
    try {
        const { content } = req.body;

        await supabase
            .from('user_notes')
            .upsert({
                user_id: req.userId,
                challenge_id: req.params.challengeId,
                content,
                updated_at: new Date().toISOString()
            });

        res.json({ status: 'saved' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save note' });
    }
});

// ============================================
// ACHIEVEMENTS
// ============================================

// Get all achievements
app.get('/api/achievements', async (req, res) => {
    try {
        const { data } = await supabase.from('achievements').select('*');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// Get user achievements
app.get('/api/achievements/:userId', async (req, res) => {
    try {
        const { data } = await supabase
            .from('user_achievements')
            .select('*, achievements(*)')
            .eq('user_id', req.params.userId);

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user achievements' });
    }
});

// Check and award achievements
async function checkAchievements(userId) {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        const { data: achievements } = await supabase.from('achievements').select('*');
        const { data: userAchievements } = await supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', userId);

        const earnedIds = userAchievements.map(ua => ua.achievement_id);
        const newAchievements = [];

        for (const achievement of achievements) {
            if (earnedIds.includes(achievement.id)) continue;

            let earned = false;
            switch (achievement.requirement_type) {
                case 'challenges_solved':
                    earned = (user.solved_challenges?.length || 0) >= achievement.requirement_value;
                    break;
                case 'streak':
                    earned = (user.streak_count || 0) >= achievement.requirement_value;
                    break;
                case 'xp_earned':
                    earned = (user.xp || 0) >= achievement.requirement_value;
                    break;
            }

            if (earned) {
                await supabase.from('user_achievements').insert({
                    user_id: userId,
                    achievement_id: achievement.id
                });
                newAchievements.push(achievement);

                // Award XP
                await supabase
                    .from('users')
                    .update({ xp: user.xp + achievement.xp_reward })
                    .eq('id', userId);
            }
        }

        return newAchievements;
    } catch (err) {
        console.error('Error checking achievements:', err);
        return [];
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

// Get notifications
app.get('/api/notifications', authenticate, async (req, res) => {
    try {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false })
            .limit(50);

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notifications as read
app.put('/api/notifications/read', authenticate, async (req, res) => {
    try {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', req.userId);

        res.json({ status: 'marked_read' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// ============================================
// RANDOM CHALLENGE & TIMED MODE
// ============================================

// Get random challenge
app.get('/api/challenges/random', async (req, res) => {
    try {
        const { difficulty } = req.query;
        let query = supabase.from('challenges').select('*');
        
        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        const { data: challenges } = await query;
        
        if (!challenges || challenges.length === 0) {
            return res.status(404).json({ error: 'No challenges found' });
        }

        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        res.json({
            id: randomChallenge.id,
            title: randomChallenge.title,
            difficulty: randomChallenge.difficulty,
            category: randomChallenge.category,
            description: randomChallenge.description,
            points: randomChallenge.points,
            timeLimit: randomChallenge.time_limit
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get random challenge' });
    }
});

// ============================================
// ACTIVITY FEED & HEATMAP
// ============================================

// Get activity heatmap data
app.get('/api/activity/heatmap', authenticate, async (req, res) => {
    try {
        const { data } = await supabase
            .from('user_activity')
            .select('activity_date, id')
            .eq('user_id', req.userId)
            .gte('activity_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        // Group by date and count
        const grouped = {};
        (data || []).forEach(a => {
            const date = a.activity_date.split('T')[0];
            grouped[date] = (grouped[date] || 0) + 1;
        });

        const result = Object.entries(grouped).map(([date, count]) => ({ date, count }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch heatmap' });
    }
});

// Get activity feed
app.get('/api/activity/feed', async (req, res) => {
    try {
        const { data } = await supabase
            .from('user_activity')
            .select(`
                *,
                users(username),
                challenges(title)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        const activities = (data || []).map(a => ({
            username: a.users?.username || 'User',
            action: a.activity_type,
            challenge_title: a.challenges?.title,
            created_at: a.created_at
        }));

        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

// ============================================
// LEARNING PATHS API
// ============================================

// Get learning paths
app.get('/api/learn/paths', async (req, res) => {
    try {
        const { data } = await supabase
            .from('learning_paths')
            .select('*')
            .order('order_index', { ascending: true });

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch learning paths' });
    }
});

// Start a learning path
app.post('/api/learn/paths/:id/start', authenticate, async (req, res) => {
    try {
        const pathId = req.params.id;
        
        // Get path and its challenges
        const { data: path } = await supabase
            .from('learning_paths')
            .select('*, challenges:challenge_ids')
            .eq('id', pathId)
            .single();

        if (!path) {
            return res.status(404).json({ error: 'Path not found' });
        }

        // Record that user started this path
        await supabase.from('user_learning_progress').upsert({
            user_id: req.userId,
            path_id: pathId,
            started_at: new Date().toISOString()
        });

        res.json({ 
            status: 'started',
            path: path,
            challengeIds: path.challenge_ids || []
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to start path' });
    }
});

// ============================================
// SKILL TREE API
// ============================================

// Get skill tree
app.get('/api/skills/tree', async (req, res) => {
    try {
        const { data } = await supabase
            .from('skill_categories')
            .select('*')
            .order('name', { ascending: true });

        // If user is authenticated, get their skill progress
        let userSkills = [];
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const { data: skills } = await supabase
                    .from('user_skills')
                    .select('*')
                    .eq('user_id', decoded.userId);
                userSkills = skills || [];
            } catch (e) {}
        }

        const skills = (data || []).map(s => ({
            ...s,
            unlocked: userSkills.some(us => us.skill_id === s.id),
            level: userSkills.find(us => us.skill_id === s.id)?.skill_level || 0
        }));

        res.json(skills);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch skill tree' });
    }
});

// ============================================
// FRIEND SEARCH
// ============================================

// Search users for friend requests
app.get('/api/friends/search', authenticate, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]);
        }

        const { data } = await supabase
            .from('users')
            .select('id, username, level, xp')
            .ilike('username', `%${query}%`)
            .neq('id', req.userId)
            .limit(10);

        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// Reject friend request
app.post('/api/friends/reject/:requestId', authenticate, async (req, res) => {
    try {
        await supabase
            .from('friendships')
            .delete()
            .eq('id', req.params.requestId)
            .eq('friend_id', req.userId);

        res.json({ status: 'rejected' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// ============================================
// NOTIFICATIONS - Mark single as read
// ============================================

app.post('/api/notifications/:id/read', authenticate, async (req, res) => {
    try {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', req.params.id)
            .eq('user_id', req.userId);

        res.json({ status: 'marked_read' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// ============================================
// USER STATS
// ============================================

// Get detailed user stats
app.get('/api/stats/:userId', async (req, res) => {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.params.userId)
            .single();

        const { data: activity } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', req.params.userId)
            .order('activity_date', { ascending: false })
            .limit(30);

        const { data: battles } = await supabase
            .from('battles')
            .select('winner_id')
            .or(`player1_id.eq.${req.params.userId},player2_id.eq.${req.params.userId}`)
            .eq('status', 'completed');

        const battlesWon = battles?.filter(b => b.winner_id === parseInt(req.params.userId)).length || 0;

        // Calculate stats by category
        const { data: challenges } = await supabase
            .from('challenges')
            .select('id, category, difficulty');

        const solvedChallenges = user.solved_challenges || [];
        const categoryStats = {};
        const difficultyStats = { Easy: 0, Medium: 0, Hard: 0 };

        challenges.forEach(c => {
            if (solvedChallenges.includes(c.id)) {
                categoryStats[c.category] = (categoryStats[c.category] || 0) + 1;
                difficultyStats[c.difficulty]++;
            }
        });

        res.json({
            totalSolved: solvedChallenges.length,
            totalXp: user.xp,
            level: user.level,
            currentStreak: user.streak_count || 0,
            bestStreak: user.best_streak || 0,
            battlesWon,
            totalBattles: battles?.length || 0,
            categoryStats,
            difficultyStats,
            recentActivity: activity || []
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Catch-all route - serve index.html for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER - Must be at the end!
// ============================================
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server is ready to accept connections`);
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});