// State Management
let currentChallengeId = null;
let editor = null;
let currentUser = null;
let token = localStorage.getItem('token');
let allChallenges = [];
let currentFilter = 'all';

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-links li');
const challengesList = document.getElementById('challenges-list');
const problemTitle = document.getElementById('problem-title');
const problemDesc = document.getElementById('problem-desc');
const problemDifficulty = document.getElementById('problem-difficulty');
const problemPoints = document.getElementById('problem-points');
const problemCategory = document.getElementById('problem-category');
const consoleOutput = document.getElementById('console-output');
const languageSelect = document.getElementById('language-select');

// Auth DOM
const authSection = document.getElementById('auth-section');
const sidebarUserStats = document.getElementById('sidebar-user-stats');
const sidebarUsername = document.getElementById('sidebar-username');
const sidebarLevel = document.getElementById('sidebar-level');
const sidebarXpText = document.getElementById('sidebar-xp-text');
const sidebarXpFill = document.getElementById('sidebar-xp-fill');
const sidebarAvatar = document.getElementById('sidebar-avatar');

// Profile DOM
const profileLoggedIn = document.getElementById('profile-logged-in');
const profileLoggedOut = document.getElementById('profile-logged-out');
const profileUsername = document.getElementById('profile-username');
const profileEmail = document.getElementById('profile-email');
const profileSolvedCount = document.getElementById('profile-solved-count');
const profileXp = document.getElementById('profile-xp');
const profileLevel = document.getElementById('profile-level');
const profileRank = document.getElementById('profile-rank');
const profileXpBar = document.getElementById('profile-xp-bar');
const profileXpProgressText = document.getElementById('profile-xp-progress-text');
const profileJoinedDate = document.getElementById('profile-joined-date');
const profileImg = document.getElementById('profile-img');

// Typing Animation Texts
const typingTexts = [
    "Conquer the Future.",
    "Level Up Your Skills.",
    "Become a Coding Legend.",
    "Master Algorithms.",
    "Build Your Dream."
];
let typingIndex = 0;
let charIndex = 0;
let isDeleting = false;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initEditor();
    fetchChallenges();
    setupNavigation();
    fetchLeaderboard();
    checkAuthState();
    startTypingAnimation();
    setupFilterButtons();
    setupPasswordStrength();
    setupSearchBar();
    
    // Load dynamic features
    loadTournaments();
    loadLearningPaths();
    loadActivityFeed();

    // Language Change Listener
    languageSelect.addEventListener('change', (e) => {
        setEditorMode(e.target.value);
    });

    // Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
});

// Initialize Particles Background
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#38bdf8' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#38bdf8',
                    opacity: 0.1,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.5 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }
}

// Typing Animation
function startTypingAnimation() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;

    function type() {
        const currentText = typingTexts[typingIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            typingIndex = (typingIndex + 1) % typingTexts.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// Replace old showAlert with showToast
function showAlert(msg, type) {
    showToast(msg, type);
}

// Confetti Animation
function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#818cf8'];

    for (let i = 0; i < 150; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * 150,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 10,
            tiltAngle: 0,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confetti.forEach((c, i) => {
            ctx.beginPath();
            ctx.lineWidth = c.r / 2;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 4);
            ctx.stroke();
        });
        update();
    }

    function update() {
        confetti.forEach((c, i) => {
            c.tiltAngle += c.tiltAngleIncrement;
            c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
            c.x += Math.sin(c.d);
            c.tilt = Math.sin(c.tiltAngle) * 15;

            if (c.y > canvas.height) {
                confetti[i] = {
                    x: Math.random() * canvas.width,
                    y: -10,
                    r: c.r,
                    d: c.d,
                    color: c.color,
                    tilt: c.tilt,
                    tiltAngle: c.tiltAngle,
                    tiltAngleIncrement: c.tiltAngleIncrement
                };
            }
        });
    }

    let frames = 0;
    function animate() {
        draw();
        frames++;
        if (frames < 200) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    animate();
}

// XP Popup Animation
function showXpPopup(amount) {
    const popup = document.getElementById('xp-popup');
    const amountEl = document.getElementById('xp-amount');
    if (!popup || !amountEl) return;
    
    amountEl.textContent = `+${amount} XP`;
    popup.classList.remove('hidden');
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
        popup.classList.add('hidden');
    }, 1500);
}

// Level Up Animation
function showLevelUp(newLevel) {
    const newLevelEl = document.getElementById('new-level');
    if (newLevelEl) newLevelEl.textContent = `Level ${newLevel}`;
    openModal('levelup-modal');
    triggerConfetti();
}

// Filter Buttons Setup
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || btn.textContent.toLowerCase();
            filterChallenges();
        });
    });
}

// Search Bar Setup
function setupSearchBar() {
    const searchInput = document.getElementById('challenge-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterChallenges);
    }
}

// Filter Challenges
function filterChallenges() {
    const searchInput = document.getElementById('challenge-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const filtered = allChallenges.filter(c => {
        const matchesFilter = currentFilter === 'all' || c.difficulty.toLowerCase() === currentFilter;
        const matchesSearch = c.title.toLowerCase().includes(searchTerm) || 
                             c.category.toLowerCase().includes(searchTerm);
        return matchesFilter && matchesSearch;
    });
    
    renderChallenges(filtered);
}

// Password Strength Indicator
function setupPasswordStrength() {
    const passwordInput = document.getElementById('signup-password');
    const strengthBar = document.getElementById('password-strength-bar');
    
    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            let strength = 0;
            
            if (password.length >= 8) strength++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            if (/\d/.test(password)) strength++;
            if (/[^a-zA-Z0-9]/.test(password)) strength++;
            
            strengthBar.className = 'strength-bar';
            if (strength <= 1) strengthBar.classList.add('weak');
            else if (strength <= 2) strengthBar.classList.add('medium');
            else strengthBar.classList.add('strong');
        });
    }
}

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const icon = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// Toggle Hints
function toggleHints() {
    const hintsContent = document.getElementById('hints-content');
    if (hintsContent) hintsContent.classList.toggle('hidden');
}

// Editor Tools
function resetCode() {
    if (editor) {
        setEditorMode(languageSelect.value);
        showToast('Code reset to template', 'info');
    }
}

function copyCode() {
    if (editor) {
        navigator.clipboard.writeText(editor.getValue());
        showToast('Code copied to clipboard!', 'success');
    }
}

function toggleFullscreen() {
    const editorPage = document.getElementById('editor-page');
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else if (editorPage) {
        editorPage.requestFullscreen();
    }
}

function clearConsole() {
    consoleOutput.textContent = '// Output cleared...';
    consoleOutput.style.color = '#f1fa8c';
}

// Daily Challenge
function openDailyChallenge() {
    if (allChallenges.length > 0) {
        const dailyIndex = new Date().getDate() % allChallenges.length;
        openChallenge(allChallenges[dailyIndex].id);
    }
}

// Counter Animation
function animateCounter(element, target) {
    if (!element) return;
    const duration = 1000;
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// --- AUTHENTICATION ---

async function checkAuthState() {
    if (!token) {
        showLoggedOutUI();
        return;
    }

    try {
        const response = await fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            currentUser = await response.json();
            showLoggedInUI(currentUser);
        } else {
            logout();
        }
    } catch (error) {
        console.error('Auth state check failed:', error);
        logout();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            showLoggedInUI(currentUser);
            closeModal('login-modal');
            showToast('Welcome back, ' + currentUser.username + '! 🎉', 'success');
            fetchLeaderboard();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Login connection failed', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            showLoggedInUI(currentUser);
            closeModal('signup-modal');
            showToast('Welcome to CodeNexus, ' + currentUser.username + '! 🚀', 'success');
            triggerConfetti();
            fetchLeaderboard();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Signup connection failed', 'error');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    showLoggedOutUI();
    navigateTo('home');
    showToast('You have been logged out', 'info');
}

function showLoggedInUI(user) {
    authSection.classList.add('hidden');
    sidebarUserStats.classList.remove('hidden');

    sidebarUsername.textContent = user.username;
    sidebarAvatar.src = `https://ui-avatars.com/api/?name=${user.username}&background=random`;

    updateUserMiniStats(user);
    renderDynamicProfile(user);
    updateAchievements(user);
    
    // Re-render challenges to show solved status
    if (allChallenges.length > 0) {
        renderChallenges(allChallenges);
    }
    
    // Load user-specific dynamic data
    loadFriends();
    loadStreak();
    loadNotifications();
    loadSettings();
    loadBattleHistory();
    generateHeatMap();
    loadSkillTree();
}

function showLoggedOutUI() {
    authSection.classList.remove('hidden');
    sidebarUserStats.classList.add('hidden');
    if (profileLoggedIn) profileLoggedIn.classList.add('hidden');
    if (profileLoggedOut) profileLoggedOut.classList.remove('hidden');
}

function updateUserMiniStats(user) {
    if (sidebarLevel) sidebarLevel.textContent = `Lvl ${user.level}`;
    const xpInLevel = user.xp % 500;
    const progress = (xpInLevel / 500) * 100;
    if (sidebarXpText) sidebarXpText.textContent = `${xpInLevel} / 500 XP`;
    if (sidebarXpFill) sidebarXpFill.style.width = `${progress}%`;
}

function renderDynamicProfile(user) {
    if (!profileLoggedIn) return;

    profileLoggedIn.classList.remove('hidden');
    if (profileLoggedOut) profileLoggedOut.classList.add('hidden');

    if (profileUsername) profileUsername.textContent = user.username;
    if (profileEmail) profileEmail.textContent = user.email;
    if (profileImg) profileImg.src = `https://ui-avatars.com/api/?name=${user.username}&background=random&size=128`;

    // Animate counters
    const solvedCount = user.solvedChallenges ? user.solvedChallenges.length : 0;
    animateCounter(profileSolvedCount, solvedCount);
    animateCounter(profileXp, user.xp);
    if (profileLevel) profileLevel.textContent = user.level;

    const xpInLevel = user.xp % 500;
    const progress = (xpInLevel / 500) * 100;
    if (profileXpBar) profileXpBar.style.width = `${progress}%`;
    if (profileXpProgressText) profileXpProgressText.textContent = `Next Level: ${xpInLevel}/500 XP`;

    if (user.joinedAt && profileJoinedDate) {
        const date = new Date(user.joinedAt);
        profileJoinedDate.textContent = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    updateProfileBadges(user);
}

function updateProfileBadges(user) {
    const badgesContainer = document.getElementById('profile-badges');
    if (!badgesContainer) return;
    
    let badges = [];
    if (user.level >= 1) badges.push({ icon: 'fa-seedling', name: 'Newcomer' });
    if (user.level >= 5) badges.push({ icon: 'fa-fire', name: 'On Fire' });
    if (user.level >= 10) badges.push({ icon: 'fa-star', name: 'Rising Star' });
    if (user.xp >= 1000) badges.push({ icon: 'fa-crown', name: 'XP Master' });

    badgesContainer.innerHTML = badges.map(b => 
        `<span class="badge animated-badge"><i class="fa-solid ${b.icon}"></i> ${b.name}</span>`
    ).join('');
}

function updateAchievements(user) {
    const achievements = document.querySelectorAll('.achievement');
    const solvedCount = user.solvedChallenges ? user.solvedChallenges.length : 0;

    achievements.forEach(ach => {
        const tooltip = ach.dataset.tooltip || '';
        let unlocked = false;

        if (tooltip.includes('first challenge') && solvedCount >= 1) unlocked = true;
        if (tooltip.includes('Level 5') && user.level >= 5) unlocked = true;
        if (tooltip.includes('10 challenges') && solvedCount >= 10) unlocked = true;
        if (tooltip.includes('1000 XP') && user.xp >= 1000) unlocked = true;

        if (unlocked) {
            ach.classList.remove('locked');
            ach.classList.add('unlocked');
        }
    });
}

// --- CORE FUNCTIONALITY ---

async function fetchLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const leaderboardData = await response.json();
        renderLeaderboard(leaderboardData);
        updateLeaderboardStats(leaderboardData);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

function updateLeaderboardStats(data) {
    const totalUsers = document.getElementById('total-users');
    const totalSolved = document.getElementById('total-solved');
    
    if (totalUsers) animateCounter(totalUsers, data.length);
    if (totalSolved) {
        const solved = data.reduce((acc, u) => acc + (u.solvedChallenges ? u.solvedChallenges.length : 0), 0);
        animateCounter(totalSolved, solved);
    }
}

function renderLeaderboard(data) {
    const lbBody = document.getElementById('leaderboard-body');
    const topThree = document.getElementById('top-three');
    if (!lbBody) return;

    if (data.length === 0) {
        lbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No records found yet. Be the first!</td></tr>';
        if (topThree) topThree.innerHTML = '';
        return;
    }

    // Render Top 3 Podium
    if (topThree && data.length >= 1) {
        const podiumHTML = data.slice(0, 3).map((u, i) => {
            const positions = ['first', 'second', 'third'];
            return `
                <div class="podium-item ${positions[i]}">
                    <img class="podium-avatar" src="https://ui-avatars.com/api/?name=${u.username}&background=random&size=100" alt="${u.username}">
                    <div class="podium-name">${u.username}</div>
                    <div class="podium-xp">${u.xp.toLocaleString()} XP</div>
                    <div class="podium-rank">${i + 1}</div>
                </div>
            `;
        }).join('');
        topThree.innerHTML = podiumHTML;
    }

    // Render Table (skip first 3 for table if showing podium)
    const tableData = topThree && data.length > 3 ? data.slice(3) : data;
    const startRank = topThree && data.length > 3 ? 4 : 1;

    lbBody.innerHTML = tableData.map((u, index) => {
        const rank = startRank + index;
        if (currentUser && u.username === currentUser.username && profileRank) {
            profileRank.textContent = `#${rank}`;
        }

        return `
            <tr class="${currentUser && u.username === currentUser.username ? 'me' : ''}">
                <td class="rank-cell">#${rank}</td>
                <td>
                    <div class="user-cell">
                        <img src="https://ui-avatars.com/api/?name=${u.username}&background=random" alt="${u.username}">
                        ${u.username}
                        ${currentUser && u.username === currentUser.username ? '<span class="you-badge">You</span>' : ''}
                    </div>
                </td>
                <td>Lvl ${u.level}</td>
                <td class="xp-cell">${u.xp.toLocaleString()} XP</td>
                <td>${u.solvedChallenges ? u.solvedChallenges.length : 0}</td>
            </tr>
        `;
    }).join('');
}

function initEditor() {
    const container = document.getElementById('editor-container');
    if (!container) return;

    editor = CodeMirror(container, {
        mode: 'text/x-c++src',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        value: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Solve problem here\n    return 0;\n}'
    });
}

function setEditorMode(lang) {
    let mode = 'text/x-c++src';
    let content = '';

    switch (lang) {
        case 'cpp':
            mode = 'text/x-c++src';
            content = '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}';
            break;
        case 'python':
            mode = 'python';
            content = 'import sys\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()';
            break;
        case 'java':
            mode = 'text/x-java';
            content = 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n    }\n}';
            break;
        case 'rust':
            mode = 'rust';
            content = 'fn main() {\n    println!("Hello");\n}';
            break;
        case 'c':
            mode = 'text/x-csrc';
            content = '#include <stdio.h>\n\nint main() {\n    return 0;\n}';
            break;
    }

    editor.setOption('mode', mode);
    editor.setValue(content);
}

// Navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const pageId = link.getAttribute('data-page');
            if (pageId) navigateTo(pageId);
        });
    });
}

function navigateTo(pageId) {
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) link.classList.add('active');
        else link.classList.remove('active');
    });

    pages.forEach(page => page.classList.remove('active'));

    const target = document.getElementById(`${pageId}-page`);
    if (target) target.classList.add('active');

    if (pageId === 'leaderboard') fetchLeaderboard();
    if (pageId === 'profile' && currentUser) checkAuthState(); // Refresh profile stats
}

// Challenges
async function fetchChallenges() {
    try {
        const response = await fetch('/api/challenges');
        const data = await response.json();
        allChallenges = data;
        renderChallenges(data);
        
        // Update daily challenge title
        if (data.length > 0) {
            const dailyIndex = new Date().getDate() % data.length;
            const dailyTitle = document.getElementById('daily-challenge-title');
            if (dailyTitle) dailyTitle.textContent = data[dailyIndex].title;
        }
    } catch (error) {
        console.error('Error fetching challenges:', error);
    }
}

function renderChallenges(challenges) {
    const solvedChallenges = currentUser?.solvedChallenges || [];
    
    challengesList.innerHTML = challenges.map((c, index) => {
        const isSolved = solvedChallenges.includes(c.id);
        return `
        <div class="challenge-card ${isSolved ? 'solved' : ''}" onclick="openChallenge(${c.id})" style="animation-delay: ${index * 0.1}s">
            <div class="card-header">
                <span class="difficulty ${c.difficulty.toLowerCase()}">${c.difficulty}</span>
                <span class="points">${c.points} XP</span>
            </div>
            <h3>${c.title}</h3>
            <p>${c.description.split('\n')[0]}</p>
            <div style="margin-top: 1rem;">
                <span class="badge category-badge">${c.category}</span>
                ${isSolved ? '<span class="badge solved-badge"><i class="fa-solid fa-check"></i> Solved</span>' : ''}
            </div>
        </div>
    `}).join('');
}

async function openChallenge(id) {
    currentChallengeId = id;
    const challenge = allChallenges.find(c => c.id === id);

    if (challenge) {
        problemTitle.textContent = challenge.title;
        problemDesc.innerHTML = challenge.description.replace(/\n/g, '<br>');
        problemDifficulty.textContent = challenge.difficulty;
        problemDifficulty.className = `badge ${challenge.difficulty.toLowerCase()}`;
        problemPoints.textContent = `${challenge.points} XP`;
        if (problemCategory) problemCategory.textContent = challenge.category;
        navigateTo('editor');

        // Refresh editor to recalculate layout and prevent line overlap
        if (editor) {
            setTimeout(() => editor.refresh(), 100);
        }
    }
}

// Execution
async function runCode() {
    if (!currentChallengeId) return;

    const code = editor.getValue();
    const language = languageSelect.value;

    consoleOutput.textContent = '⏳ Executing tests on server...';
    consoleOutput.style.color = '#f1fa8c';

    // Add loading animation
    const runBtn = document.querySelector('.run-btn');
    const submitBtn = document.querySelector('.submit-btn');
    if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running...';
    }
    if (submitBtn) submitBtn.disabled = true;

    try {
        const oldLevel = currentUser?.level || 1;
        
        const response = await fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                language,
                challengeId: currentChallengeId,
                token: token
            })
        });

        const result = await response.json();
        consoleOutput.textContent = result.output;
        consoleOutput.style.color = result.status === 'success' ? '#50fa7b' : '#ff5555';

        if (result.status === 'success') {
            showXpPopup(result.points || 50);
            triggerConfetti();
            showToast('Challenge completed! 🎉', 'success');
            
            if (token) {
                await checkAuthState();
                
                // Check for level up
                if (currentUser && currentUser.level > oldLevel) {
                    setTimeout(() => showLevelUp(currentUser.level), 1500);
                }
            }
        }

    } catch (error) {
        consoleOutput.textContent = '❌ Connection error.';
        consoleOutput.style.color = '#ff5555';
    } finally {
        if (runBtn) {
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="fa-solid fa-play"></i> Run Code';
        }
        if (submitBtn) submitBtn.disabled = false;
    }
}

// --- UTILS ---

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

function switchModal(oldId, newId) {
    closeModal(oldId);
    openModal(newId);
}

function showAlert(msg, type) {
    showToast(msg, type);
}

// ==================== NEW FEATURES ====================

// Bookmarks Management
let bookmarkedChallenges = JSON.parse(localStorage.getItem('bookmarks') || '[]');

function toggleBookmark() {
    if (!currentChallengeId) return;
    
    const btn = document.getElementById('bookmark-btn');
    const icon = btn.querySelector('i');
    
    if (bookmarkedChallenges.includes(currentChallengeId)) {
        bookmarkedChallenges = bookmarkedChallenges.filter(id => id !== currentChallengeId);
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        btn.classList.remove('bookmarked');
        showToast('Removed from bookmarks', 'info');
    } else {
        bookmarkedChallenges.push(currentChallengeId);
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        btn.classList.add('bookmarked');
        showToast('Added to bookmarks!', 'success');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarkedChallenges));
    updateBookmarksList();
}

function updateBookmarksList() {
    const list = document.getElementById('bookmarks-list');
    if (!list) return;
    
    if (bookmarkedChallenges.length === 0) {
        list.innerHTML = '<p class="empty-state">No bookmarked challenges yet</p>';
        return;
    }
    
    const bookmarkedItems = allChallenges.filter(c => bookmarkedChallenges.includes(c.id));
    list.innerHTML = bookmarkedItems.map(c => `
        <div class="bookmark-item" onclick="openChallenge(${c.id})">
            <span class="challenge-name">${c.title}</span>
            <span class="badge ${c.difficulty.toLowerCase()}">${c.difficulty}</span>
        </div>
    `).join('');
}

// Notes Sidebar
function toggleNotes() {
    const sidebar = document.getElementById('notes-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        loadNotes();
    }
}

function closeNotes() {
    const sidebar = document.getElementById('notes-sidebar');
    if (sidebar) sidebar.classList.remove('open');
}

function loadNotes() {
    const textarea = document.getElementById('challenge-notes');
    if (textarea && currentChallengeId) {
        const notes = localStorage.getItem(`notes_${currentChallengeId}`) || '';
        textarea.value = notes;
    }
}

function saveNotes() {
    const textarea = document.getElementById('challenge-notes');
    if (textarea && currentChallengeId) {
        localStorage.setItem(`notes_${currentChallengeId}`, textarea.value);
        showToast('Notes saved!', 'success');
    }
}

// Discussions
function openDiscussions() {
    if (!currentChallengeId) return;
    openModal('discussion-modal');
    loadDiscussions();
}

async function loadDiscussions() {
    const list = document.getElementById('discussion-list');
    if (!list) return;
    
    list.innerHTML = '<p class="empty-state">Loading discussions...</p>';
    
    try {
        const response = await fetch(`/api/challenges/${currentChallengeId}/discussions`);
        const discussions = await response.json();
        
        if (discussions.length === 0) {
            list.innerHTML = '<p class="empty-state">No discussions yet. Start the conversation!</p>';
            return;
        }
        
        list.innerHTML = discussions.map(d => `
            <div class="discussion-item">
                <div class="discussion-header">
                    <img src="https://ui-avatars.com/api/?name=${d.username}&background=random" alt="${d.username}">
                    <div>
                        <span class="discussion-author">${d.username}</span>
                        <span class="discussion-time">${formatTime(d.created_at)}</span>
                    </div>
                </div>
                <div class="discussion-text">${d.content}</div>
                <div class="discussion-actions">
                    <button class="discussion-action" onclick="likeDiscussion(${d.id})">
                        <i class="fa-solid fa-thumbs-up"></i> ${d.likes || 0}
                    </button>
                    <button class="discussion-action">
                        <i class="fa-solid fa-reply"></i> Reply
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p class="empty-state">Failed to load discussions</p>';
    }
}

async function postDiscussion() {
    const textarea = document.getElementById('new-discussion-text');
    if (!textarea || !textarea.value.trim()) return;
    
    if (!token) {
        showToast('Please login to post', 'error');
        return;
    }
    
    try {
        await fetch(`/api/challenges/${currentChallengeId}/discussions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: textarea.value })
        });
        
        textarea.value = '';
        loadDiscussions();
        showToast('Posted successfully!', 'success');
    } catch (error) {
        showToast('Failed to post', 'error');
    }
}

async function likeDiscussion(id) {
    if (!token) {
        showToast('Please login to like', 'error');
        return;
    }
    
    try {
        await fetch(`/api/discussions/${id}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadDiscussions();
    } catch (error) {
        showToast('Failed to like', 'error');
    }
}

// Solutions
function openSolutions() {
    if (!currentChallengeId) return;
    openModal('solutions-modal');
    loadSolutions();
}

async function loadSolutions() {
    const list = document.getElementById('solutions-list');
    if (!list) return;
    
    list.innerHTML = '<p class="empty-state">Loading solutions...</p>';
    
    try {
        const response = await fetch(`/api/challenges/${currentChallengeId}/solutions`);
        const solutions = await response.json();
        
        if (solutions.length === 0) {
            list.innerHTML = '<p class="empty-state">No solutions shared yet</p>';
            return;
        }
        
        list.innerHTML = solutions.map(s => `
            <div class="solution-item">
                <div class="solution-header">
                    <div class="solution-author">
                        <img src="https://ui-avatars.com/api/?name=${s.username}&background=random" alt="${s.username}">
                        <span>${s.username}</span>
                    </div>
                    <span class="solution-lang">${s.language}</span>
                </div>
                <div class="solution-code">
                    <pre>${escapeHtml(s.code.substring(0, 500))}${s.code.length > 500 ? '...' : ''}</pre>
                </div>
                <div class="solution-stats">
                    <span><i class="fa-solid fa-thumbs-up"></i> ${s.likes || 0}</span>
                    <span><i class="fa-solid fa-clock"></i> ${formatTime(s.created_at)}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p class="empty-state">Failed to load solutions</p>';
    }
}

// Hints System
let unlockedHints = JSON.parse(localStorage.getItem('unlockedHints') || '{}');

async function unlockHint(hintNumber) {
    if (!currentChallengeId) return;
    
    const hintKey = `${currentChallengeId}_${hintNumber}`;
    if (unlockedHints[hintKey]) {
        showToast('Hint already unlocked', 'info');
        return;
    }
    
    const xpCost = [10, 15, 20][hintNumber - 1];
    
    if (!token) {
        showToast('Please login to unlock hints', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/challenges/${currentChallengeId}/hints/${hintNumber}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            unlockedHints[hintKey] = data.hint;
            localStorage.setItem('unlockedHints', JSON.stringify(unlockedHints));
            
            // Update UI
            const hintItem = document.querySelectorAll('.hint-item')[hintNumber - 1];
            if (hintItem) {
                hintItem.classList.remove('locked');
                hintItem.classList.add('unlocked');
                hintItem.querySelector('.hint-text').textContent = data.hint;
                hintItem.querySelector('i').style.display = 'none';
            }
            
            showToast(`Hint unlocked! -${xpCost} XP`, 'success');
            checkAuthState(); // Refresh user XP
        } else {
            showToast(data.error || 'Failed to unlock hint', 'error');
        }
    } catch (error) {
        showToast('Failed to unlock hint', 'error');
    }
}

// Code Templates
let codeTemplates = JSON.parse(localStorage.getItem('codeTemplates') || '[]');

function loadTemplate() {
    openModal('template-modal');
    renderTemplates();
}

function renderTemplates() {
    const list = document.getElementById('templates-list');
    if (!list) return;
    
    if (codeTemplates.length === 0) {
        list.innerHTML = '<p class="empty-state">No templates saved yet</p>';
        return;
    }
    
    list.innerHTML = codeTemplates.map((t, i) => `
        <div class="template-item" onclick="useTemplate(${i})">
            <span class="template-name">${t.name}</span>
            <span class="badge">${t.language}</span>
            <button class="delete-template" onclick="event.stopPropagation(); deleteTemplate(${i})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function useTemplate(index) {
    const template = codeTemplates[index];
    if (template && editor) {
        languageSelect.value = template.language;
        setEditorMode(template.language);
        editor.setValue(template.code);
        closeModal('template-modal');
        showToast('Template loaded!', 'success');
    }
}

function saveTemplate() {
    if (!editor) return;
    
    const name = prompt('Enter template name:');
    if (!name) return;
    
    codeTemplates.push({
        name,
        language: languageSelect.value,
        code: editor.getValue()
    });
    
    localStorage.setItem('codeTemplates', JSON.stringify(codeTemplates));
    showToast('Template saved!', 'success');
}

function deleteTemplate(index) {
    codeTemplates.splice(index, 1);
    localStorage.setItem('codeTemplates', JSON.stringify(codeTemplates));
    renderTemplates();
    showToast('Template deleted', 'info');
}

// Challenge Mode (Timed / Normal)
let currentMode = 'normal';
let timerInterval = null;
let timeRemaining = 0;

function setMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (mode === 'timed') {
        showToast('Timed mode enabled! 10 minutes per challenge', 'info');
    } else {
        stopTimer();
    }
}

function startTimer(minutes = 10) {
    const timerDisplay = document.getElementById('challenge-timer');
    if (!timerDisplay) return;
    
    timerDisplay.classList.remove('hidden');
    timeRemaining = minutes * 60;
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        document.getElementById('timer-value').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (timeRemaining <= 60) {
            timerDisplay.classList.add('warning');
        }
        
        if (timeRemaining <= 0) {
            stopTimer();
            showToast('Time\'s up!', 'error');
            // Could auto-submit here
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const timerDisplay = document.getElementById('challenge-timer');
    if (timerDisplay) {
        timerDisplay.classList.add('hidden');
        timerDisplay.classList.remove('warning');
    }
}

// Random Challenge
function randomChallenge() {
    if (allChallenges.length === 0) {
        showToast('No challenges available', 'error');
        return;
    }
    
    // Filter by current difficulty filter if active
    let pool = allChallenges;
    if (currentFilter !== 'all') {
        pool = allChallenges.filter(c => c.difficulty.toLowerCase() === currentFilter);
    }
    
    // Exclude already solved challenges if user is logged in
    if (currentUser?.solvedChallenges) {
        pool = pool.filter(c => !currentUser.solvedChallenges.includes(c.id));
    }
    
    if (pool.length === 0) {
        showToast('No unsolved challenges in this category!', 'info');
        pool = allChallenges;
    }
    
    const random = pool[Math.floor(Math.random() * pool.length)];
    showToast(`Random: ${random.title}`, 'info');
    openChallenge(random.id);
}

// Enhanced Filter System
function filterChallenges() {
    const searchInput = document.getElementById('challenge-search');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : 'all';
    const status = statusFilter ? statusFilter.value : 'all';
    
    const filtered = allChallenges.filter(c => {
        const matchesFilter = currentFilter === 'all' || c.difficulty.toLowerCase() === currentFilter;
        const matchesSearch = c.title.toLowerCase().includes(searchTerm) || 
                             c.category.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || c.category === category;
        
        let matchesStatus = true;
        if (status === 'solved' && currentUser) {
            matchesStatus = currentUser.solvedChallenges?.includes(c.id);
        } else if (status === 'unsolved' && currentUser) {
            matchesStatus = !currentUser.solvedChallenges?.includes(c.id);
        } else if (status === 'bookmarked') {
            matchesStatus = bookmarkedChallenges.includes(c.id);
        }
        
        return matchesFilter && matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderChallenges(filtered);
    
    // Update stats
    const solvedCountEl = document.getElementById('solved-count');
    const totalChallengesEl = document.getElementById('total-challenges');
    const completionRateEl = document.getElementById('completion-rate');
    
    if (solvedCountEl && currentUser) {
        solvedCountEl.textContent = currentUser.solvedChallenges?.length || 0;
    }
    if (totalChallengesEl) {
        totalChallengesEl.textContent = allChallenges.length;
    }
    if (completionRateEl && currentUser) {
        const rate = allChallenges.length > 0 
            ? Math.round((currentUser.solvedChallenges?.length || 0) / allChallenges.length * 100) 
            : 0;
        completionRateEl.textContent = `${rate}%`;
    }
}

// Battle Mode
let battleState = 'idle'; // idle, queued, active
let battleDifficulty = 'easy';
let queueStartTime = null;
let queueTimer = null;
let currentBattle = null;
let battlePollInterval = null;
let battleEditor = null;

async function joinBattleQueue() {
    if (!token) {
        showToast('Please login to battle', 'error');
        return;
    }
    
    // Get selected difficulty
    const activeBtn = document.querySelector('.diff-btn.active');
    battleDifficulty = activeBtn ? activeBtn.dataset.diff : 'easy';
    
    showBattleWaiting();
    
    // Start queue timer
    queueStartTime = Date.now();
    queueTimer = setInterval(updateQueueTime, 1000);
    
    try {
        const response = await fetch('/api/battles/queue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ difficulty: battleDifficulty })
        });
        
        const data = await response.json();
        
        if (data.status === 'matched') {
            // Match found immediately!
            clearInterval(queueTimer);
            showToast('Opponent found! 🎮', 'success');
            currentBattle = data.battle;
            startBattle(data.battle);
        } else if (data.status === 'queued' || data.status === 'already_queued') {
            // Waiting for opponent, start polling
            showToast('Searching for opponent...', 'info');
            startBattlePolling();
        }
    } catch (err) {
        console.error('Queue error:', err);
        showToast('Failed to join queue', 'error');
        showBattleQueue();
    }
}

function startBattlePolling() {
    battlePollInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/battles/active', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const battle = await response.json();
            
            if (battle && battle.id) {
                clearInterval(battlePollInterval);
                clearInterval(queueTimer);
                showToast('Opponent found! Battle starting! 🎮', 'success');
                currentBattle = battle;
                startBattle(battle);
            }
        } catch (err) {
            console.error('Poll error:', err);
        }
    }, 2000); // Poll every 2 seconds
}

async function leaveBattleQueue() {
    clearInterval(queueTimer);
    clearInterval(battlePollInterval);
    
    try {
        await fetch('/api/battles/queue', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (err) {
        console.error('Leave queue error:', err);
    }
    
    showBattleQueue();
    showToast('Left queue', 'info');
}

function showBattleQueue() {
    document.getElementById('battle-queue-section')?.classList.remove('hidden');
    document.getElementById('battle-waiting')?.classList.add('hidden');
    document.getElementById('battle-active')?.classList.add('hidden');
    battleState = 'idle';
}

function showBattleWaiting() {
    document.getElementById('battle-queue-section')?.classList.add('hidden');
    document.getElementById('battle-waiting')?.classList.remove('hidden');
    document.getElementById('battle-active')?.classList.add('hidden');
    battleState = 'queued';
}

function updateQueueTime() {
    const elapsed = Math.floor((Date.now() - queueStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeEl = document.getElementById('queue-time');
    if (timeEl) {
        timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

async function startBattle(battle) {
    battleState = 'active';
    document.getElementById('battle-queue-section')?.classList.add('hidden');
    document.getElementById('battle-waiting')?.classList.add('hidden');
    document.getElementById('battle-active')?.classList.remove('hidden');
    
    // Set battle problem
    const challenge = battle.challenges || battle;
    document.getElementById('battle-problem-title').textContent = challenge.title;
    document.getElementById('battle-problem-desc').textContent = challenge.description;
    
    // Initialize battle editor
    const battleEditorEl = document.getElementById('battle-editor');
    if (battleEditorEl && !battleEditor) {
        battleEditor = CodeMirror.fromTextArea(battleEditorEl, {
            mode: 'javascript',
            theme: 'material-darker',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false
        });
    }
    
    // Start battle timer
    const startTime = new Date(battle.started_at).getTime();
    updateBattleTimer(startTime);
    
    // Poll for battle updates (opponent submission)
    pollBattleStatus(battle.id);
}

function updateBattleTimer(startTime) {
    const timerEl = document.getElementById('battle-timer');
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        if (timerEl) {
            timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function pollBattleStatus(battleId) {
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/battles/active', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const battle = await response.json();
            
            if (!battle || battle.status === 'completed') {
                clearInterval(pollInterval);
                if (battle) {
                    endBattle(battle);
                }
            }
        } catch (err) {
            console.error('Battle poll error:', err);
        }
    }, 3000);
}

async function submitBattleSolution() {
    if (!currentBattle || !battleEditor) return;
    
    const code = battleEditor.getValue();
    const language = document.getElementById('battle-language')?.value || 'javascript';
    
    showToast('Submitting solution...', 'info');
    
    try {
        const response = await fetch(`/api/battles/${currentBattle.id}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code, language })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            if (result.battleComplete) {
                if (result.won) {
                    showToast('🏆 You won the battle!', 'success');
                    triggerConfetti();
                } else {
                    showToast('Battle complete! Better luck next time!', 'info');
                }
                endBattle(result);
            } else {
                showToast(`Solution accepted in ${result.time}s! Waiting for opponent...`, 'success');
            }
        } else {
            showToast('Tests failed. Try again!', 'error');
        }
    } catch (err) {
        console.error('Submit error:', err);
        showToast('Failed to submit', 'error');
    }
}

function endBattle(result) {
    battleState = 'idle';
    currentBattle = null;
    
    // Show results modal or return to queue
    setTimeout(() => {
        showBattleQueue();
        loadBattleHistory();
    }, 3000);
}

async function loadBattleHistory() {
    if (!token) return;
    
    try {
        const response = await fetch('/api/battles/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const battles = await response.json();
        
        const container = document.getElementById('battle-history');
        if (!container) return;
        
        container.innerHTML = battles.map(b => `
            <div class="battle-history-item ${b.winner_id === currentUser?.id ? 'won' : 'lost'}">
                <span class="battle-result">${b.winner_id === currentUser?.id ? '🏆 Won' : '❌ Lost'}</span>
                <span class="battle-challenge">${b.challenges?.title || 'Challenge'}</span>
                <span class="battle-date">${formatTime(b.ended_at)}</span>
            </div>
        `).join('') || '<p>No battles yet</p>';
    } catch (err) {
        console.error('History error:', err);
    }
}

// Settings
let userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');

function openSettingsTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tabName}-settings`).classList.add('active');
}

function setTheme(theme) {
    document.querySelectorAll('.theme-option').forEach(t => t.classList.remove('active'));
    event.target.closest('.theme-option').classList.add('active');
    
    userSettings.theme = theme;
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
    // Apply theme (could change CSS variables here)
    showToast(`Theme changed to ${theme}`, 'success');
}

// Heat Map Generation (Dynamic)
async function generateHeatMap() {
    const container = document.getElementById('heatmap');
    if (!container) return;
    
    container.innerHTML = '';
    
    let activityData = {};
    
    // Fetch real activity data if logged in
    if (token) {
        try {
            const response = await fetch('/api/activity/heatmap', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            activityData = data.reduce((acc, d) => {
                const dateStr = new Date(d.date).toISOString().split('T')[0];
                acc[dateStr] = d.count;
                return acc;
            }, {});
        } catch (err) {
            console.error('Heatmap error:', err);
        }
    }
    
    // Generate 365 days
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get activity level from data or default to 0
        const count = activityData[dateStr] || 0;
        const activity = Math.min(count, 4); // Max level 4
        
        const day = document.createElement('div');
        day.className = `heatmap-day l${activity}`;
        day.title = `${date.toDateString()}: ${count} activities`;
        container.appendChild(day);
    }
}

// Update stats charts
function updateStatsCharts() {
    if (!currentUser) return;
    
    // Difficulty chart
    const totalSolved = currentUser.solvedChallenges?.length || 0;
    const easyCount = document.getElementById('easy-count');
    const mediumCount = document.getElementById('medium-count');
    const hardCount = document.getElementById('hard-count');
    const totalChart = document.getElementById('total-solved-chart');
    
    // These would come from actual data
    const easy = Math.floor(totalSolved * 0.6);
    const medium = Math.floor(totalSolved * 0.3);
    const hard = totalSolved - easy - medium;
    
    if (easyCount) easyCount.textContent = easy;
    if (mediumCount) mediumCount.textContent = medium;
    if (hardCount) hardCount.textContent = hard;
    if (totalChart) totalChart.textContent = totalSolved;
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Only when not typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    // Ctrl/Cmd + Enter = Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
    
    // Ctrl/Cmd + S = Save (prevent default, could save template)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showToast('Auto-saved!', 'info');
    }
    
    // Escape = Close modal
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        closeNotes();
    }
    
    // ? = Show shortcuts
    if (e.key === '?') {
        const panel = document.querySelector('.shortcuts-panel');
        if (panel) panel.classList.toggle('visible');
    }
});

// Console Tabs
function setupConsoleTabs() {
    document.querySelectorAll('.console-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.console-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.dataset.tab;
            document.getElementById('console-output-tab').classList.toggle('hidden', tabName !== 'output');
            document.getElementById('console-testcases-tab').classList.toggle('hidden', tabName !== 'testcases');
        });
    });
}

// Submit Code (separate from run)
async function submitCode() {
    if (currentMode === 'timed') {
        stopTimer();
    }
    
    // Could add solution sharing option here
    await runCode();
}

// Edit Profile
function editProfile() {
    openModal('edit-profile-modal');
}

// Friends System (Dynamic)
async function searchFriends() {
    const input = document.getElementById('friend-search-input');
    if (!input || !input.value.trim()) return;
    
    const query = input.value.trim();
    
    try {
        const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        
        const resultsContainer = document.getElementById('friend-search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = users.map(u => `
                <div class="friend-result">
                    <img src="https://ui-avatars.com/api/?name=${u.username}&background=random" alt="${u.username}">
                    <span>${u.username}</span>
                    <span class="level-badge">Lvl ${u.level}</span>
                    <button onclick="addFriend('${u.id}')" class="btn-small">Add</button>
                </div>
            `).join('') || '<p>No users found</p>';
        }
    } catch (err) {
        console.error('Search error:', err);
        showToast('Search failed', 'error');
    }
}

async function addFriend(userId) {
    if (!token) {
        showToast('Please login', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/friends/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ friendId: userId })
        });
        
        const data = await response.json();
        if (response.ok) {
            showToast('Friend request sent!', 'success');
        } else {
            showToast(data.error || 'Failed to send request', 'error');
        }
    } catch (err) {
        showToast('Failed to send friend request', 'error');
    }
}

async function loadFriends() {
    if (!token) return;
    
    try {
        const response = await fetch('/api/friends', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const friends = await response.json();
        
        const container = document.getElementById('friends-list');
        if (container) {
            container.innerHTML = friends.map(f => `
                <div class="friend-item">
                    <img src="https://ui-avatars.com/api/?name=${f.username}&background=random" alt="${f.username}">
                    <div class="friend-info">
                        <span class="friend-name">${f.username}</span>
                        <span class="friend-level">Level ${f.level} · ${f.xp} XP</span>
                    </div>
                    <span class="friend-status ${f.online ? 'online' : 'offline'}"></span>
                </div>
            `).join('') || '<p class="empty-state">No friends yet. Search to add some!</p>';
        }
        
        // Load friend requests
        loadFriendRequests();
    } catch (err) {
        console.error('Load friends error:', err);
    }
}

async function loadFriendRequests() {
    try {
        const response = await fetch('/api/friends/requests', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const requests = await response.json();
        
        const container = document.getElementById('friend-requests');
        if (container && requests.length > 0) {
            container.innerHTML = `
                <h4>Friend Requests (${requests.length})</h4>
                ${requests.map(r => `
                    <div class="friend-request">
                        <img src="https://ui-avatars.com/api/?name=${r.username}&background=random">
                        <span>${r.username}</span>
                        <button onclick="acceptFriendRequest('${r.id}')" class="btn-accept">Accept</button>
                        <button onclick="rejectFriendRequest('${r.id}')" class="btn-reject">Reject</button>
                    </div>
                `).join('')}
            `;
        }
    } catch (err) {
        console.error('Load requests error:', err);
    }
}

async function acceptFriendRequest(requestId) {
    try {
        await fetch(`/api/friends/accept/${requestId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        showToast('Friend added!', 'success');
        loadFriends();
    } catch (err) {
        showToast('Failed to accept', 'error');
    }
}

async function rejectFriendRequest(requestId) {
    try {
        await fetch(`/api/friends/reject/${requestId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadFriendRequests();
    } catch (err) {
        showToast('Failed to reject', 'error');
    }
}

// Tournament Functions (Dynamic)
async function loadTournaments() {
    try {
        const response = await fetch('/api/tournaments');
        const tournaments = await response.json();
        
        const container = document.getElementById('tournaments-list');
        if (container) {
            container.innerHTML = tournaments.map(t => `
                <div class="tournament-card ${t.status}">
                    <div class="tournament-header">
                        <h3>${t.name}</h3>
                        <span class="tournament-status ${t.status}">${t.status}</span>
                    </div>
                    <div class="tournament-info">
                        <span><i class="fa-solid fa-users"></i> ${t.participants || 0} / ${t.max_participants} players</span>
                        <span><i class="fa-solid fa-trophy"></i> ${t.prize_description || 'Prizes'}</span>
                        <span><i class="fa-solid fa-calendar"></i> ${new Date(t.start_time).toLocaleDateString()}</span>
                    </div>
                    ${t.status === 'upcoming' ? 
                        `<button onclick="joinTournament('${t.id}')" class="btn-tournament-join">Join Tournament</button>` : 
                        `<button class="btn-tournament-view">View Details</button>`
                    }
                </div>
            `).join('') || '<p class="empty-state">No tournaments available</p>';
        }
    } catch (err) {
        console.error('Load tournaments error:', err);
    }
}

async function joinTournament(tournamentId) {
    if (!token) {
        showToast('Please login to join tournaments', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (response.ok) {
            showToast('Joined tournament! Good luck! 🏆', 'success');
            triggerConfetti();
            loadTournaments();
        } else {
            showToast(data.error || 'Failed to join', 'error');
        }
    } catch (err) {
        showToast('Failed to join tournament', 'error');
    }
}

// Learning Paths (Dynamic)
async function loadLearningPaths() {
    try {
        const response = await fetch('/api/learn/paths');
        const paths = await response.json();
        
        const container = document.getElementById('learning-paths-list');
        if (container) {
            container.innerHTML = paths.map(p => `
                <div class="learning-path-card">
                    <div class="path-icon"><i class="fa-solid ${p.icon || 'fa-road'}"></i></div>
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <div class="path-stats">
                        <span>${p.challenge_count || 0} challenges</span>
                        <span>${p.estimated_hours || 0}h estimated</span>
                    </div>
                    <div class="path-progress">
                        <div class="path-progress-bar" style="width: ${p.progress || 0}%"></div>
                    </div>
                    <button onclick="startLearningPath('${p.id}')" class="btn-start-path">
                        ${p.progress > 0 ? 'Continue' : 'Start'} Path
                    </button>
                </div>
            `).join('') || '<p class="empty-state">No learning paths available</p>';
        }
    } catch (err) {
        console.error('Load paths error:', err);
    }
}

async function startLearningPath(pathId) {
    if (!token) {
        showToast('Please login to start learning paths', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/learn/paths/${pathId}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        showToast('Starting learning path...', 'info');
        
        // Navigate to challenges page filtered by this path
        navigateTo('challenges');
        
        // Filter challenges for this path
        if (data.challengeIds && data.challengeIds.length > 0) {
            const filtered = allChallenges.filter(c => data.challengeIds.includes(c.id));
            renderChallenges(filtered);
        }
    } catch (err) {
        showToast('Failed to start path', 'error');
    }
}

// Skill Tree (Dynamic)
async function loadSkillTree() {
    try {
        const response = await fetch('/api/skills/tree', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const skills = await response.json();
        
        const container = document.getElementById('skill-tree-container');
        if (container) {
            // Group by category
            const categories = {};
            skills.forEach(s => {
                if (!categories[s.category]) categories[s.category] = [];
                categories[s.category].push(s);
            });
            
            container.innerHTML = Object.entries(categories).map(([cat, skillList]) => `
                <div class="skill-category">
                    <h3>${cat}</h3>
                    <div class="skills-grid">
                        ${skillList.map(s => `
                            <div class="skill-node ${s.unlocked ? 'unlocked' : 'locked'}" 
                                 data-skill="${s.id}"
                                 title="${s.description}">
                                <i class="fa-solid ${s.icon || 'fa-star'}"></i>
                                <span>${s.name}</span>
                                <span class="skill-level">Lvl ${s.level || 0}/${s.max_level || 5}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Load skills error:', err);
    }
}

// Streak System (Dynamic)
async function loadStreak() {
    if (!token) return;
    
    try {
        const response = await fetch('/api/streak', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const streakEl = document.getElementById('streak-count');
        const streakFireEl = document.getElementById('streak-fire');
        
        if (streakEl) {
            streakEl.textContent = data.current_streak || 0;
            if (data.current_streak >= 7) {
                streakFireEl?.classList.add('on-fire');
            }
        }
        
        // Update streak display in profile
        const profileStreakEl = document.getElementById('profile-streak');
        if (profileStreakEl) {
            profileStreakEl.textContent = `🔥 ${data.current_streak || 0} day streak`;
        }
    } catch (err) {
        console.error('Load streak error:', err);
    }
}

// Activity Feed (Dynamic)
async function loadActivityFeed() {
    try {
        const response = await fetch('/api/activity/feed', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const activities = await response.json();
        
        const container = document.getElementById('activity-feed');
        if (container) {
            container.innerHTML = activities.map(a => `
                <div class="activity-item">
                    <img src="https://ui-avatars.com/api/?name=${a.username}&background=random" alt="${a.username}">
                    <div class="activity-content">
                        <span class="activity-user">${a.username}</span>
                        <span class="activity-action">${a.action}</span>
                        ${a.challenge_title ? `<span class="activity-challenge">${a.challenge_title}</span>` : ''}
                    </div>
                    <span class="activity-time">${formatTime(a.created_at)}</span>
                </div>
            `).join('') || '<p class="empty-state">No recent activity</p>';
        }
    } catch (err) {
        console.error('Load feed error:', err);
    }
}

// Notifications (Dynamic)
async function loadNotifications() {
    if (!token) return;
    
    try {
        const response = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const notifications = await response.json();
        
        // Update notification badge
        const badge = document.getElementById('notification-badge');
        const unreadCount = notifications.filter(n => !n.read).length;
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
        
        // Update notification list
        const container = document.getElementById('notifications-list');
        if (container) {
            container.innerHTML = notifications.map(n => `
                <div class="notification-item ${n.read ? 'read' : 'unread'}" onclick="markNotificationRead('${n.id}')">
                    <i class="fa-solid ${getNotificationIcon(n.type)}"></i>
                    <div class="notification-content">
                        <p>${n.message}</p>
                        <span class="notification-time">${formatTime(n.created_at)}</span>
                    </div>
                </div>
            `).join('') || '<p class="empty-state">No notifications</p>';
        }
    } catch (err) {
        console.error('Load notifications error:', err);
    }
}

function getNotificationIcon(type) {
    const icons = {
        'achievement': 'fa-trophy',
        'friend_request': 'fa-user-plus',
        'battle': 'fa-gamepad',
        'level_up': 'fa-arrow-up',
        'streak': 'fa-fire',
        'default': 'fa-bell'
    };
    return icons[type] || icons.default;
}

async function markNotificationRead(id) {
    try {
        await fetch(`/api/notifications/${id}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadNotifications();
    } catch (err) {
        console.error('Mark read error:', err);
    }
}

// Settings (Dynamic - save to server)
async function saveSettings() {
    const settings = {
        showHints: document.getElementById('setting-hints')?.checked,
        soundEnabled: document.getElementById('setting-sound')?.checked,
        darkMode: document.getElementById('setting-darkmode')?.checked,
        fontSize: document.getElementById('setting-fontsize')?.value,
        tabSize: document.getElementById('setting-tabsize')?.value,
        theme: userSettings.theme || 'dark'
    };
    
    // Save locally
    userSettings = { ...userSettings, ...settings };
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
    // Save to server if logged in
    if (token) {
        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
        } catch (err) {
            console.error('Save settings error:', err);
        }
    }
    
    // Apply settings
    if (editor && settings.fontSize) {
        document.querySelector('.CodeMirror').style.fontSize = settings.fontSize + 'px';
    }
    
    showToast('Settings saved!', 'success');
    closeModal('settings-modal');
}

async function loadSettings() {
    if (!token) return;
    
    try {
        const response = await fetch('/api/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const settings = await response.json();
        
        userSettings = { ...userSettings, ...settings };
        
        // Apply loaded settings to form
        if (document.getElementById('setting-hints')) {
            document.getElementById('setting-hints').checked = settings.show_hints;
        }
        if (document.getElementById('setting-sound')) {
            document.getElementById('setting-sound').checked = settings.sound_enabled;
        }
        if (document.getElementById('setting-fontsize')) {
            document.getElementById('setting-fontsize').value = settings.font_size || 14;
        }
        if (document.getElementById('setting-tabsize')) {
            document.getElementById('setting-tabsize').value = settings.tab_size || 4;
        }
    } catch (err) {
        console.error('Load settings error:', err);
    }
}

// Utility Functions
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize new features on page load
document.addEventListener('DOMContentLoaded', () => {
    // Additional initialization
    setTimeout(() => {
        generateHeatMap();
        updateBookmarksList();
        setupConsoleTabs();
        
        // Load user settings
        if (userSettings.fontSize && editor) {
            document.querySelector('.CodeMirror').style.fontSize = userSettings.fontSize + 'px';
        }
    }, 500);
});

// Update the enhanced openChallenge function
const originalOpenChallenge = openChallenge;
openChallenge = async function(id) {
    await originalOpenChallenge(id);
    
    // Update bookmark button state
    const btn = document.getElementById('bookmark-btn');
    if (btn) {
        const icon = btn.querySelector('i');
        if (bookmarkedChallenges.includes(id)) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            btn.classList.add('bookmarked');
        } else {
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            btn.classList.remove('bookmarked');
        }
    }
    
    // Load any unlocked hints
    const hints = document.querySelectorAll('.hint-item');
    hints.forEach((hint, i) => {
        const hintKey = `${id}_${i + 1}`;
        if (unlockedHints[hintKey]) {
            hint.classList.remove('locked');
            hint.classList.add('unlocked');
            hint.querySelector('.hint-text').textContent = unlockedHints[hintKey];
            const lockIcon = hint.querySelector('i');
            if (lockIcon) lockIcon.style.display = 'none';
        }
    });
    
    // Start timer if in timed mode
    if (currentMode === 'timed') {
        startTimer(10);
    }
};
