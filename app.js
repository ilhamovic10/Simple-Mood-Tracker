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

// ============================================
// GET ELEMENTS FROM HTML
// ============================================

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
    return emojis[rating] || '😐';
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

        // Update the display
        displayHistory();
        displayStats();
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
// DISPLAY HISTORY
// ============================================

/**
 * Display the mood history (last 7 days)
 */
function displayHistory() {
    // Clear the container
    historyContainer.innerHTML = '';

    // If no entries, show empty state
    if (moodEntries.length === 0) {
        historyContainer.innerHTML = '<p class="empty-state">No entries yet. Start tracking your mood today!</p>';
        return;
    }

    // Show only last 7 entries
    const recentEntries = moodEntries.slice(0, 7);

    // Create a card for each entry
    recentEntries.forEach((entry, index) => {
        const card = createHistoryCard(entry);
        card.style.transitionDelay = `${index * 0.1}s`;
        historyContainer.appendChild(card);
    });

    // Re-observe new cards for scroll animation
    setTimeout(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.history-card').forEach(el => {
            observer.observe(el);
        });
    }, 100);
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

/**
 * Display weekly statistics
 */
function displayStats() {
    if (moodEntries.length === 0) {
        statsSection.style.display = 'none';
        return;
    }

    statsSection.style.display = 'block';

    // Calculate average mood for last 7 days
    const recentEntries = moodEntries.slice(0, 7);
    const totalMood = recentEntries.reduce((sum, entry) => sum + entry.overallMood, 0);
    const avgMood = (totalMood / recentEntries.length).toFixed(1);

    // Update displays
    avgMoodDisplay.textContent = avgMood;
    avgEmojiDisplay.textContent = getMoodEmoji(parseFloat(avgMood));
    totalEntriesDisplay.textContent = moodEntries.length;
}

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
 * Handle header shrink on scroll
 */
function setupHeaderScroll() {
    const header = document.getElementById('mainHeader');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
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

    // Display history and stats
    displayHistory();
    displayStats();

    // Set up scroll animations
    setupScrollAnimations();
    setupHeaderScroll();
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

    // Display the sample data
    displayHistory();
    displayStats();

    // Re-setup scroll animations for new elements
    setTimeout(setupScrollAnimations, 100);
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