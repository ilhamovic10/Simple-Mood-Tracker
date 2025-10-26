/* ============================================
   MENTAL HEALTH TRACKER - JAVASCRIPT
   A simple, beginner-friendly script
   
   This app helps you track your daily mood!
   ============================================ */

// ============================================
// DATA STORAGE (Using JavaScript variables)
// ============================================

// This array will store all our mood entries
// Each entry is an object with date, mood, attributes, and notes
let moodEntries = [];

// Chart instance (global)
let moodChart = null;
let currentPeriod = 'daily';
let currentSortBy = 'newest';
let currentFilter = 'all';

// ============================================
// GET ELEMENTS FROM HTML
// ============================================

// Tab elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Graph elements
const moodChartCanvas = document.getElementById('moodChart');
const graphEmpty = document.getElementById('graphEmpty');
const periodButtons = document.querySelectorAll('.period-button');

// Statistics elements
const weeklyAvgDisplay = document.getElementById('weeklyAvg');
const monthlyAvgDisplay = document.getElementById('monthlyAvg');
const streakDisplay = document.getElementById('streakCount');
const totalTrackedDisplay = document.getElementById('totalTracked');
const attributeBarsContainer = document.getElementById('attributeBars');

// History controls
const sortBySelect = document.getElementById('sortBy');
const filterBySelect = document.getElementById('filterBy');

// Overall mood elements
const overallMoodSlider = document.getElementById('overallMood');
const moodValueDisplay = document.getElementById('moodValue');
const moodLabelDisplay = document.getElementById('moodLabel');

// Attribute sliders
const energySlider = document.getElementById('energy');
const sleepSlider = document.getElementById('sleep');
const stressSlider = document.getElementById('stress');
const productivitySlider = document.getElementById('productivity');
const socialSlider = document.getElementById('social');

// Attribute value displays
const energyValue = document.getElementById('energyValue');
const sleepValue = document.getElementById('sleepValue');
const stressValue = document.getElementById('stressValue');
const productivityValue = document.getElementById('productivityValue');
const socialValue = document.getElementById('socialValue');

// Other elements
const dailyNotesTextarea = document.getElementById('dailyNotes');
const charCountDisplay = document.getElementById('charCount');
const saveButton = document.getElementById('saveButton');
const successMessage = document.getElementById('successMessage');
const currentDateDisplay = document.getElementById('currentDate');
const historyContainer = document.getElementById('historyContainer');
const statsSection = document.getElementById('statsSection');
const avgMoodDisplay = document.getElementById('avgMood');
const avgEmojiDisplay = document.getElementById('avgEmoji');
const totalEntriesDisplay = document.getElementById('totalEntries');

// ============================================
// TAB MANAGEMENT
// ============================================

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
    });

    // Update tab content
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-panel`);
    });

    // Update displays based on active tab
    if (tabName === 'stats') {
        updateStatistics();
        renderGraph();
    } else if (tabName === 'history') {
        displayHistory();
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get today's date in a readable format
 * Example: "Sunday, October 26, 2025"
 */
function getTodayDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
}

/**
 * Get today's date as a simple string for comparison
 * Example: "2025-10-26"
 */
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Format a date string to be more readable
 */
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Get the mood label based on the rating (1-10)
 */
function getMoodLabel(rating) {
    if (rating <= 2) return 'Very Difficult';
    if (rating <= 4) return 'Challenging';
    if (rating <= 6) return 'Okay';
    if (rating <= 8) return 'Good';
    return 'Excellent';
}

/**
 * Get the mood color class based on rating
 */
function getMoodColorClass(rating) {
    if (rating <= 4) return 'mood-low';
    if (rating <= 7) return 'mood-medium';
    return 'mood-high';
}

/**
 * Get an emoji based on the mood rating
 */
function getMoodEmoji(rating) {
    const emojis = {
        1: '😢', 2: '😔', 3: '😟', 4: '😕',
        5: '😐', 6: '🙂', 7: '😊', 8: '😄',
        9: '😁', 10: '🤩'
    };
    return emojis[Math.round(rating)] || '😐';
}

/**
 * Calculate days ago from today
 */
function getDaysAgo(dateString) {
    const entryDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today - entryDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Calculate consecutive streak
 */
function calculateStreak() {
    if (moodEntries.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = new Date(today);
    
    // Sort entries by date
    const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (let entry of sortedEntries) {
        const entryDate = new Date(entry.date + 'T00:00:00');
        entryDate.setHours(0, 0, 0, 0);
        
        if (entryDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (entryDate.getTime() < currentDate.getTime()) {
            break;
        }
    }
    
    return streak;
}

/**
 * Get date range for filtering
 */
function getDateRange(filter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filter === 'all') return null;
    
    const daysMap = {
        '7days': 7,
        '30days': 30,
        '90days': 90
    };
    
    const days = daysMap[filter];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);
    
    return startDate;
}

// ============================================
// UPDATE DISPLAYS
// ============================================

/**
 * Update the overall mood display when slider changes
 */
function updateMoodDisplay() {
    const value = parseInt(overallMoodSlider.value);
    const moodEmoji = document.getElementById('moodEmoji');
    
    // Animate number change
    moodValueDisplay.classList.add('changed');
    setTimeout(() => moodValueDisplay.classList.remove('changed'), 400);
    
    // Update number
    moodValueDisplay.textContent = value;
    moodLabelDisplay.textContent = getMoodLabel(value);
    
    // Animate emoji change
    if (moodEmoji) {
        moodEmoji.classList.add('changed');
        setTimeout(() => moodEmoji.classList.remove('changed'), 400);
        moodEmoji.textContent = getMoodEmoji(value);
    }
}

/**
 * Update attribute value displays
 */
function updateAttributeDisplays() {
    energyValue.textContent = energySlider.value;
    sleepValue.textContent = sleepSlider.value;
    stressValue.textContent = stressSlider.value;
    productivityValue.textContent = productivitySlider.value;
    socialValue.textContent = socialSlider.value;
}

/**
 * Update character count for notes
 */
function updateCharCount() {
    const length = dailyNotesTextarea.value.length;
    charCountDisplay.textContent = length;
    
    // Change color if close to limit
    if (length > 180) {
        charCountDisplay.style.color = 'var(--color-orange-500)';
    } else {
        charCountDisplay.style.color = 'var(--color-text-secondary)';
    }
}

// ============================================
// SAVE ENTRY
// ============================================

/**
 * Save today's mood entry
 */
function saveEntry() {
    // Add loading state to button
    saveButton.classList.add('loading');
    saveButton.textContent = '';

    // Simulate save delay for better UX
    setTimeout(() => {
        // Get all the values
        const entry = {
        date: getTodayDateString(),
        overallMood: parseInt(overallMoodSlider.value),
        attributes: {
            energy: parseInt(energySlider.value),
            sleep: parseInt(sleepSlider.value),
            stress: parseInt(stressSlider.value),
            productivity: parseInt(productivitySlider.value),
            social: parseInt(socialSlider.value)
        },
        notes: dailyNotesTextarea.value.trim()
    };

    // Check if entry for today already exists
    const existingIndex = moodEntries.findIndex(e => e.date === entry.date);
    
    if (existingIndex !== -1) {
        // Update existing entry
        moodEntries[existingIndex] = entry;
    } else {
        // Add new entry
        moodEntries.push(entry);
    }

    // Sort entries by date (newest first)
    moodEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Remove loading, add success state
        saveButton.classList.remove('loading');
        saveButton.classList.add('success');
        saveButton.textContent = '✓ Saved!';

        setTimeout(() => {
            saveButton.classList.remove('success');
            const today = getTodayDateString();
            const todayEntry = moodEntries.find(e => e.date === today);
            saveButton.textContent = todayEntry ? 'Update Today\'s Entry' : 'Save Today\'s Entry';
        }, 2000);

        // Show success message
        showSuccessMessage();

        // Update all displays
        const activeTab = document.querySelector('.tab-button.active')?.dataset.tab;
        if (activeTab === 'stats') {
            updateStatistics();
            renderGraph();
        } else if (activeTab === 'history') {
            displayHistory();
        }
    }, 600); // 600ms delay for loading animation
}

/**
 * Show success message with animation
 */
function showSuccessMessage() {
    successMessage.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

// ============================================
// GRAPH RENDERING
// ============================================

/**
 * Prepare data for graph based on period
 */
function prepareGraphData(period) {
    if (moodEntries.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'daily') {
        // Last 7 days
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const entry = moodEntries.find(e => e.date === dateString);
            
            const dayLabel = i === 0 ? 'Today' : 
                           i === 1 ? 'Yesterday' : 
                           date.toLocaleDateString('en-US', { weekday: 'short' });
            
            labels.push(dayLabel);
            data.push(entry ? entry.overallMood : null);
        }
        
        return { labels, data };
        
    } else if (period === 'weekly') {
        // Last 4 weeks
        const labels = [];
        const data = [];
        
        for (let i = 3; i >= 0; i--) {
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() - (i * 7));
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);
            
            // Find all entries in this week
            const weekEntries = moodEntries.filter(e => {
                const entryDate = new Date(e.date + 'T00:00:00');
                return entryDate >= weekStart && entryDate <= weekEnd;
            });
            
            const weekLabel = i === 0 ? 'This Week' : `${i} week${i > 1 ? 's' : ''} ago`;
            labels.push(weekLabel);
            
            if (weekEntries.length > 0) {
                const avg = weekEntries.reduce((sum, e) => sum + e.overallMood, 0) / weekEntries.length;
                data.push(parseFloat(avg.toFixed(1)));
            } else {
                data.push(null);
            }
        }
        
        return { labels, data };
        
    } else if (period === 'monthly') {
        // Last 6 months
        const labels = [];
        const data = [];
        
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            
            // Find all entries in this month
            const monthEntries = moodEntries.filter(e => {
                const entryDate = new Date(e.date + 'T00:00:00');
                return entryDate >= monthDate && entryDate <= monthEnd;
            });
            
            const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short' });
            labels.push(monthLabel);
            
            if (monthEntries.length > 0) {
                const avg = monthEntries.reduce((sum, e) => sum + e.overallMood, 0) / monthEntries.length;
                data.push(parseFloat(avg.toFixed(1)));
            } else {
                data.push(null);
            }
        }
        
        return { labels, data };
    }
}

/**
 * Render the mood graph
 */
function renderGraph() {
    const graphData = prepareGraphData(currentPeriod);
    
    if (!graphData || graphData.data.every(d => d === null)) {
        // No data - show empty state
        if (moodChart) {
            moodChart.destroy();
            moodChart = null;
        }
        moodChartCanvas.style.display = 'none';
        graphEmpty.classList.add('show');
        return;
    }
    
    // Hide empty state, show canvas
    moodChartCanvas.style.display = 'block';
    graphEmpty.classList.remove('show');
    
    // Destroy existing chart
    if (moodChart) {
        moodChart.destroy();
    }
    
    // Create gradient for line
    const ctx = moodChartCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(149, 225, 211, 0.5)');
    gradient.addColorStop(0.5, 'rgba(255, 230, 109, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 182, 185, 0.2)');
    
    // Chart configuration
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: graphData.labels,
            datasets: [{
                label: 'Mood Rating',
                data: graphData.data,
                borderColor: '#21808D',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#21808D',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#1D7480',
                pointHoverBorderColor: '#fff',
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(19, 52, 59, 0.9)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#21808D',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value === null) return 'No data';
                            const emoji = getMoodEmoji(value);
                            const label = getMoodLabel(value);
                            return `${emoji} ${value}/10 - ${label}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 10,
                    ticks: {
                        stepSize: 2,
                        color: '#626C71',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(94, 82, 64, 0.1)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#626C71',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

/**
 * Update period selection
 */
function updatePeriod(period) {
    currentPeriod = period;
    
    // Update button states
    periodButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === period);
    });
    
    // Re-render graph
    renderGraph();
}

// ============================================
// STATISTICS
// ============================================

/**
 * Update all statistics displays
 */
function updateStatistics() {
    if (moodEntries.length === 0) {
        weeklyAvgDisplay.innerHTML = '-';
        monthlyAvgDisplay.innerHTML = '-';
        streakDisplay.textContent = '0 days';
        totalTrackedDisplay.textContent = '0 days';
        attributeBarsContainer.innerHTML = '<p class="empty-state">No data yet.</p>';
        return;
    }
    
    // Calculate weekly average (last 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekEntries = moodEntries.filter(e => {
        const entryDate = new Date(e.date + 'T00:00:00');
        return entryDate >= weekAgo;
    });
    
    if (weekEntries.length > 0) {
        const weekAvg = weekEntries.reduce((sum, e) => sum + e.overallMood, 0) / weekEntries.length;
        weeklyAvgDisplay.innerHTML = `${getMoodEmoji(weekAvg)} ${weekAvg.toFixed(1)}`;
    } else {
        weeklyAvgDisplay.innerHTML = '-';
    }
    
    // Calculate monthly average (last 30 days)
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const monthEntries = moodEntries.filter(e => {
        const entryDate = new Date(e.date + 'T00:00:00');
        return entryDate >= monthAgo;
    });
    
    if (monthEntries.length > 0) {
        const monthAvg = monthEntries.reduce((sum, e) => sum + e.overallMood, 0) / monthEntries.length;
        monthlyAvgDisplay.innerHTML = `${getMoodEmoji(monthAvg)} ${monthAvg.toFixed(1)}`;
    } else {
        monthlyAvgDisplay.innerHTML = '-';
    }
    
    // Calculate streak
    const streak = calculateStreak();
    streakDisplay.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
    
    // Total tracked
    totalTrackedDisplay.textContent = `${moodEntries.length} day${moodEntries.length !== 1 ? 's' : ''}`;
    
    // Update attribute bars
    updateAttributeBars();
}

/**
 * Update attribute breakdown bars
 */
function updateAttributeBars() {
    if (moodEntries.length === 0) return;
    
    const attributes = [
        { name: 'Energy Level', icon: '⚡', key: 'energy' },
        { name: 'Sleep Quality', icon: '😴', key: 'sleep' },
        { name: 'Stress Level', icon: '😰', key: 'stress' },
        { name: 'Productivity', icon: '✅', key: 'productivity' },
        { name: 'Social Connection', icon: '💬', key: 'social' }
    ];
    
    attributeBarsContainer.innerHTML = '';
    
    attributes.forEach(attr => {
        const total = moodEntries.reduce((sum, e) => sum + e.attributes[attr.key], 0);
        const avg = total / moodEntries.length;
        const percentage = (avg / 10) * 100;
        
        const barItem = document.createElement('div');
        barItem.className = 'attribute-bar-item';
        barItem.innerHTML = `
            <div class="attribute-bar-header">
                <div class="attribute-bar-name">
                    <span>${attr.icon}</span>
                    <span>${attr.name}</span>
                </div>
                <div class="attribute-bar-value">${avg.toFixed(1)}/10</div>
            </div>
            <div class="attribute-bar-track">
                <div class="attribute-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        
        attributeBarsContainer.appendChild(barItem);
    });
}

// ============================================
// DISPLAY HISTORY
// ============================================

/**
 * Display the mood history with filtering and sorting
 */
function displayHistory() {
    // Clear the container
    historyContainer.innerHTML = '';

    // If no entries, show empty state
    if (moodEntries.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state-large">
                <span class="empty-icon">📝</span>
                <p>Start tracking to see your history!</p>
            </div>
        `;
        return;
    }

    // Apply filters
    let filteredEntries = [...moodEntries];
    
    // Date range filter
    if (currentFilter !== 'all') {
        const startDate = getDateRange(currentFilter);
        if (startDate) {
            filteredEntries = filteredEntries.filter(e => {
                const entryDate = new Date(e.date + 'T00:00:00');
                return entryDate >= startDate;
            });
        }
    }
    
    // Apply sorting
    if (currentSortBy === 'newest') {
        filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (currentSortBy === 'oldest') {
        filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (currentSortBy === 'highest') {
        filteredEntries.sort((a, b) => b.overallMood - a.overallMood);
    } else if (currentSortBy === 'lowest') {
        filteredEntries.sort((a, b) => a.overallMood - b.overallMood);
    }
    
    // Show filtered entries
    if (filteredEntries.length === 0) {
        historyContainer.innerHTML = '<p class="empty-state">No entries found for this filter.</p>';
        return;
    }

    // Create a card for each entry
    filteredEntries.forEach((entry, index) => {
        const card = createHistoryCard(entry);
        card.style.animationDelay = `${index * 0.05}s`;
        historyContainer.appendChild(card);
    });
}

/**
 * Create a history card for an entry
 */
function createHistoryCard(entry) {
    const card = document.createElement('div');
    card.className = `history-card ${getMoodColorClass(entry.overallMood)}`;

    // Header with date and overall mood
    const header = document.createElement('div');
    header.className = 'history-header';
    
    const daysAgo = getDaysAgo(entry.date);
    let dateLabel = formatDate(entry.date);
    if (daysAgo === 0) dateLabel += ' (Today)';
    else if (daysAgo === 1) dateLabel += ' (Yesterday)';
    
    header.innerHTML = `
        <span class="history-date">${dateLabel}</span>
        <div class="history-mood">
            <span class="history-mood-number">${entry.overallMood}</span>
            <span class="history-mood-label">${getMoodLabel(entry.overallMood)}</span>
        </div>
    `;
    card.appendChild(header);

    // Attributes grid
    const attributesDiv = document.createElement('div');
    attributesDiv.className = 'history-attributes';
    attributesDiv.innerHTML = `
        <div class="history-attribute">
            <span class="history-attribute-icon">⚡</span>
            <span class="history-attribute-value">${entry.attributes.energy}</span>
        </div>
        <div class="history-attribute">
            <span class="history-attribute-icon">😴</span>
            <span class="history-attribute-value">${entry.attributes.sleep}</span>
        </div>
        <div class="history-attribute">
            <span class="history-attribute-icon">😰</span>
            <span class="history-attribute-value">${entry.attributes.stress}</span>
        </div>
        <div class="history-attribute">
            <span class="history-attribute-icon">✅</span>
            <span class="history-attribute-value">${entry.attributes.productivity}</span>
        </div>
        <div class="history-attribute">
            <span class="history-attribute-icon">💬</span>
            <span class="history-attribute-value">${entry.attributes.social}</span>
        </div>
    `;
    card.appendChild(attributesDiv);

    // Notes (if any)
    if (entry.notes) {
        const notesDiv = document.createElement('div');
        notesDiv.className = 'history-notes';
        notesDiv.textContent = entry.notes;
        card.appendChild(notesDiv);
    }

    return card;
}

// ============================================
// DISPLAY STATISTICS
// ============================================



// ============================================
// LOAD TODAY'S ENTRY (if exists)
// ============================================

/**
 * Load today's entry if it exists (for editing)
 */
function loadTodayEntry() {
    const todayDate = getTodayDateString();
    const todayEntry = moodEntries.find(e => e.date === todayDate);

    if (todayEntry) {
        // Populate the form with today's entry
        overallMoodSlider.value = todayEntry.overallMood;
        energySlider.value = todayEntry.attributes.energy;
        sleepSlider.value = todayEntry.attributes.sleep;
        stressSlider.value = todayEntry.attributes.stress;
        productivitySlider.value = todayEntry.attributes.productivity;
        socialSlider.value = todayEntry.attributes.social;
        dailyNotesTextarea.value = todayEntry.notes;

        // Update displays
        updateMoodDisplay();
        updateAttributeDisplays();
        updateCharCount();

        // Change button text
        saveButton.textContent = 'Update Today\'s Entry';
    }
}

// ============================================
// INITIALIZE APP
// ============================================

// ============================================
// SCROLL ANIMATIONS
// ============================================

/**
 * Set up Intersection Observer for scroll animations
 */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Observe history cards
    document.querySelectorAll('.history-card').forEach(el => {
        observer.observe(el);
    });
}



/**
 * Set up back to top button
 */
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Add ripple effect to buttons
 */
function addRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// ============================================
// INITIALIZE APP
// ============================================

/**
 * Set up the app when page loads
 */
function initializeApp() {
    // Display current date
    currentDateDisplay.textContent = getTodayDate();

    // Set up tab navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Keyboard navigation for tabs
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            const activeTab = document.querySelector('.tab-button.active');
            const currentIndex = Array.from(tabButtons).indexOf(activeTab);
            let newIndex;
            
            if (e.key === 'ArrowRight') {
                newIndex = (currentIndex + 1) % tabButtons.length;
            } else {
                newIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
            }
            
            tabButtons[newIndex].click();
            tabButtons[newIndex].focus();
        }
    });

    // Set up period selector
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => updatePeriod(btn.dataset.period));
    });
    
    // Set up history controls
    sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        displayHistory();
    });
    
    filterBySelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        displayHistory();
    });

    // Set up event listeners for sliders
    overallMoodSlider.addEventListener('input', updateMoodDisplay);
    energySlider.addEventListener('input', updateAttributeDisplays);
    sleepSlider.addEventListener('input', updateAttributeDisplays);
    stressSlider.addEventListener('input', updateAttributeDisplays);
    productivitySlider.addEventListener('input', updateAttributeDisplays);
    socialSlider.addEventListener('input', updateAttributeDisplays);

    // Set up event listener for notes
    dailyNotesTextarea.addEventListener('input', updateCharCount);

    // Set up event listener for save button
    saveButton.addEventListener('click', saveEntry);

    // Initialize displays
    updateMoodDisplay();
    updateAttributeDisplays();
    updateCharCount();

    // Load today's entry if it exists
    loadTodayEntry();

    // Set up scroll animations
    setupScrollAnimations();
    setupBackToTop();

    // Add ripple effect to save button
    saveButton.addEventListener('mousedown', addRippleEffect);

    // Add some sample data for demonstration (you can remove this)
    addSampleData();
}

// ============================================
// SAMPLE DATA (for demonstration)
// ============================================

/**
 * Add some sample entries to show how the app works
 * You can remove this function once you start using the app!
 */
function addSampleData() {
    // Only add sample data if there are no entries
    if (moodEntries.length > 0) return;

    const today = new Date();
    
    // Create sample entries for the past few days
    const sampleEntries = [
        {
            daysAgo: 1,
            overallMood: 8,
            attributes: { energy: 7, sleep: 8, stress: 3, productivity: 9, social: 7 },
            notes: 'Great day! Finished all my tasks and had a nice walk in the evening.'
        },
        {
            daysAgo: 2,
            overallMood: 6,
            attributes: { energy: 5, sleep: 6, stress: 6, productivity: 7, social: 5 },
            notes: 'Okay day, felt a bit tired but managed to stay productive.'
        },
        {
            daysAgo: 3,
            overallMood: 9,
            attributes: { energy: 9, sleep: 9, stress: 2, productivity: 8, social: 9 },
            notes: 'Amazing day! Spent time with friends and felt really energized.'
        },
        {
            daysAgo: 4,
            overallMood: 5,
            attributes: { energy: 4, sleep: 5, stress: 7, productivity: 5, social: 4 },
            notes: 'Challenging day with some stressful moments.'
        },
        {
            daysAgo: 5,
            overallMood: 7,
            attributes: { energy: 6, sleep: 7, stress: 4, productivity: 7, social: 6 },
            notes: 'Good day overall, feeling balanced.'
        }
    ];

    // Create entries with proper dates
    sampleEntries.forEach(sample => {
        const entryDate = new Date(today);
        entryDate.setDate(entryDate.getDate() - sample.daysAgo);
        const dateString = entryDate.toISOString().split('T')[0];

        moodEntries.push({
            date: dateString,
            overallMood: sample.overallMood,
            attributes: sample.attributes,
            notes: sample.notes
        });
    });

    // Sort entries
    moodEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // No need to display anything initially - tabs handle it
}

// ============================================
// START THE APP!
// ============================================

// Wait for the page to fully load, then initialize
document.addEventListener('DOMContentLoaded', initializeApp);

/* ============================================
   CONGRATULATIONS!
   
   You've just created your first web app! 🎉
   
   Here's what you learned:
   - HTML structure and elements
   - CSS styling and design
   - JavaScript variables and functions
   - Event listeners (click, input)
   - Working with dates
   - Creating dynamic content
   
   Next steps:
   1. Remove the sample data function
   2. Customize the colors and design
   3. Add more features (export data, charts, etc.)
   4. Share your progress on GitHub!
   
   Keep coding! 💪
   ============================================ */