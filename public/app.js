// State Management
let currentChallengeId = null;
let editor = null;
let currentUser = null;
let token = localStorage.getItem('token');
let allChallenges = [];
let currentFilter = 'all';

// User-scoped state (initialized after auth)
let codeHistory = {};
let unlockedHints = {};

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
    initUserSearch();

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

    // Console Tabs
    const consoleTabs = document.querySelectorAll('.console-tab');
    consoleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            consoleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.tab;
            if (target === 'output') {
                document.getElementById('console-output-tab').classList.remove('hidden');
                document.getElementById('console-testcases-tab').classList.add('hidden');
            } else {
                document.getElementById('console-output-tab').classList.add('hidden');
                document.getElementById('console-testcases-tab').classList.remove('hidden');
            }
        });
    });
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
        showToast('Daily Challenge started! Complete for bonus XP! 🌟', 'info');
    }
}

// Update daily challenge display with countdown
function updateDailyChallenge() {
    if (allChallenges.length === 0) return;

    const dailyIndex = new Date().getDate() % allChallenges.length;
    const dailyChallenge = allChallenges[dailyIndex];

    const titleEl = document.getElementById('daily-challenge-title');
    if (titleEl) titleEl.textContent = dailyChallenge.title;

    // Check if already completed today
    const today = new Date().toDateString();
    const completedToday = localStorage.getItem('dailyChallengeCompleted') === today;

    const dailyBtn = document.querySelector('.daily-challenge-card .cta-btn');
    if (dailyBtn) {
        if (completedToday) {
            dailyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Completed!';
            dailyBtn.disabled = true;
            dailyBtn.style.opacity = '0.7';
        } else {
            dailyBtn.innerHTML = 'Accept Challenge <i class="fa-solid fa-arrow-right"></i>';
            dailyBtn.disabled = false;
            dailyBtn.style.opacity = '1';
        }
    }

    // Start countdown timer
    updateDailyCountdown();
}

function updateDailyCountdown() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const countdownEl = document.getElementById('daily-countdown');
    if (countdownEl) {
        countdownEl.textContent = `Resets in ${hours}h ${mins}m`;
    }

    // Update every minute
    setTimeout(updateDailyCountdown, 60000);
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
            await syncUserState();
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

            // Sync user state
            await syncUserState();

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

            // Sync user state
            await syncUserState();

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
    codeHistory = {};
    unlockedHints = {};

    localStorage.removeItem('token');

    // Reset UI
    if (editor) editor.setValue('');
    consoleOutput.textContent = 'Output will appear here...';
    document.getElementById('test-results').innerHTML = '<p class="empty-state">Run or Submit code to see results</p>';

    showLoggedOutUI();
    navigateTo('home');
    showToast('You have been logged out', 'info');
}

async function syncUserState() {
    if (!currentUser) return;

    const userId = currentUser.id;

    // Load scoped code history
    codeHistory = JSON.parse(localStorage.getItem(`codeHistory_${userId}`) || '{}');

    // Sync hints from backend
    try {
        const response = await fetch('/api/user/unlocked-hints', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const syncData = await response.json();
        // Ensure we only store booleans in memory to avoid "true" text bug
        unlockedHints = {};
        Object.keys(syncData).forEach(key => {
            unlockedHints[key] = true;
        });
        // Cache locally for this user
        localStorage.setItem(`unlockedHints_${userId}`, JSON.stringify(unlockedHints));
    } catch (error) {
        console.error('Failed to sync hints:', error);
        // Fallback to local cache if offline
        unlockedHints = JSON.parse(localStorage.getItem(`unlockedHints_${userId}`) || '{}');
    }
}

function showLoggedInUI(user) {
    authSection.classList.add('hidden');
    sidebarUserStats.classList.remove('hidden');

    sidebarUsername.textContent = user.username;
    sidebarAvatar.src = `https://ui-avatars.com/api/?name=${user.username}&background=random`;

    updateUserMiniStats(user);
    renderDynamicProfile(user);
    updateAchievements(user);
    updateStatsCharts();

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
    const topStreak = document.getElementById('top-streak');

    if (totalUsers) animateCounter(totalUsers, data.length);
    if (totalSolved) {
        const solved = data.reduce((acc, u) => acc + (u.solvedChallenges ? u.solvedChallenges.length : 0), 0);
        animateCounter(totalSolved, solved);
    }
    if (topStreak) {
        const maxStreak = data.reduce((max, u) => Math.max(max, u.streak || 0), 0);
        animateCounter(topStreak, maxStreak);
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
        lineWrapping: false,
        styleActiveLine: true,
        extraKeys: {
            'Ctrl-Space': 'autocomplete',
            'Ctrl-/': 'toggleComment',
            'Cmd-/': 'toggleComment',
            'Ctrl-D': 'deleteLine',
            'Cmd-D': 'deleteLine',
            'Ctrl-F': 'find',
            'Cmd-F': 'find',
            'Tab': function (cm) {
                if (cm.somethingSelected()) {
                    cm.indentSelection('add');
                } else {
                    cm.replaceSelection('    ', 'end');
                }
            }
        },
        value: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Solve problem here\n    return 0;\n}'
    });

    // Add custom resize handler
    editor.setSize('100%', '400px');
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

        // Update daily challenge display
        updateDailyChallenge();
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
    // Save current code to user-scoped history
    if (currentChallengeId && currentUser) {
        const code = editor.getValue();
        codeHistory[currentChallengeId] = code;
        localStorage.setItem(`codeHistory_${currentUser.id}`, JSON.stringify(codeHistory));
    }

    currentChallengeId = id;
    const challenge = allChallenges.find(c => c.id === id);

    if (challenge) {
        problemTitle.textContent = challenge.title;
        problemDesc.innerHTML = challenge.description.replace(/\n/g, '<br>');
        problemDifficulty.textContent = challenge.difficulty;
        problemDifficulty.className = `badge ${challenge.difficulty.toLowerCase()}`;
        problemPoints.textContent = `${challenge.points} XP`;
        if (problemCategory) problemCategory.textContent = challenge.category;

        // Display hints for this challenge
        displayHints(challenge);

        // Reset output section
        if (consoleOutput) {
            consoleOutput.textContent = '// Output will appear here...';
            consoleOutput.style.color = 'var(--text-secondary)';
        }
        const testResultsContainer = document.getElementById('test-results');
        if (testResultsContainer) testResultsContainer.innerHTML = '';

        // Reset to Output tab by default
        const outputTab = document.querySelector('[data-tab="output"]');
        if (outputTab) outputTab.click();

        navigateTo('editor');

        // Load saved code or default template
        if (editor) {
            const savedCode = codeHistory[id];
            if (savedCode) {
                editor.setValue(savedCode);
            } else {
                // Load default based on language
                const lang = languageSelect.value;
                const template = getDefaultTemplate(lang);
                editor.setValue(template);
            }
            setTimeout(() => editor.refresh(), 100);
        }

        // Update bookmark button state
        const btn = document.getElementById('bookmark-btn');
        if (btn) {
            const icon = btn.querySelector('i');
            if (typeof bookmarkedChallenges !== 'undefined' && bookmarkedChallenges.includes(id)) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                btn.classList.add('bookmarked');
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                btn.classList.remove('bookmarked');
            }
        }

        // Start timer if in timed mode
        if (typeof currentMode !== 'undefined' && currentMode === 'timed') {
            if (typeof startTimer === 'function') startTimer(10);
        }
    }
}

function getDefaultTemplate(lang) {
    switch (lang) {
        case 'cpp': return '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Solve problem here\n    return 0;\n}';
        case 'python': return '# Solve problem here\n\nif __name__ == "__main__":\n    pass';
        case 'java': return 'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Solve problem here\n    }\n}';
        case 'rust': return 'fn main() {\n    // Solve problem here\n}';
        case 'c': return '#include <stdio.h>\n\nint main() {\n    // Solve problem here\n    return 0;\n}';
        default: return '';
    }
}

// Execution
async function runCode() {
    executeChallenge('run');
}

async function submitCode() {
    // Stop timer if in timed mode
    if (typeof currentMode !== 'undefined' && currentMode === 'timed') {
        if (typeof stopTimer === 'function') stopTimer();
    }
    executeChallenge('submit');
}

async function executeChallenge(type) {
    if (!currentChallengeId) return;

    const code = editor.getValue();
    const language = languageSelect.value;

    consoleOutput.textContent = type === 'submit' ? '🚀 Submitting to judges...' : '⏳ Running sample tests...';
    consoleOutput.style.color = '#f1fa8c';

    // UI Feedback
    const runBtn = document.querySelector('.run-btn');
    const submitBtn = document.querySelector('.submit-btn');
    const loadingHtml = '<i class="fa-solid fa-spinner fa-spin"></i>';

    if (runBtn) runBtn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    if (type === 'run' && runBtn) runBtn.innerHTML = `${loadingHtml} Running...`;
    if (type === 'submit' && submitBtn) submitBtn.innerHTML = `${loadingHtml} Submitting...`;

    try {
        const oldLevel = currentUser?.level || 1;

        const response = await fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                language,
                challengeId: currentChallengeId,
                token: token,
                type: type
            })
        });

        const result = await response.json();

        if (type === 'submit') {
            consoleOutput.textContent = result.status === 'success'
                ? '✅ ACCEPTED'
                : '❌ WRONG ANSWER';
        } else {
            consoleOutput.textContent = result.status === 'success'
                ? '✅ Sample Tests Passed'
                : '❌ Tests Failed';
        }

        consoleOutput.textContent += `\n\n${result.output}`;
        consoleOutput.style.color = result.status === 'success' ? '#50fa7b' : '#ff5555';

        // Render detailed results if available
        if (result.testResults) {
            renderTestResults(result.testResults, type);
            // Switch to test results tab
            const testTab = document.querySelector('[data-tab="testcases"]');
            if (testTab) testTab.click();
        }

        if (result.status === 'success' && type === 'submit') {
            showXpPopup(result.points || 50);
            triggerConfetti();
            showToast('Challenge completed! 🎉', 'success');

            if (token) {
                await checkAuthState();
                if (currentUser && currentUser.level > oldLevel) {
                    setTimeout(() => showLevelUp(currentUser.level), 1500);
                }
            }
        } else if (result.status === 'success' && type === 'run') {
            showToast('Sample tests passed! Ready to submit?', 'info');
        }

    } catch (error) {
        consoleOutput.textContent = '❌ Connection error.';
        consoleOutput.style.color = '#ff5555';
    } finally {
        if (runBtn) {
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="fa-solid fa-play"></i> Run';
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Submit';
        }
    }
}

function renderTestResults(results, type) {
    const container = document.getElementById('test-results');
    if (!container) return;

    container.innerHTML = '';

    results.forEach((res, index) => {
        const card = document.createElement('div');
        card.className = `test-result-card ${res.passed ? 'passed' : 'failed'}`;

        card.innerHTML = `
            <div class="test-header">
                <span class="test-status-pill ${res.passed ? 'success' : 'danger'}">
                    ${res.passed ?
                '<i class="fa-solid fa-check"></i> ' + (type === 'submit' ? 'ACCEPTED' : 'PASSED') :
                '<i class="fa-solid fa-xmark"></i> ' + (type === 'submit' ? (res.error ? 'RUNTIME ERROR' : 'WRONG ANSWER') : (res.error ? 'RUNTIME ERROR' : 'FAILED'))
            }
                </span>
                <span class="test-name">Test Case ${index + 1} ${res.hidden ? '(Hidden)' : ''}</span>
                <span class="test-time">${(res.runTime * 1000).toFixed(0)}ms</span>
                <span class="test-memory">${res.memory ? (res.memory / 1024).toFixed(1) + 'KB' : '0.1MB'}</span>
            </div>
            ${!res.hidden || !res.passed ? `
                <div class="test-details">
                    <div class="detail-item">
                        <label>Input:</label>
                        <pre>${res.input}</pre>
                    </div>
                    <div class="detail-item">
                        <label>Expected:</label>
                        <pre>${res.expected}</pre>
                    </div>
                    <div class="detail-item">
                        <label>Actual:</label>
                        <pre class="${res.passed ? '' : 'text-danger'}">${res.actual || (res.error ? 'Error' : 'No output')}</pre>
                    </div>
                    ${res.error ? `
                        <div class="detail-item">
                            <label>Error:</label>
                            <pre class="text-danger">${res.error}</pre>
                        </div>
                    ` : ''}
                </div>
            ` : '<div class="test-details hidden-msg">Test case hidden for privacy</div>'}
        `;
        container.appendChild(card);
    });
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

// Hints System (State is synchronized in syncUserState)


// Custom themed confirmation dialog
function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modalId = 'confirm-modal';
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');

        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;

        openModal(modalId);

        const cleanup = () => {
            closeModal(modalId);
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
        };

        const onOk = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
    });
}

async function unlockHint(hintNumber) {
    if (!currentChallengeId) return;

    const hintKey = `${currentChallengeId}_${hintNumber}`;
    const userId = currentUser ? currentUser.id : 'guest';

    if (unlockedHints[hintKey]) {
        showToast('Hint already unlocked', 'info');
        return;
    }

    const xpCost = hintNumber * 10; // 10, 20, 30 XP

    if (!token) {
        showToast('Please login to unlock hints', 'error');
        return;
    }

    // Custom themed confirmation
    const confirmed = await showConfirm(
        'Unlock Hint?',
        `This will cost ${xpCost} XP. Do you want to continue?`
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`/api/challenges/${currentChallengeId}/hint`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hintLevel: hintNumber })
        });

        const data = await response.json();

        if (response.ok) {
            unlockedHints[hintKey] = true; // Use boolean for consistency
            if (currentUser) {
                localStorage.setItem(`unlockedHints_${currentUser.id}`, JSON.stringify(unlockedHints));
            }

            // Update UI - refresh the hints display
            const challenge = allChallenges.find(c => c.id === currentChallengeId);
            if (challenge) {
                displayHints(challenge);
            }

            if (data.alreadyUnlocked) {
                showToast('Hint was already unlocked!', 'info');
            } else {
                showToast(`Hint unlocked! -${data.xpDeducted || xpCost} XP`, 'success');
            }
            checkAuthState(); // Refresh user XP
        } else {
            showToast(data.error || 'Failed to unlock hint', 'error');
        }
    } catch (error) {
        console.error('Hint error:', error);
        showToast('Failed to unlock hint', 'error');
    }
}

// Function to display hints when opening a challenge
function displayHints(challenge) {
    const hintsList = document.getElementById('hints-list');
    if (!hintsList) return;

    // Defensive check: ensure hints is an array
    let hints = challenge.hints;
    if (typeof hints === 'string') {
        try {
            hints = JSON.parse(hints);
        } catch (e) {
            hints = [];
        }
    }

    if (!hints || !Array.isArray(hints) || hints.length === 0) {
        hintsList.innerHTML = '<p class="empty-state">No hints available for this challenge</p>';
        return;
    }

    hintsList.innerHTML = hints.map((hint, index) => {
        const hintNumber = index + 1;
        const hintKey = `${challenge.id}_${hintNumber}`;
        const isUnlocked = unlockedHints[hintKey] === true;
        const xpCost = hintNumber * 10;
        const hintText = isUnlocked ? (hints[index] || 'Hint content available') : `Click to unlock (-${xpCost} XP)`;

        return `
            <div class="hint-item ${isUnlocked ? 'unlocked' : 'locked'}" ${isUnlocked ? '' : `onclick="unlockHint(${hintNumber})"`}>
                <span class="hint-number">${hintNumber}</span>
                <span class="hint-text">${hintText}</span>
                ${isUnlocked ? '<i class="fa-solid fa-check" style="color: var(--success);"></i>' : '<i class="fa-solid fa-lock"></i>'}
            </div>
        `;
    }).join('');
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

    // Set player info
    const player1Avatar = document.getElementById('battle-player1-avatar');
    const player1Name = document.getElementById('battle-player1-name');
    const player2Avatar = document.getElementById('battle-player2-avatar');
    const player2Name = document.getElementById('battle-player2-name');

    if (currentUser) {
        player1Avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=38bdf8&color=000`;
        player1Name.textContent = currentUser.username;
    }

    // Set opponent info
    const opponent = battle.player1_id === currentUser?.id ? battle.player2 : battle.player1;
    if (opponent) {
        player2Avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(opponent.username || 'Opponent')}&background=ef4444&color=fff`;
        player2Name.textContent = opponent.username || 'Opponent';
    } else {
        player2Avatar.src = `https://ui-avatars.com/api/?name=Opponent&background=ef4444&color=fff`;
        player2Name.textContent = 'Opponent';
    }

    // Set battle problem
    const challenge = battle.challenges || battle;
    document.getElementById('battle-problem-title').textContent = challenge.title || 'Coding Challenge';
    document.getElementById('battle-problem-desc').textContent = challenge.description || 'Solve this challenge before your opponent!';

    // Initialize battle editor
    const battleEditorEl = document.getElementById('battle-editor');
    if (battleEditorEl && !battleEditor) {
        battleEditor = CodeMirror.fromTextArea(battleEditorEl, {
            mode: 'javascript',
            theme: 'dracula',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false
        });
        battleEditor.setSize('100%', '300px');
    }

    // Clear previous code
    if (battleEditor) {
        battleEditor.setValue('// Write your solution here\n');
    }

    // Start battle timer
    const startTime = new Date(battle.started_at || Date.now()).getTime();
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

function setBattleEditorMode(language) {
    if (!battleEditor) return;

    const modes = {
        'javascript': 'javascript',
        'python': 'python',
        'java': 'text/x-java',
        'cpp': 'text/x-c++src',
        'c': 'text/x-csrc'
    };

    battleEditor.setOption('mode', modes[language] || 'javascript');
}

function endBattle(result) {
    battleState = 'idle';
    currentBattle = null;

    // Clear any intervals
    if (battlePollInterval) clearInterval(battlePollInterval);

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

        if (!battles || battles.length === 0) {
            container.innerHTML = '<p class="empty-state">No battles yet. Start your first battle!</p>';
            return;
        }

        container.innerHTML = battles.map(b => {
            const won = b.winner_id === currentUser?.id;
            const opponentName = b.player1_id === currentUser?.id ?
                (b.player2?.username || 'Opponent') :
                (b.player1?.username || 'Opponent');
            return `
                <div class="battle-history-item ${won ? 'won' : 'lost'}">
                    <div class="battle-result-icon">${won ? '🏆' : '❌'}</div>
                    <div class="battle-info">
                        <span class="battle-opponent">vs ${opponentName}</span>
                        <span class="battle-challenge">${b.challenges?.title || 'Challenge'}</span>
                    </div>
                    <span class="battle-date">${formatTime(b.ended_at)}</span>
                </div>
            `;
        }).join('');
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
            if (Array.isArray(data)) {
                activityData = data.reduce((acc, d) => {
                    const dateStr = new Date(d.date).toISOString().split('T')[0];
                    acc[dateStr] = d.count;
                    return acc;
                }, {});
            }
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

    const solvedIds = currentUser.solvedChallenges || [];
    const solvedChallenges = allChallenges.filter(c => solvedIds.includes(c.id));

    // Calculate actual difficulty counts
    let easy = 0, medium = 0, hard = 0;
    solvedChallenges.forEach(c => {
        const diff = c.difficulty?.toLowerCase();
        if (diff === 'easy') easy++;
        else if (diff === 'medium') medium++;
        else if (diff === 'hard') hard++;
    });

    const totalSolved = solvedChallenges.length;

    // Update difficulty chart counts
    const easyCount = document.getElementById('easy-count');
    const mediumCount = document.getElementById('medium-count');
    const hardCount = document.getElementById('hard-count');
    const totalChart = document.getElementById('total-solved-chart');

    if (easyCount) easyCount.textContent = easy;
    if (mediumCount) mediumCount.textContent = medium;
    if (hardCount) hardCount.textContent = hard;
    if (totalChart) totalChart.textContent = totalSolved;

    // Update donut chart segments
    const easyPercent = totalSolved > 0 ? Math.round((easy / totalSolved) * 100) : 0;
    const mediumPercent = totalSolved > 0 ? Math.round((medium / totalSolved) * 100) : 0;
    const hardPercent = totalSolved > 0 ? Math.round((hard / totalSolved) * 100) : 0;

    const easySegment = document.querySelector('.donut-segment.easy');
    const mediumSegment = document.querySelector('.donut-segment.medium');
    const hardSegment = document.querySelector('.donut-segment.hard');

    if (easySegment) easySegment.style.setProperty('--value', easyPercent);
    if (mediumSegment) mediumSegment.style.setProperty('--value', mediumPercent);
    if (hardSegment) hardSegment.style.setProperty('--value', hardPercent);

    // Update category progress bars
    updateCategoryBars(solvedChallenges);
}

function updateCategoryBars(solvedChallenges) {
    const categoryBars = document.getElementById('category-bars');
    if (!categoryBars) return;

    // Get unique categories from all challenges
    const categories = {};
    allChallenges.forEach(c => {
        const cat = c.category || 'General';
        if (!categories[cat]) {
            categories[cat] = { total: 0, solved: 0 };
        }
        categories[cat].total++;
    });

    // Count solved per category
    solvedChallenges.forEach(c => {
        const cat = c.category || 'General';
        if (categories[cat]) {
            categories[cat].solved++;
        }
    });

    // Generate category bars HTML
    const sortedCats = Object.entries(categories).sort((a, b) => b[1].total - a[1].total).slice(0, 6);

    categoryBars.innerHTML = sortedCats.map(([name, data]) => {
        const percent = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
        return `
            <div class="category-bar-item">
                <span class="cat-name">${name}</span>
                <div class="cat-bar"><div class="cat-fill" style="width: ${percent}%"></div></div>
                <span class="cat-count">${data.solved}/${data.total}</span>
            </div>
        `;
    }).join('');
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



// Edit Profile
function editProfile() {
    openModal('edit-profile-modal');
}

// Friends System (Dynamic)
async function searchUsers(query) {
    if (!query || query.length < 2) {
        const resultsContainer = document.getElementById('user-search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p class="search-hint">Type at least 2 characters to search</p>';
        }
        return;
    }

    try {
        const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const users = await response.json();

        const resultsContainer = document.getElementById('user-search-results');
        if (resultsContainer) {
            if (!users || users.length === 0) {
                resultsContainer.innerHTML = '<p class="empty-state">No users found</p>';
                return;
            }

            resultsContainer.innerHTML = users.map(u => `
                <div class="user-result">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=random" alt="${u.username}">
                    <div class="user-result-info">
                        <span class="user-result-name">${u.username}</span>
                        <span class="user-result-level">Level ${u.level || 1}</span>
                    </div>
                    <button onclick="addFriend('${u.id}')" class="btn-add-friend">
                        <i class="fa-solid fa-user-plus"></i> Add
                    </button>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Search error:', err);
        showToast('Search failed', 'error');
    }
}

// Add event listener for user search input
function initUserSearch() {
    const searchInput = document.getElementById('user-search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchUsers(e.target.value.trim());
            }, 300);
        });
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
            // Clear search results
            document.getElementById('user-search-input').value = '';
            document.getElementById('user-search-results').innerHTML = '';
            closeModal('add-friend-modal');
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

        if (!tournaments || tournaments.length === 0) {
            // Show default tournament info
            return;
        }

        // Find active tournament
        const activeTournament = tournaments.find(t => t.status === 'active') || tournaments[0];
        const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');

        // Update active tournament section
        if (activeTournament) {
            document.getElementById('tournament-name').textContent = activeTournament.name;
            document.getElementById('tournament-desc').textContent = activeTournament.description;
            document.getElementById('tournament-participants').textContent = `${activeTournament.participants || 0} participants`;
            document.getElementById('tournament-prize').textContent = activeTournament.prize_description || '500 XP Prize';

            // Calculate time remaining
            const endTime = new Date(activeTournament.end_time).getTime();
            const now = Date.now();
            const remaining = endTime - now;

            if (remaining > 0) {
                const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                document.getElementById('tournament-time').textContent = `${days}d ${hours}h remaining`;
            } else {
                document.getElementById('tournament-time').textContent = 'Ended';
            }

            // Store active tournament ID for join button
            window.activeTournamentId = activeTournament.id;
        }

        // Update upcoming tournaments list
        const upcomingList = document.getElementById('upcoming-list');
        if (upcomingList && upcomingTournaments.length > 0) {
            upcomingList.innerHTML = upcomingTournaments.map(t => {
                const startDate = new Date(t.start_time);
                const daysUntil = Math.ceil((startDate - Date.now()) / (1000 * 60 * 60 * 24));
                return `
                    <div class="upcoming-item" onclick="viewTournament('${t.id}')">
                        <span class="upcoming-name">${t.name}</span>
                        <span class="upcoming-date">Starts in ${daysUntil} day${daysUntil === 1 ? '' : 's'}</span>
                    </div>
                `;
            }).join('');
        }

        // Load tournament leaderboard
        loadTournamentLeaderboard(activeTournament?.id);

    } catch (err) {
        console.error('Load tournaments error:', err);
    }
}

async function loadTournamentLeaderboard(tournamentId) {
    if (!tournamentId) return;

    try {
        const response = await fetch(`/api/tournaments/${tournamentId}/leaderboard`);
        const leaderboard = await response.json();

        const tbody = document.getElementById('tournament-leaderboard');
        if (!tbody) return;

        if (!leaderboard || leaderboard.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No participants yet</td></tr>';
            return;
        }

        tbody.innerHTML = leaderboard.map((p, i) => `
            <tr class="${p.user_id === currentUser?.id ? 'highlight' : ''}">
                <td class="rank">${i + 1}</td>
                <td class="user">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.username || 'User')}&background=random&size=32" alt="">
                    ${p.username || 'Anonymous'}
                </td>
                <td class="score">${p.score || 0}</td>
                <td class="time">${p.completion_time ? formatTime(p.completion_time) : '-'}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Load tournament leaderboard error:', err);
    }
}

function viewTournament(tournamentId) {
    showToast('Tournament details coming soon!', 'info');
}

async function joinTournament(tournamentId) {
    if (!token) {
        showToast('Please login to join tournaments', 'error');
        return;
    }

    // Use the passed ID or the active tournament ID
    const id = tournamentId || window.activeTournamentId;
    if (!id) {
        showToast('No tournament selected', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/tournaments/${id}/join`, {
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
    const container = document.getElementById('skill-tree');
    if (!container) return;

    // Define skill categories with icons
    const skillCategories = [
        { id: 'arrays', name: 'Arrays', icon: 'fa-list', category: 'Arrays' },
        { id: 'strings', name: 'Strings', icon: 'fa-font', category: 'Strings' },
        { id: 'recursion', name: 'Recursion', icon: 'fa-rotate', category: 'Recursion' },
        { id: 'dp', name: 'Dynamic Programming', icon: 'fa-brain', category: 'Dynamic Programming' },
        { id: 'trees', name: 'Trees', icon: 'fa-sitemap', category: 'Trees' },
        { id: 'graphs', name: 'Graphs', icon: 'fa-project-diagram', category: 'Graphs' }
    ];

    // Calculate progress per category based on solved challenges
    const solvedIds = currentUser?.solvedChallenges || [];
    const solvedChallenges = allChallenges.filter(c => solvedIds.includes(c.id));

    // Count challenges per category
    const categoryStats = {};
    allChallenges.forEach(c => {
        const cat = c.category || 'General';
        if (!categoryStats[cat]) {
            categoryStats[cat] = { total: 0, solved: 0 };
        }
        categoryStats[cat].total++;
    });

    solvedChallenges.forEach(c => {
        const cat = c.category || 'General';
        if (categoryStats[cat]) {
            categoryStats[cat].solved++;
        }
    });

    // Generate skill nodes
    container.innerHTML = skillCategories.map((skill, index) => {
        const stats = categoryStats[skill.category] || { total: 5, solved: 0 };
        const progress = stats.solved;
        const total = Math.max(stats.total, 5);
        const percent = (progress / total) * 100;

        let status = 'locked';
        if (progress >= total) status = 'unlocked';
        else if (progress > 0) status = 'partial';
        else if (index === 0) status = 'partial'; // First skill is always accessible

        return `
            <div class="skill-node ${status}" data-skill="${skill.id}" onclick="openSkillDetails('${skill.id}')">
                <i class="fa-solid ${skill.icon}"></i>
                <span>${skill.name}</span>
                <div class="skill-progress">${progress}/${total}</div>
                <div class="skill-bar">
                    <div class="skill-fill" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function openSkillDetails(skillId) {
    // Find challenges related to this skill/category
    const skill = skillId.charAt(0).toUpperCase() + skillId.slice(1);
    const related = allChallenges.filter(c =>
        c.category?.toLowerCase().includes(skillId) ||
        c.tags?.includes(skillId)
    );

    if (related.length > 0) {
        // Navigate to challenges with filter
        showToast(`Found ${related.length} ${skill} challenges!`, 'info');
        navigateTo('challenges');
    } else {
        showToast(`No ${skill} challenges found yet`, 'info');
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
            if (!Array.isArray(activities) || activities.length === 0) {
                container.innerHTML = '<p class="empty-state">No recent activity</p>';
                return;
            }
            container.innerHTML = activities.map(a => `
                <div class="activity-item">
                    <img src="https://ui-avatars.com/api/?name=${a.username}&background=random" alt="${a.username}">
                    <div class="activity-content">
                        <span class="activity-user">${a.username}</span>
                        <span class="activity-action">${a.action || 'completed a challenge'}</span>
                        ${a.challenge_title ? `<span class="activity-challenge">${a.challenge_title}</span>` : ''}
                    </div>
                    <span class="activity-time">${formatTime(a.created_at)}</span>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Load feed error:', err);
        const container = document.getElementById('activity-feed');
        if (container) container.innerHTML = '<p class="empty-state">No recent activity</p>';
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

function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            loadNotifications();
        }
    }
}

async function markAllNotificationsRead() {
    if (!token) return;

    try {
        await fetch('/api/notifications/read-all', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadNotifications();
        showToast('All notifications marked as read', 'success');
    } catch (err) {
        console.error('Mark all read error:', err);
    }
}

// Close notifications when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifications-dropdown');
    const bell = document.querySelector('.notification-bell');
    // Only process if both elements exist and dropdown is visible
    if (dropdown && bell && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(e.target) && !bell.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    }
});

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


