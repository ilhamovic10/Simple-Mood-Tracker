/* ============================================
   SIMPLE MOOD TRACKER - JAVASCRIPT
   Full functionality with in-memory storage
   ============================================ */

// ============================================
// DATA STORAGE (In-Memory)
// ============================================
let moodEntries = [];
let selectedMood = null;
let currentPeriod = 'daily';
let currentFilter = 'all';

// ============================================
// DOM ELEMENTS
// ============================================
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const emojiButtons = document.querySelectorAll('.emoji-button');
const submitButton = document.getElementById('submitMood');
const successMessage = document.getElementById('successMessage');
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
  tabButtons.forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });
  
  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
  
  if (tabName === 'stats') {
    updateStatistics();
    drawGraph();
  } else if (tabName === 'history') {
    displayHistory();
  }
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ============================================
// EMOJI SELECTION
// ============================================
emojiButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    emojiButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMood = {
      mood: btn.dataset.mood,
      value: parseInt(btn.dataset.value)
    };
  });
});

// ============================================
// SLIDER UPDATES
// ============================================
function updateSliderValue(slider, display) {
  display.textContent = slider.value;
}

energySlider.addEventListener('input', () => updateSliderValue(energySlider, energyValue));
sleepSlider.addEventListener('input', () => updateSliderValue(sleepSlider, sleepValue));
stressSlider.addEventListener('input', () => updateSliderValue(stressSlider, stressValue));
productivitySlider.addEventListener('input', () => updateSliderValue(productivitySlider, productivityValue));
socialSlider.addEventListener('input', () => updateSliderValue(socialSlider, socialValue));

// ============================================
// NOTES CHARACTER COUNT
// ============================================
notesInput.addEventListener('input', () => {
  const length = notesInput.value.length;
  charCount.textContent = `${length}/200`;
});

// ============================================
// SUBMIT MOOD ENTRY
// ============================================
submitButton.addEventListener('click', () => {
  if (!selectedMood) {
    alert('Please select a mood emoji first!');
    return;
  }
  
  submitButton.classList.add('loading');
  submitButton.disabled = true;
  
  setTimeout(() => {
    const entry = {
      date: getTodayDateString(),
      mood: selectedMood.mood,
      value: selectedMood.value,
      attributes: {
        energy: parseInt(energySlider.value),
        sleep: parseInt(sleepSlider.value),
        stress: parseInt(stressSlider.value),
        productivity: parseInt(productivitySlider.value),
        social: parseInt(socialSlider.value)
      },
      notes: notesInput.value.trim()
    };
    
    const existingIndex = moodEntries.findIndex(e => e.date === entry.date);
    if (existingIndex !== -1) {
      moodEntries[existingIndex] = entry;
    } else {
      moodEntries.push(entry);
    }
    
    moodEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    submitButton.classList.remove('loading');
    submitButton.disabled = false;
    
    successMessage.classList.add('show');
    setTimeout(() => successMessage.classList.remove('show'), 3000);
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 800);
});

// ============================================
// STATISTICS
// ============================================
function updateStatistics() {
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
function drawGraph() {
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

periodButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    periodButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPeriod = btn.dataset.period;
    drawGraph();
  });
});

// ============================================
// HISTORY
// ============================================
function displayHistory() {
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
  
  filteredEntries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-header">
        <div class="history-emoji">${getMoodEmoji(entry.value)}</div>
        <div class="history-info">
          <div class="history-date">${formatDate(entry.date)}</div>
          <div class="history-mood">
            <span class="history-mood-value">${entry.value}/10</span> - ${getMoodLabel(entry.value)}
          </div>
        </div>
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
    historyList.appendChild(card);
  });
}

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    displayHistory();
  });
});

// ============================================
// INITIALIZATION
// ============================================
function init() {
  currentDateEl.textContent = getTodayDate();
  
  // Add sample data
  addSampleData();
  
  // Load today's entry if exists
  loadTodayEntry();
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
    
    notesInput.value = todayEntry.notes;
    charCount.textContent = `${todayEntry.notes.length}/200`;
  }
}

function addSampleData() {
  const today = new Date();
  
  const sampleEntries = [
    { daysAgo: 1, mood: 'happy', value: 8, energy: 7, sleep: 8, stress: 3, productivity: 9, social: 7, notes: 'Great day at work!' },
    { daysAgo: 2, mood: 'neutral', value: 6, energy: 5, sleep: 6, stress: 6, productivity: 7, social: 5, notes: 'Okay day overall.' },
    { daysAgo: 3, mood: 'excited', value: 9, energy: 9, sleep: 9, stress: 2, productivity: 8, social: 9, notes: 'Amazing weekend!' },
    { daysAgo: 4, mood: 'anxious', value: 4, energy: 4, sleep: 5, stress: 8, productivity: 5, social: 4, notes: 'Stressful day.' },
    { daysAgo: 5, mood: 'happy', value: 7, energy: 6, sleep: 7, stress: 4, productivity: 7, social: 6, notes: 'Good balance today.' }
  ];
  
  sampleEntries.forEach(sample => {
    const entryDate = new Date(today);
    entryDate.setDate(entryDate.getDate() - sample.daysAgo);
    const dateString = entryDate.toISOString().split('T')[0];
    
    moodEntries.push({
      date: dateString,
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
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

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