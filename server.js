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
            { input: "4\n2 7 11 15\n9", expected: "0 1" }, // Sample
            { input: "3\n3 2 4\n6", expected: "1 2", hidden: true },
            { input: "2\n3 3\n6", expected: "0 1", hidden: true }
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
            { input: "121", expected: "true" }, // Sample
            { input: "-121", expected: "false", hidden: true },
            { input: "10", expected: "false", hidden: true }
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
            { input: "hello", expected: "olleh" }, // Sample
            { input: "Hannah", expected: "hannaH", hidden: true }
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
            { input: "5", expected: "120" }, // Sample
            { input: "0", expected: "1", hidden: true },
            { input: "3", expected: "6", hidden: true }
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
            { input: "5\n1 5 3 9 2", expected: "9" }, // Sample
            { input: "3\n-1 -5 -2", expected: "-1", hidden: true }
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
        category: "Arrays",
        description: "Given a sorted array and a target, return the index of the target or -1 if not found.\n\nInput Format:\nFirst line: N (size)\nSecond line: N sorted integers\nThird line: Target\n\nOutput Format:\nIndex or -1.",
        points: 150,
        test_cases: [
            { input: "5\n1 2 3 4 5\n3", expected: "2" },
            { input: "5\n1 2 3 4 5\n6", expected: "-1" }
        ],
        hints: ['Array is sorted', 'Compare with middle element', 'Narrow search space by half'],
        editorial: 'Use binary search: compare target with mid, search left or right half accordingly.',
        tags: ['arrays', 'binary-search'],
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
    },
    {
        id: 9,
        title: "Valid Parentheses",
        difficulty: "Easy",
        category: "Strings",
        description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nInput Format:\nA single string of brackets.\n\nOutput Format:\n'true' if valid, 'false' otherwise.",
        points: 100,
        test_cases: [
            { input: "()", expected: "true" },
            { input: "()[]{}", expected: "true" },
            { input: "(]", expected: "false" },
            { input: "([)]", expected: "false" },
            { input: "{[]}", expected: "true" }
        ],
        hints: ['Use a stack data structure', 'Push opening brackets, pop for closing', 'Check if stack is empty at end'],
        editorial: 'Use a stack to track opening brackets. For each closing bracket, check if it matches the top of stack.',
        tags: ['strings', 'stack'],
        time_limit: 300
    },
    {
        id: 10,
        title: "FizzBuzz",
        difficulty: "Easy",
        category: "Math",
        description: "Print numbers from 1 to N. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', for multiples of both print 'FizzBuzz'.\n\nInput Format:\nA single integer N.\n\nOutput Format:\nN lines of output.",
        points: 100,
        test_cases: [
            { input: "5", expected: "1\n2\nFizz\n4\nBuzz" },
            { input: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" }
        ],
        hints: ['Check divisibility using modulo', 'Check 15 first (both 3 and 5)', 'Use if-else chain properly'],
        editorial: 'Loop 1 to N, check divisibility by 15 first, then 3, then 5, else print number.',
        tags: ['math', 'conditionals'],
        time_limit: 300
    },
    {
        id: 11,
        title: "Count Vowels",
        difficulty: "Easy",
        category: "Strings",
        description: "Count the number of vowels (a, e, i, o, u) in a given string. Case insensitive.\n\nInput Format:\nA single string.\n\nOutput Format:\nNumber of vowels.",
        points: 100,
        test_cases: [
            { input: "hello", expected: "2" },
            { input: "AEIOU", expected: "5" },
            { input: "xyz", expected: "0" },
            { input: "Programming", expected: "3" }
        ],
        hints: ['Convert to lowercase first', 'Use a set for vowels', 'Iterate through each character'],
        editorial: 'Convert string to lowercase, iterate through chars, check if each is in vowel set.',
        tags: ['strings', 'iteration'],
        time_limit: 300
    },
    {
        id: 12,
        title: "Sum of Digits",
        difficulty: "Easy",
        category: "Math",
        description: "Find the sum of all digits in a given number.\n\nInput Format:\nA single integer N.\n\nOutput Format:\nSum of digits.",
        points: 100,
        test_cases: [
            { input: "123", expected: "6" },
            { input: "9999", expected: "36" },
            { input: "0", expected: "0" },
            { input: "1001", expected: "2" }
        ],
        hints: ['Use modulo 10 to get last digit', 'Divide by 10 to remove last digit', 'Loop until number becomes 0'],
        editorial: 'Extract digits using n%10, add to sum, then n=n/10. Repeat until n is 0.',
        tags: ['math', 'iteration'],
        time_limit: 300
    },
    {
        id: 13,
        title: "Prime Number Check",
        difficulty: "Easy",
        category: "Math",
        description: "Determine if a given number is prime.\n\nInput Format:\nA single integer N.\n\nOutput Format:\n'true' if prime, 'false' otherwise.",
        points: 100,
        test_cases: [
            { input: "7", expected: "true" },
            { input: "4", expected: "false" },
            { input: "2", expected: "true" },
            { input: "1", expected: "false" },
            { input: "17", expected: "true" }
        ],
        hints: ['Check divisibility up to sqrt(n)', 'Handle edge cases: 1 is not prime', '2 is the only even prime'],
        editorial: 'Check if n < 2 (not prime). Then check divisibility from 2 to sqrt(n).',
        tags: ['math', 'optimization'],
        time_limit: 300
    },
    {
        id: 14,
        title: "Array Sum",
        difficulty: "Easy",
        category: "Arrays",
        description: "Calculate the sum of all elements in an array.\n\nInput Format:\nFirst line: N (size)\nSecond line: N integers\n\nOutput Format:\nSum of array.",
        points: 100,
        test_cases: [
            { input: "5\n1 2 3 4 5", expected: "15" },
            { input: "3\n-1 0 1", expected: "0" },
            { input: "1\n42", expected: "42" }
        ],
        hints: ['Initialize sum to 0', 'Iterate through all elements', 'Add each element to sum'],
        editorial: 'Simple iteration through array, accumulating sum. Time complexity O(n).',
        tags: ['arrays', 'iteration'],
        time_limit: 300
    },
    {
        id: 15,
        title: "Remove Duplicates",
        difficulty: "Medium",
        category: "Arrays",
        description: "Remove duplicates from a sorted array and print unique elements.\n\nInput Format:\nFirst line: N (size)\nSecond line: N sorted integers\n\nOutput Format:\nSpace-separated unique elements.",
        points: 150,
        test_cases: [
            { input: "5\n1 1 2 2 3", expected: "1 2 3" },
            { input: "7\n0 0 1 1 1 2 2", expected: "0 1 2" },
            { input: "1\n1", expected: "1" }
        ],
        hints: ['Array is already sorted', 'Use two pointer technique', 'Compare adjacent elements'],
        editorial: 'Use two pointers: one for unique position, one for iteration. Skip duplicates.',
        tags: ['arrays', 'two-pointers'],
        time_limit: 300
    },
    {
        id: 16,
        title: "Anagram Check",
        difficulty: "Medium",
        category: "Strings",
        description: "Check if two strings are anagrams of each other (contain same characters).\n\nInput Format:\nFirst line: First string\nSecond line: Second string\n\nOutput Format:\n'true' if anagrams, 'false' otherwise.",
        points: 150,
        test_cases: [
            { input: "listen\nsilent", expected: "true" },
            { input: "hello\nworld", expected: "false" },
            { input: "anagram\nnagaram", expected: "true" },
            { input: "rat\ncar", expected: "false" }
        ],
        hints: ['Sort both strings and compare', 'Or use character frequency count', 'Handle case sensitivity'],
        editorial: 'Sort both strings and compare, or count character frequencies in both strings.',
        tags: ['strings', 'sorting', 'hash-map'],
        time_limit: 300
    },
    {
        id: 17,
        title: "Power of Two",
        difficulty: "Easy",
        category: "Math",
        description: "Check if a given number is a power of 2.\n\nInput Format:\nA single integer N.\n\nOutput Format:\n'true' if power of 2, 'false' otherwise.",
        points: 100,
        test_cases: [
            { input: "1", expected: "true" },
            { input: "16", expected: "true" },
            { input: "3", expected: "false" },
            { input: "0", expected: "false" },
            { input: "64", expected: "true" }
        ],
        hints: ['Use bit manipulation: n & (n-1)', 'Power of 2 has only one bit set', 'Handle n <= 0'],
        editorial: 'A power of 2 in binary has exactly one 1 bit. n & (n-1) will be 0 for powers of 2.',
        tags: ['math', 'bit-manipulation'],
        time_limit: 300
    },
    {
        id: 18,
        title: "Reverse Array",
        difficulty: "Easy",
        category: "Arrays",
        description: "Reverse an array in place and print the result.\n\nInput Format:\nFirst line: N (size)\nSecond line: N integers\n\nOutput Format:\nSpace-separated reversed array.",
        points: 100,
        test_cases: [
            { input: "5\n1 2 3 4 5", expected: "5 4 3 2 1" },
            { input: "4\n1 2 3 4", expected: "4 3 2 1" },
            { input: "1\n1", expected: "1" }
        ],
        hints: ['Use two pointers from ends', 'Swap elements moving inward', 'Stop when pointers meet'],
        editorial: 'Use two pointers at start and end, swap elements and move pointers inward.',
        tags: ['arrays', 'two-pointers'],
        time_limit: 300
    },
    {
        id: 19,
        title: "GCD of Two Numbers",
        difficulty: "Medium",
        category: "Math",
        description: "Find the Greatest Common Divisor (GCD) of two numbers.\n\nInput Format:\nTwo integers A and B on one line.\n\nOutput Format:\nGCD of A and B.",
        points: 150,
        test_cases: [
            { input: "12 8", expected: "4" },
            { input: "17 5", expected: "1" },
            { input: "100 25", expected: "25" },
            { input: "7 7", expected: "7" }
        ],
        hints: ['Use Euclidean algorithm', 'GCD(a,b) = GCD(b, a%b)', 'Base case: GCD(a,0) = a'],
        editorial: 'Euclidean algorithm: repeatedly replace larger with remainder until one becomes 0.',
        tags: ['math', 'recursion'],
        time_limit: 300
    },
    {
        id: 20,
        title: "Climbing Stairs",
        difficulty: "Medium",
        category: "Dynamic Programming",
        description: "You can climb 1 or 2 steps at a time. How many distinct ways can you climb N stairs?\n\nInput Format:\nA single integer N.\n\nOutput Format:\nNumber of distinct ways.",
        points: 150,
        test_cases: [
            { input: "2", expected: "2" },
            { input: "3", expected: "3" },
            { input: "5", expected: "8" },
            { input: "10", expected: "89" }
        ],
        hints: ['This is similar to Fibonacci', 'ways(n) = ways(n-1) + ways(n-2)', 'Use dynamic programming'],
        editorial: 'Classic DP problem. ways[i] = ways[i-1] + ways[i-2]. Base: ways[1]=1, ways[2]=2.',
        tags: ['dynamic-programming', 'recursion'],
        time_limit: 300
    },
    {
        id: 21,
        title: "Longest Common Prefix",
        difficulty: "Medium",
        category: "Strings",
        description: "Find the longest common prefix string amongst an array of strings.\n\nInput Format:\nFirst line: N (number of strings)\nNext N lines: strings\n\nOutput Format:\nLongest common prefix (or empty if none).",
        points: 150,
        test_cases: [
            { input: "3\nflower\nflow\nflight", expected: "fl" },
            { input: "3\ndog\nracecar\ncar", expected: "" },
            { input: "2\naa\na", expected: "a" }
        ],
        hints: ['Compare characters position by position', 'Start with first string as prefix', 'Shrink prefix as you compare'],
        editorial: 'Take first string as prefix, compare with each string and shrink prefix accordingly.',
        tags: ['strings', 'iteration'],
        time_limit: 300
    },
    {
        id: 22,
        title: "Single Number",
        difficulty: "Medium",
        category: "Arrays",
        description: "Every element appears twice except for one. Find that single one.\n\nInput Format:\nFirst line: N (size, always odd)\nSecond line: N integers\n\nOutput Format:\nThe single number.",
        points: 150,
        test_cases: [
            { input: "3\n2 2 1", expected: "1" },
            { input: "5\n4 1 2 1 2", expected: "4" },
            { input: "1\n1", expected: "1" }
        ],
        hints: ['XOR of same numbers is 0', 'XOR all elements together', 'Result will be the single number'],
        editorial: 'Use XOR: a^a=0 and a^0=a. XORing all numbers leaves only the single number.',
        tags: ['arrays', 'bit-manipulation'],
        time_limit: 300
    },
    {
        id: 23,
        title: "Move Zeroes",
        difficulty: "Easy",
        category: "Arrays",
        description: "Move all 0's to the end of array while maintaining relative order of non-zero elements.\n\nInput Format:\nFirst line: N (size)\nSecond line: N integers\n\nOutput Format:\nSpace-separated result.",
        points: 100,
        test_cases: [
            { input: "5\n0 1 0 3 12", expected: "1 3 12 0 0" },
            { input: "1\n0", expected: "0" },
            { input: "4\n1 2 3 4", expected: "1 2 3 4" }
        ],
        hints: ['Use two pointer approach', 'One pointer for position to place non-zero', 'Fill remaining with zeros'],
        editorial: 'Use a write pointer. Copy non-zero elements, then fill rest with zeros.',
        tags: ['arrays', 'two-pointers'],
        time_limit: 300
    },
    {
        id: 24,
        title: "Contains Duplicate",
        difficulty: "Easy",
        category: "Arrays",
        description: "Return true if any value appears at least twice in the array.\n\nInput Format:\nFirst line: N (size)\nSecond line: N integers\n\nOutput Format:\n'true' or 'false'.",
        points: 100,
        test_cases: [
            { input: "4\n1 2 3 1", expected: "true" },
            { input: "4\n1 2 3 4", expected: "false" },
            { input: "5\n1 1 1 3 3", expected: "true" }
        ],
        hints: ['Use a hash set', 'Check if element exists before adding', 'Or sort and check adjacent'],
        editorial: 'Use HashSet to track seen elements. If element already in set, return true.',
        tags: ['arrays', 'hash-map'],
        time_limit: 300
    },
    {
        id: 25,
        title: "Maximum Subarray",
        difficulty: "Hard",
        category: "Dynamic Programming",
        description: "Find the contiguous subarray with the largest sum.\n\nInput Format:\nFirst line: N (size)\nSecond line: N integers\n\nOutput Format:\nMaximum subarray sum.",
        points: 200,
        test_cases: [
            { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expected: "6" },
            { input: "1\n1", expected: "1" },
            { input: "5\n5 4 -1 7 8", expected: "23" }
        ],
        hints: ['Use Kadane\'s algorithm', 'Track current sum and max sum', 'Reset current sum if negative'],
        editorial: 'Kadane\'s algorithm: currentMax = max(num, currentMax + num), track globalMax.',
        tags: ['dynamic-programming', 'arrays'],
        time_limit: 300
    }
];

async function seedDatabase() {
    try {
        const { data: existingChallenges, error } = await supabase
            .from('challenges')
            .select('id');

        if (error) {
            console.error('Error checking challenges table:', error.message);
            console.log('Make sure you have created the tables in Supabase. See the SQL schema below.');
            return;
        }

        if (!existingChallenges || existingChallenges.length === 0) {
            // No challenges exist, insert all
            const { error: insertError } = await supabase
                .from('challenges')
                .insert(initialChallenges);

            if (insertError) {
                console.error('Error seeding challenges:', insertError.message);
            } else {
                console.log('Database seeded with', initialChallenges.length, 'challenges');
            }
        } else {
            // Check for new challenges to add
            const existingIds = existingChallenges.map(c => c.id);
            const newChallenges = initialChallenges.filter(c => !existingIds.includes(c.id));

            if (newChallenges.length > 0) {
                const { error: insertError } = await supabase
                    .from('challenges')
                    .insert(newChallenges);

                if (insertError) {
                    console.error('Error adding new challenges:', insertError.message);
                } else {
                    console.log('Added', newChallenges.length, 'new challenges. Total:', initialChallenges.length);
                }
            } else {
                console.log('All', existingChallenges.length, 'challenges exist');
            }

            // Update existing challenges with hints if they're missing
            console.log('Updating all challenges with hints...');
            for (const challenge of initialChallenges) {
                const { error: updateError } = await supabase
                    .from('challenges')
                    .update({
                        hints: challenge.hints,
                        editorial: challenge.editorial,
                        tags: challenge.tags,
                        test_cases: challenge.test_cases
                    })
                    .eq('id', challenge.id);

                if (updateError) {
                    console.error(`Failed to update challenge ${challenge.id}:`, updateError.message);
                }
            }
            console.log('Updated all challenges with hints and metadata');
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
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                level: newUser.level,
                xp: newUser.xp,
                solvedChallenges: newUser.solved_challenges || [],
                created_at: newUser.created_at
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
                id: user.id,
                username: user.username,
                email: user.email,
                level: user.level,
                xp: user.xp,
                solvedChallenges: user.solved_challenges || [],
                created_at: user.created_at
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
            id: user.id,
            username: user.username,
            email: user.email,
            level: user.level,
            xp: user.xp,
            solvedChallenges: user.solved_challenges || [],
            created_at: user.created_at
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
            console.error('Challenges fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch challenges' });
        }

        const publicChallenges = challenges.map(c => {
            // Handle hints - could be string, array, or null
            let hints = [];
            if (c.hints) {
                if (typeof c.hints === 'string') {
                    try {
                        hints = JSON.parse(c.hints);
                    } catch (e) {
                        hints = [];
                    }
                } else if (Array.isArray(c.hints)) {
                    hints = c.hints;
                }
            }

            // Fallback to seed data if hints are missing (handles RLS update issues for first 5)
            if (!hints || hints.length === 0) {
                const seed = initialChallenges.find(ic => Number(ic.id) === Number(c.id));
                if (seed && seed.hints) {
                    hints = seed.hints;
                }
            }

            return {
                id: c.id,
                title: c.title,
                difficulty: c.difficulty,
                category: c.category,
                description: c.description,
                points: c.points,
                hints: hints,
                tags: c.tags || [],
                testCases: c.test_cases ? c.test_cases.map(tc => ({ input: tc.input, hidden: true })) : []
            };
        });
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
    const { code, language, challengeId, token, type = 'run' } = req.body;

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

        // If it's a "run", we only process non-hidden cases. If "submit", we process all.
        const testCases = (challenge.test_cases || []).filter(tc => type === 'submit' || !tc.hidden);

        if (testCases.length === 0) {
            return res.json({ status: 'error', output: 'No test cases available for this challenge.' });
        }

        let allPassed = true;
        let testResults = [];
        let outputLog = type === 'submit' ? "Submitting solution...\n" : "Running sample tests...\n";

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const startTime = Date.now();
            const result = await executeWithPiston(language, code, testCase.input);
            const endTime = Date.now();
            const runTime = result.run.time || (endTime - startTime) / 1000;

            const actualOutput = (result.run.stdout || "").trim();
            const expectedOutput = testCase.expected.trim();
            const errorOutput = result.run.stderr;

            const passed = !errorOutput && (actualOutput === expectedOutput);

            testResults.push({
                input: testCase.input,
                expected: testCase.expected,
                actual: actualOutput,
                error: errorOutput,
                passed,
                runTime,
                memory: result.run.memory,
                hidden: !!testCase.hidden
            });

            if (!passed) {
                allPassed = false;
                if (type === 'submit') break; // LeetCode style: stop at first failure for submission
            }
        }

        // Summary log management (for console)
        if (allPassed) {
            outputLog += type === 'submit'
                ? `\nSuccess: All ${testCases.length} test cases passed! 🎉 (+${challenge.points} XP)`
                : `\nSample tests passed! Try submitting to earn XP.`;

            // Database updates only for successful submission
            if (type === 'submit' && userId) {
                const { data: user } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (user) {
                    const alreadySolved = user.solved_challenges?.includes(challenge.id);
                    if (!alreadySolved) {
                        const newSolvedChallenges = [...(user.solved_challenges || []), challenge.id];
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

                        // Update activity feed
                        await updateUserActivity(userId, challenge.points, true);
                    }
                }
            }
        } else {
            outputLog += `\nFailed: Some tests did not pass.`;
        }

        res.json({
            status: allPassed ? 'success' : 'error',
            output: outputLog,
            testResults,
            points: (type === 'submit' && allPassed) ? challenge.points : 0
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

// Get user streak info (authenticated user)
app.get('/api/streak', authenticate, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('streak_count, best_streak, last_active')
            .eq('id', req.userId)
            .single();

        if (error) {
            return res.json({
                current_streak: 0,
                best_streak: 0,
                last_active: null
            });
        }
        res.json({
            current_streak: user.streak_count || 0,
            best_streak: user.best_streak || 0,
            last_active: user.last_active
        });
    } catch (err) {
        res.json({ current_streak: 0, best_streak: 0 });
    }
});

// Get user streak info by userId
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
// BATTLE MODE ROUTES - FIXED MATCHMAKING SYSTEM
// ============================================

// Queue expiration time in milliseconds (2 minutes)
const QUEUE_EXPIRATION_MS = 2 * 60 * 1000;

// Battle expiration time (30 minutes) - battles older than this are stale
const BATTLE_EXPIRATION_MS = 30 * 60 * 1000;

// Clean up expired queue entries
async function cleanExpiredQueueEntries() {
    const expirationTime = new Date(Date.now() - QUEUE_EXPIRATION_MS).toISOString();
    try {
        await supabase
            .from('battle_queue')
            .delete()
            .lt('joined_at', expirationTime);
    } catch (err) {
        console.error('Error cleaning expired queue entries:', err);
    }
}

// Clean up stale "active" battles that are older than 30 minutes
// These are zombie battles from previous sessions that were never completed
async function cleanStaleBattles() {
    const expirationTime = new Date(Date.now() - BATTLE_EXPIRATION_MS).toISOString();
    try {
        const { data: staleBattles, error: fetchError } = await supabase
            .from('battles')
            .select('id, started_at')
            .eq('status', 'active')
            .lt('started_at', expirationTime);

        if (staleBattles && staleBattles.length > 0) {
            console.log(`Found ${staleBattles.length} stale active battles, marking as expired...`);

            // Update stale battles to 'expired' status
            const { error: updateError } = await supabase
                .from('battles')
                .update({
                    status: 'expired',
                    ended_at: new Date().toISOString()
                })
                .eq('status', 'active')
                .lt('started_at', expirationTime);

            if (updateError) {
                console.error('Error updating stale battles:', updateError);
            } else {
                console.log(`Cleaned up ${staleBattles.length} stale battles`);
            }
        }
    } catch (err) {
        console.error('Error cleaning stale battles:', err);
    }
}

// Run cleanup on server startup
cleanStaleBattles();
cleanExpiredQueueEntries();

// Also run cleanup periodically (every 5 minutes)
setInterval(() => {
    cleanStaleBattles();
    cleanExpiredQueueEntries();
}, 5 * 60 * 1000);

// Manual cleanup endpoint - call this to force cleanup of all stale data
app.post('/api/battles/cleanup', async (req, res) => {
    try {
        console.log('Manual battle cleanup triggered...');

        // Clean ALL active battles (mark as expired)
        const { data: allActiveBattles } = await supabase
            .from('battles')
            .select('id')
            .eq('status', 'active');

        if (allActiveBattles && allActiveBattles.length > 0) {
            await supabase
                .from('battles')
                .update({
                    status: 'expired',
                    ended_at: new Date().toISOString()
                })
                .eq('status', 'active');
            console.log(`Cleaned ${allActiveBattles.length} active battles`);
        }

        // Clean all queue entries
        const { data: allQueueEntries } = await supabase
            .from('battle_queue')
            .select('id');

        if (allQueueEntries && allQueueEntries.length > 0) {
            await supabase.from('battle_queue').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            console.log(`Cleaned ${allQueueEntries.length} queue entries`);
        }

        res.json({
            status: 'cleaned',
            battlesExpired: allActiveBattles?.length || 0,
            queueEntriesRemoved: allQueueEntries?.length || 0
        });
    } catch (err) {
        console.error('Manual cleanup error:', err);
        res.status(500).json({ error: 'Cleanup failed' });
    }
});

// Join battle queue - EXPLICIT OPT-IN REQUIRED
app.post('/api/battles/queue', authenticate, async (req, res) => {
    try {
        const { difficulty } = req.body;

        // Validate difficulty parameter
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!difficulty || !validDifficulties.includes(difficulty.toLowerCase())) {
            return res.status(400).json({
                error: 'Invalid difficulty. Must be easy, medium, or hard.'
            });
        }

        const normalizedDifficulty = difficulty.toLowerCase();

        // First, clean up any expired queue entries
        await cleanExpiredQueueEntries();

        // Remove any existing queue entry for this user (fresh start)
        await supabase
            .from('battle_queue')
            .delete()
            .eq('user_id', req.userId);

        // Check if user is already in an ACTIVE battle
        const { data: activeBattle } = await supabase
            .from('battles')
            .select('id')
            .or(`player1_id.eq.${req.userId},player2_id.eq.${req.userId}`)
            .eq('status', 'active')
            .single();

        if (activeBattle) {
            return res.status(400).json({
                error: 'You are already in an active battle',
                battleId: activeBattle.id
            });
        }

        // Look for an opponent with EXACT SAME DIFFICULTY who is actively searching
        const { data: opponent } = await supabase
            .from('battle_queue')
            .select('*')
            .eq('difficulty', normalizedDifficulty)
            .neq('user_id', req.userId)
            .gte('joined_at', new Date(Date.now() - QUEUE_EXPIRATION_MS).toISOString())
            .order('joined_at', { ascending: true })
            .limit(1)
            .single();

        if (opponent) {
            // MATCH FOUND with SAME DIFFICULTY!
            // Double-check opponent is not already in an active battle
            const { data: opponentBattle } = await supabase
                .from('battles')
                .select('id')
                .or(`player1_id.eq.${opponent.user_id},player2_id.eq.${opponent.user_id}`)
                .eq('status', 'active')
                .single();

            if (opponentBattle) {
                // Opponent is somehow already in a battle, remove them from queue
                await supabase.from('battle_queue').delete().eq('id', opponent.id);

                // Add current user to queue instead
                await supabase.from('battle_queue').insert({
                    user_id: req.userId,
                    difficulty: normalizedDifficulty,
                    joined_at: new Date().toISOString()
                });

                return res.json({
                    status: 'queued',
                    message: 'Waiting for opponent...',
                    difficulty: normalizedDifficulty
                });
            }

            // Get a random challenge matching the difficulty (Case-Insensitive match)
            const { data: challenges, error: challengesError } = await supabase
                .from('challenges')
                .select('*')
                .ilike('difficulty', normalizedDifficulty);

            if (challengesError) {
                console.error(`Error fetching challenges for difficulty "${normalizedDifficulty}":`, challengesError);
                return res.status(500).json({ error: 'Failed to fetch challenges' });
            }

            if (!challenges || challenges.length === 0) {
                console.error(`CRITICAL: No challenges found in database for difficulty: "${normalizedDifficulty}"`);
                return res.status(500).json({ error: `No challenges available for "${normalizedDifficulty}" difficulty. Please contact admin to seed challenges.` });
            }

            console.log(`Found ${challenges.length} challenges for difficulty "${normalizedDifficulty}". Selecting one...`);
            const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
            console.log(`Selected random challenge: "${randomChallenge.title}" (ID: ${randomChallenge.id})`);

            // Create the battle (difficulty is tracked via challenge_id, not a separate column)
            const { data: battle, error: battleError } = await supabase
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

            if (battleError) {
                console.error('Battle creation error:', battleError);
                return res.status(500).json({ error: 'Failed to create battle' });
            }

            // Remove opponent from queue (they got matched)
            await supabase.from('battle_queue').delete().eq('id', opponent.id);

            // Fetch the full battle data with player info and challenge
            const { data: fullBattle } = await supabase
                .from('battles')
                .select('*, challenges(*), player1:users!player1_id(id, username), player2:users!player2_id(id, username)')
                .eq('id', battle.id)
                .single();

            console.log(`Match created: ${req.userId} vs ${opponent.user_id} on difficulty: ${normalizedDifficulty}`);

            res.json({
                status: 'matched',
                battle: fullBattle,
                difficulty: normalizedDifficulty
            });
        } else {
            // No match found, add to queue with timestamp
            const { error: queueError } = await supabase.from('battle_queue').insert({
                user_id: req.userId,
                difficulty: normalizedDifficulty,
                joined_at: new Date().toISOString()
            });

            if (queueError) {
                console.error('Queue insert error:', queueError);
                return res.status(500).json({ error: 'Failed to join queue' });
            }

            console.log(`User ${req.userId} joined queue for difficulty: ${normalizedDifficulty}`);

            res.json({
                status: 'queued',
                message: 'Waiting for opponent...',
                difficulty: normalizedDifficulty,
                expiresIn: QUEUE_EXPIRATION_MS
            });
        }
    } catch (err) {
        console.error('Battle queue error:', err);
        res.status(500).json({ error: 'Failed to join queue' });
    }
});

// Leave battle queue - EXPLICIT OPT-OUT
app.delete('/api/battles/queue', authenticate, async (req, res) => {
    try {
        await supabase.from('battle_queue').delete().eq('user_id', req.userId);
        console.log(`User ${req.userId} left the battle queue`);
        res.json({ status: 'left_queue' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to leave queue' });
    }
});

// Check queue status
app.get('/api/battles/queue/status', authenticate, async (req, res) => {
    try {
        // Clean expired entries first
        await cleanExpiredQueueEntries();

        const { data: queueEntry } = await supabase
            .from('battle_queue')
            .select('*')
            .eq('user_id', req.userId)
            .single();

        if (queueEntry) {
            const timeInQueue = Date.now() - new Date(queueEntry.joined_at).getTime();
            res.json({
                inQueue: true,
                difficulty: queueEntry.difficulty,
                timeInQueue: Math.floor(timeInQueue / 1000),
                expiresIn: Math.max(0, QUEUE_EXPIRATION_MS - timeInQueue)
            });
        } else {
            res.json({ inQueue: false });
        }
    } catch (err) {
        res.json({ inQueue: false });
    }
});

// Get active battle - ONLY RETURNS TRULY ACTIVE BATTLES
app.get('/api/battles/active', authenticate, async (req, res) => {
    try {
        // Clean expired queue entries only (NOT stale battles during active poll)
        await cleanExpiredQueueEntries();

        // Get only battles with status 'active' for this user
        const { data: battle, error } = await supabase
            .from('battles')
            .select('*, challenges(*), player1:users!player1_id(id, username), player2:users!player2_id(id, username)')
            .or(`player1_id.eq.${req.userId},player2_id.eq.${req.userId}`)
            .eq('status', 'active')
            .order('started_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Active battle fetch error:', error);
        }

        // Return the battle without stale checking (that's done on startup only)
        res.json(battle || null);
    } catch (err) {
        console.error('Battle active error:', err);
        res.json(null);
    }
});

// Submit battle solution
app.post('/api/battles/:battleId/submit', authenticate, async (req, res) => {
    try {
        const { code, language } = req.body;
        const battleId = req.params.battleId;

        // Get the battle and verify it's active
        const { data: battle, error: fetchError } = await supabase
            .from('battles')
            .select('*, challenges(*), player1:users!player1_id(id, username), player2:users!player2_id(id, username)')
            .eq('id', battleId)
            .single();

        if (fetchError || !battle) {
            return res.status(404).json({ error: 'Battle not found' });
        }

        // CRITICAL: Only allow submission for ACTIVE battles
        if (battle.status !== 'active') {
            return res.status(400).json({
                error: 'Battle is not active',
                status: battle.status
            });
        }

        // Verify the user is a participant
        const isPlayer1 = battle.player1_id === req.userId;
        const isPlayer2 = battle.player2_id === req.userId;

        if (!isPlayer1 && !isPlayer2) {
            return res.status(403).json({ error: 'You are not a participant in this battle' });
        }

        const challenge = battle.challenges;

        // Run tests against the solution
        let allPassed = true;
        let testResults = [];

        for (const testCase of challenge.test_cases) {
            try {
                const result = await executeWithPiston(language, code, testCase.input);
                const actualOutput = (result.run.stdout || "").trim();
                const passed = actualOutput === testCase.expected.trim();

                testResults.push({
                    passed,
                    expected: testCase.expected,
                    actual: actualOutput,
                    hidden: testCase.hidden
                });

                if (!passed) {
                    allPassed = false;
                }
            } catch (execError) {
                allPassed = false;
                testResults.push({
                    passed: false,
                    error: execError.message,
                    hidden: testCase.hidden
                });
            }
        }

        if (allPassed) {
            // User won the battle!
            const timeField = isPlayer1 ? 'player1_time' : 'player2_time';
            const codeField = isPlayer1 ? 'player1_code' : 'player2_code';
            const elapsedTime = Math.floor((Date.now() - new Date(battle.started_at).getTime()) / 1000);

            // Award XP based on difficulty
            const difficultyMultiplier = {
                'Easy': 50,
                'Medium': 100,
                'Hard': 150
            };
            const xpToAdd = difficultyMultiplier[challenge.difficulty] || 50;

            // Update winner's XP
            const { data: winner } = await supabase
                .from('users')
                .select('xp')
                .eq('id', req.userId)
                .single();

            if (winner) {
                await supabase
                    .from('users')
                    .update({ xp: (winner.xp || 0) + xpToAdd })
                    .eq('id', req.userId);
            }

            // Update battle to completed status
            await supabase
                .from('battles')
                .update({
                    [timeField]: elapsedTime,
                    [codeField]: code,
                    status: 'completed',
                    winner_id: req.userId,
                    ended_at: new Date().toISOString()
                })
                .eq('id', battleId);

            console.log(`Battle ${battleId} won by user ${req.userId}`);

            res.json({
                status: 'success',
                time: elapsedTime,
                battleComplete: true,
                won: true,
                winner_id: req.userId,
                player1_id: battle.player1_id,
                player2_id: battle.player2_id,
                player1: battle.player1,
                player2: battle.player2,
                xpAwarded: xpToAdd,
                testResults
            });
        } else {
            res.json({
                status: 'failed',
                message: 'Tests did not pass. All test cases must pass to win!',
                testResults
            });
        }
    } catch (err) {
        console.error('Battle submit error:', err);
        res.status(500).json({ error: 'Failed to submit solution' });
    }
});

// Forfeit/abandon a battle
app.post('/api/battles/:battleId/forfeit', authenticate, async (req, res) => {
    try {
        const battleId = req.params.battleId;

        const { data: battle } = await supabase
            .from('battles')
            .select('*')
            .eq('id', battleId)
            .eq('status', 'active')
            .single();

        if (!battle) {
            return res.status(404).json({ error: 'Active battle not found' });
        }

        // Verify user is a participant
        const isPlayer1 = battle.player1_id === req.userId;
        const isPlayer2 = battle.player2_id === req.userId;

        if (!isPlayer1 && !isPlayer2) {
            return res.status(403).json({ error: 'You are not a participant in this battle' });
        }

        // The other player wins by forfeit
        const winnerId = isPlayer1 ? battle.player2_id : battle.player1_id;

        await supabase
            .from('battles')
            .update({
                status: 'completed',
                winner_id: winnerId,
                ended_at: new Date().toISOString(),
                forfeit_by: req.userId
            })
            .eq('id', battleId);

        console.log(`Battle ${battleId} forfeited by user ${req.userId}`);

        res.json({ status: 'forfeited', winner_id: winnerId });
    } catch (err) {
        console.error('Forfeit error:', err);
        res.status(500).json({ error: 'Failed to forfeit battle' });
    }
});

// Get battle history - only completed battles
app.get('/api/battles/history', authenticate, async (req, res) => {
    try {
        const { data: battles } = await supabase
            .from('battles')
            .select('*, challenges(title, difficulty), player1:users!player1_id(id, username), player2:users!player2_id(id, username)')
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

// Get all hints unlocked by the current user
app.get('/api/user/unlocked-hints', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('hint_usage')
            .select('challenge_id, hint_level')
            .eq('user_id', req.userId);

        if (error) throw error;

        // Convert to a format easy for the frontend to consume
        const unlocked = {};
        data.forEach(h => {
            unlocked[`${h.challenge_id}_${h.hint_level}`] = true;
        });

        res.json(unlocked);
    } catch (err) {
        console.error('Fetch hints error:', err);
        res.status(500).json({ error: 'Failed to fetch unlocked hints' });
    }
});

// Get hints (costs XP)
app.post('/api/challenges/:id/hint', authenticate, async (req, res) => {
    try {
        const { hintLevel } = req.body;
        const challengeId = parseInt(req.params.id);
        const xpCost = hintLevel * 10;

        console.log('Hint request:', { challengeId, hintLevel, userId: req.userId });

        // First get the challenge hints
        const { data: challenge, error: challengeError } = await supabase
            .from('challenges')
            .select('hints')
            .eq('id', challengeId)
            .single();

        if (challengeError || !challenge) {
            console.error('Challenge not found:', challengeError);
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Parse hints if it's a string
        let hints = challenge.hints;
        if (typeof hints === 'string') {
            try {
                hints = JSON.parse(hints);
            } catch (e) {
                hints = [];
            }
        }
        if (!Array.isArray(hints)) hints = [];

        // Fallback to seed data if hints are empty in DB
        if (hints.length === 0) {
            const seed = initialChallenges.find(ic => Number(ic.id) === Number(challengeId));
            if (seed && seed.hints) {
                hints = seed.hints;
            }
        }

        if (hints.length < hintLevel) {
            console.error('Hint not available:', { hints, hintLevel });
            return res.status(404).json({ error: 'Hint not available' });
        }

        // Check if already unlocked
        const { data: existing } = await supabase
            .from('hint_usage')
            .select('id')
            .eq('user_id', req.userId)
            .eq('challenge_id', challengeId)
            .eq('hint_level', hintLevel)
            .single();

        if (existing) {
            return res.json({ hint: hints[hintLevel - 1], alreadyUnlocked: true });
        }

        // Check user XP
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('xp')
            .eq('id', req.userId)
            .single();

        if (userError || !user) {
            console.error('User not found:', userError);
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.xp < xpCost) {
            return res.status(400).json({ error: `Not enough XP. You need ${xpCost} XP but have ${user.xp} XP` });
        }

        // Deduct XP
        const { error: updateError } = await supabase
            .from('users')
            .update({ xp: user.xp - xpCost })
            .eq('id', req.userId);

        if (updateError) {
            console.error('Failed to update XP:', updateError);
            return res.status(500).json({ error: 'Failed to deduct XP' });
        }

        // Record hint usage
        const { error: insertError } = await supabase.from('hint_usage').insert({
            user_id: req.userId,
            challenge_id: challengeId,
            hint_level: hintLevel,
            xp_cost: xpCost
        });

        if (insertError) {
            console.error('Failed to record hint usage:', insertError);
            // Still return the hint even if recording failed
        }

        console.log('Hint unlocked successfully:', hints[hintLevel - 1]);
        res.json({ hint: hints[hintLevel - 1], xpDeducted: xpCost });
    } catch (err) {
        console.error('Hint error:', err);
        res.status(500).json({ error: 'Failed to get hint: ' + err.message });
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

        // Fallback for first 5 challenges
        if (!challenge.editorial) {
            const seed = initialChallenges.find(ic => Number(ic.id) === Number(req.params.id));
            if (seed) {
                return res.json({
                    editorial: seed.editorial,
                    solution_code: seed.solution_code || "// Solution not available"
                });
            }
        }

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
        const { data, error } = await supabase
            .from('user_activity')
            .select('activity_date')
            .eq('user_id', req.userId)
            .gte('activity_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        if (error) {
            console.error('Heatmap query error:', error.message);
            return res.json([]);
        }

        // Group by date and count
        const grouped = {};
        (data || []).forEach(a => {
            const date = a.activity_date;
            if (date) grouped[date] = (grouped[date] || 0) + 1;
        });

        const result = Object.entries(grouped).map(([date, count]) => ({ date, count }));
        res.json(result);
    } catch (err) {
        console.error('Heatmap crash:', err.message);
        res.json([]);
    }
});

// Get activity feed
app.get('/api/activity/feed', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_activity')
            .select(`
                *,
                users(username)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Activity feed query error:', error.message);
            return res.json([]);
        }

        const activities = (data || []).map(a => ({
            username: a.users?.username || 'User',
            action: 'completed task',
            challenge_title: 'CodeNexus Challenge',
            created_at: a.created_at
        }));

        res.json(activities);
    } catch (err) {
        console.error('Activity feed crash:', err.message);
        res.json([]);
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
            } catch (e) { }
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
// NOTIFICATIONS - Mark all as read
// ============================================

app.post('/api/notifications/read-all', authenticate, async (req, res) => {
    try {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', req.userId)
            .eq('read', false);

        res.json({ status: 'all_marked_read' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark all as read' });
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