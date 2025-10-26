/* ============================================
   SIMPLE MOOD TRACKER - PERFORMANCE OPTIMIZED
   DOM Caching | Debouncing | RAF | Lazy Loading
   ============================================ */

/* ============================================
   PERFORMANCE UTILITIES
   ============================================ */

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// DOM Cache for frequently accessed elements
const DOM = {
    loginScreen: null,
    appContainer: null,
    currentUserAvatar: null,
    currentUserName: null,
    userCards: null,
    historyList: null,
    moodGraph: null,
    initialized: false
};

function initDOMCache() {
    if (DOM.initialized) return;
    
    DOM.loginScreen = document.getElementById('loginScreen');
    DOM.appContainer = document.getElementById('appContainer');
    DOM.currentUserAvatar = document.getElementById('currentUserAvatar');
    DOM.currentUserName = document.getElementById('currentUserName');
    DOM.userCards = document.getElementById('userCards');
    DOM.historyList = document.getElementById('historyList');
    DOM.moodGraph = document.getElementById('moodGraph');
    
    DOM.initialized = true;
    console.log('✅ DOM cache initialized');
}

/* ============================================
   THEME MANAGEMENT SYSTEM
   ============================================ */

let currentTheme = 'system'; // default

// Initialize theme on page load (before DOM loads)
function initTheme() {
    // Check if theme was previously saved (in variable, since we can't use localStorage)
    // For now, default to system
    currentTheme = 'system';
    applyTheme(currentTheme);
}

// Apply theme to document
function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'system') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', theme);
    }
    
    currentTheme = theme;
}

// Update active state of theme buttons
function updateThemeButtons() {
    // Update all theme buttons (login and main app)
    document.querySelectorAll('.theme-btn, .theme-btn-mini').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === currentTheme) {
            btn.classList.add('active');
        }
    });
}

// Setup theme button listeners
function setupThemeListeners() {
    document.querySelectorAll('.theme-btn, .theme-btn-mini').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            applyTheme(theme);
            updateThemeButtons();
        });
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });
}

// Initialize theme immediately (critical)
initTheme();

// ============================================
// USER MANAGEMENT SYSTEM
// ============================================
let users = [];
let currentUser = null;
const MAX_USERS = 5;

// ============================================
// DATA STORAGE - COMPLETE PER-USER ISOLATION
// ============================================
// CRITICAL: Each user has their own separate data storage
// Format: allUserData = { userId: [entries], userId2: [entries2], ... }
// NO shared data between users - complete isolation enforced
let allUserData = {}; // Stores mood entries for each user: { userId: [entries] }
let moodEntries = []; // Current user's entries ONLY (loaded from allUserData)
let selectedMood = null;
let currentPeriod = 'daily';
let currentFilter = 'all';

// ============================================
// DOM ELEMENTS
// ============================================
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const emojiButtons = document.querySelectorAll('.emoji-button');
const submitButton = document.getElementById('submitMoodBtn');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitMoodBtn');
const currentDateEl = document.getElementById('currentDate');
const notesInput = document.getElementById('notesInput');
const charCount = document.getElementById('charCount');

// Sliders
const energySlider = document.getElementById('energySlider');
const sleepSlider = document.getElementById('sleepSlider');
const stressSlider = document.getElementById('stressSlider');
const productivitySlider = document.getElementById('productivitySlider');
const socialSlider = document.getElementById('socialSlider');

// Slider values
const energyValue = document.getElementById('energyValue');
const sleepValue = document.getElementById('sleepValue');
const stressValue = document.getElementById('stressValue');
const productivityValue = document.getElementById('productivityValue');
const socialValue = document.getElementById('socialValue');

// Stats elements
const periodButtons = document.querySelectorAll('.period-button');
const moodGraph = document.getElementById('moodGraph');
const graphEmpty = document.getElementById('graphEmpty');
const weeklyAvg = document.getElementById('weeklyAvg');
const monthlyAvg = document.getElementById('monthlyAvg');
const weeklyEmoji = document.getElementById('weeklyEmoji');
const monthlyEmoji = document.getElementById('monthlyEmoji');
const streakValue = document.getElementById('streakValue');
const totalValue = document.getElementById('totalValue');
const attributeBars = document.getElementById('attributeBars');

// History elements
const filterChips = document.querySelectorAll('.filter-chip');
const historyList = document.getElementById('historyList');
const historyEmpty = document.getElementById('historyEmpty');

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getTodayDate() {
  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  return today.toLocaleDateString('en-US', options);
}

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function getMoodEmoji(value) {
  if (value <= 2) return '😢';
  if (value <= 4) return '😔';
  if (value <= 6) return '😐';
  if (value <= 8) return '😊';
  return '😍';
}

function getMoodLabel(value) {
  if (value <= 2) return 'Very Difficult';
  if (value <= 4) return 'Challenging';
  if (value <= 6) return 'Okay';
  if (value <= 8) return 'Good';
  return 'Excellent';
}

// ============================================
// TIME FORMATTING FUNCTIONS
// ============================================

/**
 * Format time for display (24-hour format HH:MM:SS)
 */
function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr; // Already in HH:MM:SS format
}

/**
 * Format time with shorter version (HH:MM)
 */
function formatTimeShort(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5); // Extract HH:MM from HH:MM:SS
}

/**
 * Format date and time together
 */
function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return '';
  
  const date = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  if (timeStr) {
    return `${month} ${day}, ${year} at ${formatTimeShort(timeStr)}`;
  }
  return `${month} ${day}, ${year}`;
}

/**
 * Get time of day label
 */
function getTimeOfDay(timeStr) {
  if (!timeStr) return '';
  
  const hour = parseInt(timeStr.split(':')[0]);
  
  if (hour >= 5 && hour < 12) return '🌅 Morning';
  if (hour >= 12 && hour < 17) return '☀️ Afternoon';
  if (hour >= 17 && hour < 21) return '🌆 Evening';
  return '🌙 Night';
}

function calculateStreak() {
  if (moodEntries.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let currentDate = new Date(today);
  
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

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(tabName) {
  requestAnimationFrame(() => {
    // Batch DOM updates
    tabButtons.forEach(btn => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    // Schedule content updates
    if (tabName === 'stats') {
      updateStatistics();
      drawGraph();
    } else if (tabName === 'history') {
      displayHistory();
    }
  });
}

// Event delegation for tab buttons
function setupTabListeners() {
  const tabNav = document.querySelector('.tab-nav');
  if (tabNav) {
    tabNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-button');
      if (btn && btn.dataset.tab) {
        switchTab(btn.dataset.tab);
      }
    });
  }
}

// ============================================
// EMOJI SELECTION (Event Delegation)
// ============================================
function setupEmojiListeners() {
  const emojiGrid = document.querySelector('.emoji-grid');
  if (emojiGrid) {
    emojiGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.emoji-button');
      if (btn && btn.dataset.mood) {
        requestAnimationFrame(() => {
          emojiButtons.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedMood = {
            mood: btn.dataset.mood,
            value: parseInt(btn.dataset.value)
          };
        });
      }
    });
  }
}

// ============================================
// SLIDER UPDATES (Optimized with RAF)
// ============================================
function updateSliderValue(slider, display) {
  requestAnimationFrame(() => {
    display.textContent = slider.value;
  });
}

// Setup optimized slider listeners
function setupSliderListeners() {
  const sliders = [
    { slider: energySlider, display: energyValue },
    { slider: sleepSlider, display: sleepValue },
    { slider: stressSlider, display: stressValue },
    { slider: productivitySlider, display: productivityValue },
    { slider: socialSlider, display: socialValue }
  ];
  
  sliders.forEach(({ slider, display }) => {
    if (slider && display) {
      let rafId;
      slider.addEventListener('input', () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          display.textContent = slider.value;
        });
      }, { passive: true });
    }
  });
}

// ============================================
// NOTES CHARACTER COUNT (Debounced)
// ============================================
function setupNotesCounter() {
  if (notesInput && charCount) {
    const updateCharCount = debounce(() => {
      const length = notesInput.value.length;
      charCount.textContent = `${length}/200`;
    }, 50);
    
    notesInput.addEventListener('input', updateCharCount, { passive: true });
  }
}

// ============================================
// SUBMIT MOOD ENTRY (Optimized)
// ============================================
function submitMood() {
  console.log('=== SUBMIT MOOD CLICKED ===');
  // 1. Check user
  if (!currentUser) {
    alert('Please login first');
    console.error('❌ No user selected');
    return;
  }
  console.log('User check passed:', currentUser.name);
  
  // 2. Check mood selection
  if (!selectedMood) {
    alert('Please select a mood emoji');
    console.warn('⚠️ No mood selected');
    return;
  }
  console.log('Mood check passed:', selectedMood);
  
  // Add loading state
  if (submitButton) {
    submitButton.classList.add('loading');
    submitButton.disabled = true;
  }
  
  // Create entry immediately (no timeout for testing)
  console.log('📝 Creating entry...');
  
  // Get current date and time
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
  
  // 3. Get slider values
  const energy = parseInt(energySlider.value);
  const sleep = parseInt(sleepSlider.value);
  const stress = parseInt(stressSlider.value);
  const productivity = parseInt(productivitySlider.value);
  const social = parseInt(socialSlider.value);
  console.log('Sliders:', { energy, sleep, stress, productivity, social });
  
  // 4. Get notes
  const notes = notesInput.value.trim();
  console.log('Notes:', notes);
  
  // 5. Create entry with USER ID TAG and TIMESTAMP
  const entry = {
    id: `${currentUser.id}_${Date.now()}`,
    userId: currentUser.id,
    userName: currentUser.name,
    date: dateStr,
    time: timeStr,
    timestamp: now.toISOString(),
    mood: selectedMood.mood,
    value: selectedMood.value,
    attributes: {
      energy,
      sleep,
      stress,
      productivity,
      social
    },
    notes
  };
    
  console.log('Entry created:', entry);
  
  // 6. Update or add entry to CURRENT USER'S data
  const existingIndex = moodEntries.findIndex(e => e.date === entry.date);
  if (existingIndex !== -1) {
    if (moodEntries[existingIndex].userId && moodEntries[existingIndex].userId !== currentUser.id) {
      console.error('❌ Cannot update entry from different user!');
      return;
    }
    moodEntries[existingIndex] = entry;
    console.log('✏️ Updated existing entry');
  } else {
    moodEntries.push(entry);
    console.log('➕ Added new entry');
  }
  
  // 7. Sort entries
  moodEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 8. Save to current user's storage
  allUserData[currentUser.id] = moodEntries;
  console.log(`✅ Saved ${moodEntries.length} entries for ${currentUser.name}`);
  
  // 9. Show success message
  alert('Mood saved successfully!');
  if (successMessage) {
    successMessage.classList.add('show');
    setTimeout(() => successMessage.classList.remove('show'), 3000);
  }
  
  // 10. Reset form
  resetTrackingForm();
  
  // 11. Update displays
  const activeTab = document.querySelector('.tab-button.active')?.dataset.tab;
  if (activeTab === 'stats') {
    updateStatistics();
    drawGraph();
  } else if (activeTab === 'history') {
    displayHistory();
  }
  
  // 12. Remove loading state
  if (submitButton) {
    submitButton.classList.remove('loading');
    submitButton.disabled = false;
  }
  
  console.log('=== SUBMIT COMPLETE ===');
}

// Reset tracking form after submission
function resetTrackingForm() {
  console.log('🔄 Resetting form...');
  
  // Clear mood selection
  selectedMood = null;
  const emojiButtons = document.querySelectorAll('.emoji-btn');
  if (emojiButtons) {
    emojiButtons.forEach(btn => btn.classList.remove('selected'));
  }
  
  // Reset sliders to 5
  if (energySlider) energySlider.value = 5;
  if (sleepSlider) sleepSlider.value = 5;
  if (stressSlider) stressSlider.value = 5;
  if (productivitySlider) productivitySlider.value = 5;
  if (socialSlider) socialSlider.value = 5;
  
  // Update displays
  if (energyValue) energyValue.textContent = '5';
  if (sleepValue) sleepValue.textContent = '5';
  if (stressValue) stressValue.textContent = '5';
  if (productivityValue) productivityValue.textContent = '5';
  if (socialValue) socialValue.textContent = '5';
  
  // Clear notes
  if (notesInput) notesInput.value = '';
  if (charCount) charCount.textContent = '0/200';
  
  console.log('✅ Form reset complete');
}

// Setup submit button listener when DOM is ready
function setupSubmitButton() {
  const btn = document.getElementById('submitMoodBtn');
  if (btn) {
    console.log('✅ Submit button found, attaching listener');
    btn.addEventListener('click', submitMood);
  } else {
    console.error('❌ Submit button NOT found!');
  }
}

// ============================================
// STATISTICS
// ============================================
/**
 * Calculate time distribution
 */
function calculateTimeDistribution(entries) {
  const distribution = {
    morning: 0,   // 5:00 - 11:59
    afternoon: 0, // 12:00 - 16:59
    evening: 0,   // 17:00 - 20:59
    night: 0      // 21:00 - 4:59
  };
  
  entries.forEach(entry => {
    if (!entry.time) return;
    
    const hour = parseInt(entry.time.split(':')[0]);
    
    if (hour >= 5 && hour < 12) distribution.morning++;
    else if (hour >= 12 && hour < 17) distribution.afternoon++;
    else if (hour >= 17 && hour < 21) distribution.evening++;
    else distribution.night++;
  });
  
  return distribution;
}

// Optimized statistics with batched calculations
function updateStatistics() {
  requestAnimationFrame(() => {
    updateStatisticsInternal();
  });
}

function updateStatisticsInternal() {
  // CRITICAL: Statistics calculated ONLY from current user's data
  if (!currentUser) {
    console.warn('⚠️ No user selected - cannot show statistics');
    return;
  }
  
  console.log(`📊 Calculating statistics for ${currentUser.name} (${moodEntries.length} entries)`);
  
  if (moodEntries.length === 0) {
    weeklyAvg.textContent = '-';
    monthlyAvg.textContent = '-';
    weeklyEmoji.textContent = '😊';
    monthlyEmoji.textContent = '😊';
    streakValue.textContent = '0 days';
    totalValue.textContent = '0 days';
    attributeBars.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">No data yet. Start tracking!</p>';
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Weekly average
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEntries = moodEntries.filter(e => {
    const entryDate = new Date(e.date + 'T00:00:00');
    return entryDate >= weekAgo;
  });
  
  if (weekEntries.length > 0) {
    const weekAvg = weekEntries.reduce((sum, e) => sum + e.value, 0) / weekEntries.length;
    weeklyAvg.textContent = weekAvg.toFixed(1);
    weeklyEmoji.textContent = getMoodEmoji(Math.round(weekAvg));
  } else {
    weeklyAvg.textContent = '-';
    weeklyEmoji.textContent = '😊';
  }
  
  // Monthly average
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthEntries = moodEntries.filter(e => {
    const entryDate = new Date(e.date + 'T00:00:00');
    return entryDate >= monthAgo;
  });
  
  if (monthEntries.length > 0) {
    const monthAvg = monthEntries.reduce((sum, e) => sum + e.value, 0) / monthEntries.length;
    monthlyAvg.textContent = monthAvg.toFixed(1);
    monthlyEmoji.textContent = getMoodEmoji(Math.round(monthAvg));
  } else {
    monthlyAvg.textContent = '-';
    monthlyEmoji.textContent = '😊';
  }
  
  // Streak
  const streak = calculateStreak();
  streakValue.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
  
  // Total
  totalValue.textContent = `${moodEntries.length} day${moodEntries.length !== 1 ? 's' : ''}`;
  
  // Attribute bars
  updateAttributeBars();
  
  // Time distribution (if container exists)
  displayTimeDistribution();
}

/**
 * Display time distribution
 */
function displayTimeDistribution() {
  const container = document.getElementById('timeDistribution');
  if (!container) return;
  
  const distribution = calculateTimeDistribution(moodEntries);
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  if (total === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">No time data yet</p>';
    return;
  }
  
  container.innerHTML = `
    <h3 class="subsection-title">When do you track?</h3>
    <div class="time-dist-bars">
      <div class="time-bar">
        <div class="time-label">🌅 Morning (5:00-11:59)</div>
        <div class="time-bar-fill" style="width: ${(distribution.morning / total * 100)}%">
          ${distribution.morning}
        </div>
      </div>
      <div class="time-bar">
        <div class="time-label">☀️ Afternoon (12:00-16:59)</div>
        <div class="time-bar-fill" style="width: ${(distribution.afternoon / total * 100)}%">
          ${distribution.afternoon}
        </div>
      </div>
      <div class="time-bar">
        <div class="time-label">🌆 Evening (17:00-20:59)</div>
        <div class="time-bar-fill" style="width: ${(distribution.evening / total * 100)}%">
          ${distribution.evening}
        </div>
      </div>
      <div class="time-bar">
        <div class="time-label">🌙 Night (21:00-4:59)</div>
        <div class="time-bar-fill" style="width: ${(distribution.night / total * 100)}%">
          ${distribution.night}
        </div>
      </div>
    </div>
  `;
}

function updateAttributeBars() {
  const attributes = [
    { name: 'Energy Level', icon: '⚡', key: 'energy' },
    { name: 'Sleep Quality', icon: '😴', key: 'sleep' },
    { name: 'Stress Level', icon: '😰', key: 'stress' },
    { name: 'Productivity', icon: '✅', key: 'productivity' },
    { name: 'Social Connection', icon: '💬', key: 'social' }
  ];
  
  attributeBars.innerHTML = '';
  
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
    
    attributeBars.appendChild(barItem);
  });
}

// ============================================
// GRAPH DRAWING
// ============================================
// Optimized graph drawing with RAF
function drawGraph() {
  requestAnimationFrame(() => {
    drawGraphInternal();
  });
}

function drawGraphInternal() {
  // CRITICAL: Graph displays ONLY current user's mood trends
  if (!currentUser) {
    console.warn('⚠️ No user selected - cannot show graph');
    moodGraph.classList.remove('show');
    graphEmpty.classList.remove('hide');
    return;
  }
  
  console.log(`📈 Drawing graph for ${currentUser.name} (${moodEntries.length} entries)`);
  
  if (moodEntries.length === 0) {
    moodGraph.classList.remove('show');
    graphEmpty.classList.remove('hide');
    return;
  }
  
  moodGraph.classList.add('show');
  graphEmpty.classList.add('hide');
  
  const data = prepareGraphData();
  if (!data || data.values.length === 0) {
    moodGraph.classList.remove('show');
    graphEmpty.classList.remove('hide');
    return;
  }
  
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  
  moodGraph.innerHTML = '';
  
  // Draw grid lines
  for (let i = 0; i <= 10; i += 2) {
    const y = padding.top + graphHeight - (i / 10 * graphHeight);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padding.left);
    line.setAttribute('y1', y);
    line.setAttribute('x2', width - padding.right);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
    line.setAttribute('stroke-width', '1');
    if (i !== 0) line.setAttribute('stroke-dasharray', '4,4');
    moodGraph.appendChild(line);
    
    // Y-axis labels
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', padding.left - 10);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', 'var(--color-text-secondary)');
    label.textContent = i;
    moodGraph.appendChild(label);
  }
  
  // Calculate points
  const points = data.values.map((value, index) => {
    const x = padding.left + (index / Math.max(data.values.length - 1, 1)) * graphWidth;
    const y = padding.top + graphHeight - (value / 10 * graphHeight);
    return { x, y, value, label: data.labels[index] };
  });
  
  // Draw line
  if (points.length > 0) {
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('stroke', '#6C63FF');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    moodGraph.appendChild(path);
    
    // Draw area fill
    const areaD = pathD + 
      ` L ${points[points.length - 1].x} ${height - padding.bottom}` +
      ` L ${points[0].x} ${height - padding.bottom} Z`;
    
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaD);
    area.setAttribute('fill', 'rgba(108, 99, 255, 0.1)');
    moodGraph.appendChild(area);
    
    // Draw points
    points.forEach(point => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', '#6C63FF');
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '2');
      moodGraph.appendChild(circle);
    });
  }
  
  // Draw X-axis labels
  data.labels.forEach((label, index) => {
    const x = padding.left + (index / Math.max(data.labels.length - 1, 1)) * graphWidth;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', height - padding.bottom + 20);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', 'var(--color-text-secondary)');
    text.textContent = label;
    moodGraph.appendChild(text);
  });
}

function prepareGraphData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (currentPeriod === 'daily') {
    const labels = [];
    const values = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const entry = moodEntries.find(e => e.date === dateString);
      
      const dayLabel = i === 0 ? 'Today' : 
                     i === 1 ? 'Yesterday' : 
                     date.toLocaleDateString('en-US', { weekday: 'short' });
      
      labels.push(dayLabel);
      values.push(entry ? entry.value : 5);
    }
    
    return { labels, values };
    
  } else if (currentPeriod === 'weekly') {
    const labels = [];
    const values = [];
    
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      
      const weekEntries = moodEntries.filter(e => {
        const entryDate = new Date(e.date + 'T00:00:00');
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      
      const weekLabel = i === 0 ? 'This Week' : `${i}w ago`;
      labels.push(weekLabel);
      
      if (weekEntries.length > 0) {
        const avg = weekEntries.reduce((sum, e) => sum + e.value, 0) / weekEntries.length;
        values.push(parseFloat(avg.toFixed(1)));
      } else {
        values.push(5);
      }
    }
    
    return { labels, values };
    
  } else if (currentPeriod === 'monthly') {
    const labels = [];
    const values = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthEntries = moodEntries.filter(e => {
        const entryDate = new Date(e.date + 'T00:00:00');
        return entryDate >= monthDate && entryDate <= monthEnd;
      });
      
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short' });
      labels.push(monthLabel);
      
      if (monthEntries.length > 0) {
        const avg = monthEntries.reduce((sum, e) => sum + e.value, 0) / monthEntries.length;
        values.push(parseFloat(avg.toFixed(1)));
      } else {
        values.push(5);
      }
    }
    
    return { labels, values };
  }
}

// Event delegation for period buttons
function setupPeriodListeners() {
  const periodSelector = document.querySelector('.period-selector');
  if (periodSelector) {
    periodSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.period-button');
      if (btn && btn.dataset.period) {
        requestAnimationFrame(() => {
          periodButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentPeriod = btn.dataset.period;
          drawGraph();
        });
      }
    });
  }
}

// ============================================
// HISTORY
// ============================================
function displayHistory() {
  // CRITICAL: History displays ONLY current user's entries
  if (!currentUser) {
    console.warn('⚠️ No user selected - cannot show history');
    historyList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 40px;">Please select a user profile.</p>';
    return;
  }
  
  console.log(`📜 Displaying history for ${currentUser.name} (${moodEntries.length} entries)`);
  
  if (moodEntries.length === 0) {
    historyList.innerHTML = '';
    historyEmpty.classList.remove('hide');
    return;
  }
  
  historyEmpty.classList.add('hide');
  
  let filteredEntries = [...moodEntries];
  
  if (currentFilter === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    filteredEntries = filteredEntries.filter(e => {
      const entryDate = new Date(e.date + 'T00:00:00');
      return entryDate >= weekAgo;
    });
  } else if (currentFilter === 'month') {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    filteredEntries = filteredEntries.filter(e => {
      const entryDate = new Date(e.date + 'T00:00:00');
      return entryDate >= monthAgo;
    });
  } else if (currentFilter === 'good') {
    filteredEntries = filteredEntries.filter(e => e.value >= 7);
  } else if (currentFilter === 'tough') {
    filteredEntries = filteredEntries.filter(e => e.value <= 4);
  }
  
  if (filteredEntries.length === 0) {
    historyList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 40px;">No entries found for this filter.</p>';
    return;
  }
  
  historyList.innerHTML = '';
  
  // Use DocumentFragment for batch DOM insertion (performance optimization)
  const fragment = document.createDocumentFragment();
  
  filteredEntries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'history-card';
    
    // Format date and time
    const dateTimeStr = formatDateTime(entry.date, entry.time);
    const timeOfDay = getTimeOfDay(entry.time);
    
    card.innerHTML = `
      <div class="history-header">
        <div class="history-emoji">${getMoodEmoji(entry.value)}</div>
        <div class="history-info">
          <div class="history-date">${dateTimeStr}</div>
          ${entry.time ? `<div class="history-time-label">${timeOfDay}</div>` : ''}
        </div>
        <div class="history-mood-value">${entry.value}/10</div>
      </div>
      <div class="history-attributes">
        <div class="history-attr">
          <span class="history-attr-icon">⚡</span>
          <span class="history-attr-value">${entry.attributes.energy}</span>
        </div>
        <div class="history-attr">
          <span class="history-attr-icon">😴</span>
          <span class="history-attr-value">${entry.attributes.sleep}</span>
        </div>
        <div class="history-attr">
          <span class="history-attr-icon">😰</span>
          <span class="history-attr-value">${entry.attributes.stress}</span>
        </div>
        <div class="history-attr">
          <span class="history-attr-icon">✅</span>
          <span class="history-attr-value">${entry.attributes.productivity}</span>
        </div>
        <div class="history-attr">
          <span class="history-attr-icon">💬</span>
          <span class="history-attr-value">${entry.attributes.social}</span>
        </div>
      </div>
      ${entry.notes ? `<div class="history-notes">"${entry.notes}"</div>` : ''}
    `;
    fragment.appendChild(card);
  });
  
  historyList.appendChild(fragment);
}

// Event delegation for filter chips
function setupFilterListeners() {
  const filterContainer = document.querySelector('.history-filters');
  if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (chip && chip.dataset.filter) {
        requestAnimationFrame(() => {
          filterChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentFilter = chip.dataset.filter;
          displayHistory();
        });
      }
    });
  }
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

function initApp() {
  // Priority 1: Initialize theme FIRST (critical - no flash)
  initTheme();
  
  // Priority 2: Cache DOM elements
  initDOMCache();
  
  // Priority 3: Setup theme listeners
  setupThemeListeners();
  
  if (users.length === 0) {
    showLoginScreen(true); // Show "Create Profile" mode
  } else {
    showLoginScreen(false); // Show "Select Profile" mode
  }
  
  setupUserEventListeners();
  
  // Priority 4: Remove loading indicator
  removeLoadingIndicator();
  
  // Priority 5: Setup non-critical features with requestIdleCallback
  scheduleNonCriticalInit();
}

function removeLoadingIndicator() {
    const loader = document.getElementById('appLoading');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            loader.remove();
            document.body.classList.add('loaded');
            console.log('✨ App loaded and ready!');
        }, 300);
    }
}

function scheduleNonCriticalInit() {
    const runNonCritical = () => {
        // Setup optimized slider listeners
        setupSliderListeners();
        
        // Preload some calculations
        if (currentUser && moodEntries.length > 0) {
            console.log('📊 Preloading statistics...');
        }
        
        console.log('✅ Non-critical features initialized');
    };
    
    if ('requestIdleCallback' in window) {
        requestIdleCallback(runNonCritical, { timeout: 1000 });
    } else {
        setTimeout(runNonCritical, 100);
    }
}

function showLoginScreen(isFirstTime) {
  const loginScreen = DOM.loginScreen || document.getElementById('loginScreen');
  const appContainer = DOM.appContainer || document.getElementById('appContainer');
  
  if (loginScreen) loginScreen.style.display = 'flex';
  if (appContainer) appContainer.style.display = 'none';
  
  if (isFirstTime || users.length === 0) {
    // First time - show only create form
    document.getElementById('userList').style.display = 'none';
    document.getElementById('addUserSection').style.display = 'block';
    document.getElementById('addNewUserBtn').style.display = 'none';
    document.getElementById('addUserTitle').textContent = 'Create Your Profile';
    document.getElementById('cancelAddUserBtn').style.display = 'none';
  } else {
    // Show user list
    document.getElementById('userList').style.display = 'block';
    document.getElementById('addUserSection').style.display = 'none';
    
    // Show/hide add button based on user count
    if (users.length < MAX_USERS) {
      document.getElementById('addNewUserBtn').style.display = 'flex';
      document.getElementById('userLimitMessage').style.display = 'none';
    } else {
      document.getElementById('addNewUserBtn').style.display = 'none';
      document.getElementById('userLimitMessage').style.display = 'block';
    }
    
    renderUserCards();
  }
}

function renderUserCards() {
  const container = DOM.userCards || document.getElementById('userCards');
  if (!container) return;
  
  // Use DocumentFragment for batch insertion
  const fragment = document.createDocumentFragment();
  
  users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'user-card';
    
    // Get entry count for THIS USER ONLY
    const userEntries = allUserData[user.id] || [];
    const entryCount = userEntries.length;
    
    card.innerHTML = `
      <div class="user-info">
        <div class="user-card-avatar">${user.avatar}</div>
        <div class="user-card-details">
          <div class="user-card-name">${user.name}</div>
          <div class="user-card-stats">${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}</div>
        </div>
      </div>
      <button class="delete-user-btn" data-user-id="${user.id}">Delete</button>
    `;
    
    // Click card to select user
    card.querySelector('.user-info').addEventListener('click', () => {
      selectUser(user.id);
    });
    
    // Delete button
    card.querySelector('.delete-user-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteUser(user.id);
    });
    
    fragment.appendChild(card);
  });
  
  // Batch DOM update
  requestAnimationFrame(() => {
    container.innerHTML = '';
    container.appendChild(fragment);
  });
}

function createUser() {
  const nameInput = document.getElementById('usernameInput');
  const name = nameInput.value.trim();
  
  if (!name) {
    alert('Please enter your name');
    return;
  }
  
  if (users.length >= MAX_USERS) {
    alert('Maximum 5 users allowed. Please delete a user first.');
    return;
  }
  
  const newUser = {
    id: Date.now().toString(),
    name: name,
    avatar: getRandomAvatar(),
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  allUserData[newUser.id] = []; // Initialize empty mood entries for this user
  selectUser(newUser.id);
  nameInput.value = '';
}

function selectUser(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) {
    console.error('❌ User not found:', userId);
    return;
  }
  
  // CRITICAL: Save previous user's data before switching
  if (currentUser && currentUser.id !== userId) {
    console.log(`💾 Saving data for previous user: ${currentUser.name}`);
    allUserData[currentUser.id] = moodEntries;
  }
  
  // Set new current user
  currentUser = user;
  console.log(`👤 Selected user: ${user.name} (ID: ${user.id})`);
  
  // LOAD ONLY THIS USER'S DATA - Complete isolation
  moodEntries = allUserData[user.id] || [];
  console.log(`📊 Loaded ${moodEntries.length} entries for ${user.name}`);
  
  // Verify data isolation - ensure all entries belong to current user
  const invalidEntries = moodEntries.filter(e => e.userId && e.userId !== user.id);
  if (invalidEntries.length > 0) {
    console.error('⚠️ WARNING: Found entries from different user! Filtering...');
    moodEntries = moodEntries.filter(e => !e.userId || e.userId === user.id);
  }
  
  // Show main app (using cached DOM)
  const loginScreen = DOM.loginScreen || document.getElementById('loginScreen');
  const appContainer = DOM.appContainer || document.getElementById('appContainer');
  const userAvatar = DOM.currentUserAvatar || document.getElementById('currentUserAvatar');
  const userName = DOM.currentUserName || document.getElementById('currentUserName');
  
  if (loginScreen) loginScreen.style.display = 'none';
  if (appContainer) appContainer.style.display = 'block';
  
  // Update user display
  if (userAvatar) userAvatar.textContent = user.avatar;
  if (userName) userName.textContent = user.name;
  
  // Initialize app with user's data
  init();
  
  // Update theme buttons after user selection
  updateThemeButtons();
}

function deleteUser(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;
  
  if (!confirm(`Are you sure you want to delete ${user.name}'s profile? All mood data will be permanently lost.`)) {
    return;
  }
  
  console.log(`🗑️ Deleting user: ${user.name} (ID: ${userId})`);
  
  // Remove user from list
  users = users.filter(u => u.id !== userId);
  
  // CRITICAL: Delete user's isolated data storage
  const entryCount = allUserData[userId] ? allUserData[userId].length : 0;
  delete allUserData[userId];
  console.log(`✅ Deleted ${entryCount} entries for ${user.name}`);
  
  // If current user was deleted, clear and logout
  if (currentUser && currentUser.id === userId) {
    console.log('Current user deleted - logging out');
    currentUser = null;
    moodEntries = [];
    selectedMood = null;
  }
  
  // Refresh display
  if (users.length === 0) {
    showLoginScreen(true);
  } else {
    showLoginScreen(false);
  }
}

function switchUser() {
  console.log('🔄 Switching user - logging out current user');
  
  // CRITICAL: Save current user's data before switching
  if (currentUser) {
    console.log(`💾 Saving ${moodEntries.length} entries for ${currentUser.name}`);
    allUserData[currentUser.id] = moodEntries;
  }
  
  // CLEAR current user data from memory - complete isolation
  currentUser = null;
  moodEntries = []; // Clear all entries from memory
  selectedMood = null;
  
  // Reset form
  emojiButtons.forEach(btn => btn.classList.remove('selected'));
  energySlider.value = 5;
  sleepSlider.value = 5;
  stressSlider.value = 5;
  productivitySlider.value = 5;
  socialSlider.value = 5;
  updateSliderValue(energySlider, energyValue);
  updateSliderValue(sleepSlider, sleepValue);
  updateSliderValue(stressSlider, stressValue);
  updateSliderValue(productivitySlider, productivityValue);
  updateSliderValue(socialSlider, socialValue);
  notesInput.value = '';
  charCount.textContent = '0/200';
  
  console.log('✅ User data cleared from memory - ready for new user');
  
  showLoginScreen(false);
}

function getRandomAvatar() {
  const avatars = ['😊', '🙂', '😎', '🤗', '😌', '🥳', '😇', '🤓', '😋', '🥰'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

function setupUserEventListeners() {
  // Create user button
  document.getElementById('createUserBtn').addEventListener('click', createUser);
  
  // Username input - Enter key
  document.getElementById('usernameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createUser();
  });
  
  // Add new user button
  document.getElementById('addNewUserBtn').addEventListener('click', () => {
    document.getElementById('userList').style.display = 'none';
    document.getElementById('addUserSection').style.display = 'block';
    document.getElementById('addNewUserBtn').style.display = 'none';
    document.getElementById('cancelAddUserBtn').style.display = 'block';
    document.getElementById('addUserTitle').textContent = 'Add New User';
  });
  
  // Cancel add user
  document.getElementById('cancelAddUserBtn').addEventListener('click', () => {
    document.getElementById('usernameInput').value = '';
    showLoginScreen(false);
  });
  
  // Switch user button
  document.getElementById('switchUserBtn').addEventListener('click', switchUser);
}

// ============================================
// LIVE CLOCK UPDATE
// ============================================

/**
 * Update current date and time display (Optimized with RAF)
 */
function updateCurrentDateTime() {
  requestAnimationFrame(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
      dateElement.innerHTML = `
        <div class="date-display">${dateStr}</div>
        <div class="time-display">${timeStr}</div>
      `;
    }
  });
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
  // Critical: Update current date/time
  updateCurrentDateTime();
  
  // Update time every second (throttled)
  setInterval(updateCurrentDateTime, 1000);
  
  // Setup event listeners
  setupTabListeners();
  setupEmojiListeners();
  setupPeriodListeners();
  setupFilterListeners();
  setupSubmitButton();
  setupNotesCounter();
  
  // Schedule non-critical initialization
  const scheduleInit = () => {
    // Add sample data for current user if they don't have any
    if (moodEntries.length === 0) {
      addSampleData();
    }
    
    // Load today's entry if exists
    loadTodayEntry();
  };
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(scheduleInit);
  } else {
    setTimeout(scheduleInit, 50);
  }
}

function loadTodayEntry() {
  const todayDate = getTodayDateString();
  const todayEntry = moodEntries.find(e => e.date === todayDate);
  
  if (todayEntry) {
    const moodButton = document.querySelector(`[data-mood="${todayEntry.mood}"]`);
    if (moodButton) {
      moodButton.classList.add('selected');
      selectedMood = {
        mood: todayEntry.mood,
        value: todayEntry.value
      };
    }
    
    energySlider.value = todayEntry.attributes.energy;
    sleepSlider.value = todayEntry.attributes.sleep;
    stressSlider.value = todayEntry.attributes.stress;
    productivitySlider.value = todayEntry.attributes.productivity;
    socialSlider.value = todayEntry.attributes.social;
    
    updateSliderValue(energySlider, energyValue);
    updateSliderValue(sleepSlider, sleepValue);
    updateSliderValue(stressSlider, stressValue);
    updateSliderValue(productivitySlider, productivityValue);
    updateSliderValue(socialSlider, socialValue);
    
    notesInput.value = todayEntry.notes || '';
    charCount.textContent = `${(todayEntry.notes || '').length}/200`;
    
    // Update submit button text if entry exists
    submitButton.textContent = 'Update Today\'s Entry';
  } else {
    submitButton.textContent = 'Submit Mood';
  }
}

function addSampleData() {
  // Only add sample data if no entries exist for this user
  if (!currentUser || moodEntries.length > 0) return;
  
  const today = new Date();
  
  const sampleEntries = [
    { daysAgo: 1, mood: 'happy', value: 8, energy: 7, sleep: 8, stress: 3, productivity: 9, social: 7, notes: 'Great day at work!', hour: 14, minute: 30 },
    { daysAgo: 2, mood: 'neutral', value: 6, energy: 5, sleep: 6, stress: 6, productivity: 7, social: 5, notes: 'Okay day overall.', hour: 18, minute: 15 },
    { daysAgo: 3, mood: 'excited', value: 9, energy: 9, sleep: 9, stress: 2, productivity: 8, social: 9, notes: 'Amazing weekend!', hour: 10, minute: 45 },
    { daysAgo: 4, mood: 'anxious', value: 4, energy: 4, sleep: 5, stress: 8, productivity: 5, social: 4, notes: 'Stressful day.', hour: 20, minute: 0 },
    { daysAgo: 5, mood: 'happy', value: 7, energy: 6, sleep: 7, stress: 4, productivity: 7, social: 6, notes: 'Good balance today.', hour: 8, minute: 20 }
  ];
  
  sampleEntries.forEach(sample => {
    const entryDate = new Date(today);
    entryDate.setDate(entryDate.getDate() - sample.daysAgo);
    entryDate.setHours(sample.hour, sample.minute, Math.floor(Math.random() * 60));
    const dateString = entryDate.toISOString().split('T')[0];
    const timeString = entryDate.toTimeString().split(' ')[0];
    
    moodEntries.push({
      id: `${currentUser.id}_sample_${sample.daysAgo}`,
      userId: currentUser.id,
      userName: currentUser.name,
      date: dateString,
      time: timeString,
      timestamp: entryDate.toISOString(),
      mood: sample.mood,
      value: sample.value,
      attributes: {
        energy: sample.energy,
        sleep: sample.sleep,
        stress: sample.stress,
        productivity: sample.productivity,
        social: sample.social
      },
      notes: sample.notes
    });
  });
  
  moodEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Save sample data to user's storage
  if (currentUser) {
    allUserData[currentUser.id] = moodEntries;
  }
}

// Start the app with optimized initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Simple Mood Tracker...');
  
  // Priority-based initialization
  // 1. Critical: Theme (prevent flash)
  // 2. Critical: DOM cache
  // 3. Critical: User system
  // 4. Non-critical: Features, animations
  
  initApp();
  
  // Update theme buttons after DOM loads
  requestAnimationFrame(() => {
    updateThemeButtons();
  });
  
  console.log('✅ App initialization complete');
});

/* ============================================
   Congratulations! 🎉
   
   Your Simple Mood Tracker is ready!
   
   Features:
   ✓ Emoji-based mood selection
   ✓ 5 attribute sliders
   ✓ Optional notes
   ✓ Beautiful line graph
   ✓ Statistics with averages & streak
   ✓ History with filters
   ✓ Fully responsive
   ✓ Accessible
   
   Ready to deploy to GitHub!
   ============================================ */