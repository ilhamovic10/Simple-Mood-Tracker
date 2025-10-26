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

// Current view settings (global)
let currentPeriod = 'daily';
let currentSortBy = 'newest';
let currentFilter = 'all';
let currentSearchTerm = '';

// ============================================
// GET ELEMENTS FROM HTML
// ============================================

// Tab elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Graph elements
const periodButtons = document.querySelectorAll('.period-button');

// Line graph elements
const lineGraphSvg = document.querySelector('.line-graph');
const moodLine = document.getElementById('moodLine');
const areaFill = document.getElementById('areaFill');
const dataPoints = document.getElementById('dataPoints');
const gridLines = document.getElementById('gridLines');
const xAxisLabels = document.getElementById('xAxisLabels');
const yAxisLabels = document.getElementById('yAxisLabels');
const lineTooltip = document.getElementById('lineTooltip');
const lineGraphEmpty = document.getElementById('lineGraphEmpty');

// Statistics elements
const weeklyAvgDisplay = document.getElementById('weeklyAvg');
const monthlyAvgDisplay = document.getElementById('monthlyAvg');
const streakDisplay = document.getElementById('streakCount');
const totalTrackedDisplay = document.getElementById('totalTracked');
const attributeBarsContainer = document.getElementById('attributeBars');

// History controls
const sortBySelect = document.getElementById('sortBy');
const filterChips = document.querySelectorAll('.filter-chip');
const searchInput = document.getElementById('searchHistory');

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
        console.log('📊 Initializing Statistics tab');
        // Update statistics cards (ONLY in Statistics tab)
        updateStatistics();
        
        // Load line graph
        console.log('📈 Loading line graph');
        const graphData = prepareGraphData(currentPeriod);
        drawLineGraph(graphData, currentPeriod);
    } else if (tabName === 'history') {
        // Display history entries (no statistics here)
        displayHistory();
    }
    // Track Today tab has no statistics - just the entry form
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
            const graphData = prepareGraphData(currentPeriod);
            drawLineGraph(graphData, currentPeriod);
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
 * Draw line graph using SVG - SIMPLIFIED AND RELIABLE
 */
function drawLineGraph(graphData, period) {
    console.log('🎨 Drawing line graph with data:', graphData);
    
    // Clear existing elements
    dataPoints.innerHTML = '';
    gridLines.innerHTML = '';
    xAxisLabels.innerHTML = '';
    yAxisLabels.innerHTML = '';
    
    // Validate data
    if (!graphData || !graphData.data || graphData.data.length === 0) {
        console.warn('⚠️ No graph data available');
        showLineGraphEmpty();
        return;
    }
    
    // Filter valid data points
    const validData = [];
    graphData.data.forEach((value, index) => {
        if (value !== null && value >= 1 && value <= 10) {
            validData.push({ 
                value, 
                index, 
                label: graphData.labels[index],
                date: graphData.labels[index]
            });
        }
    });
    
    console.log('✅ Valid data points:', validData.length);
    
    if (validData.length === 0) {
        console.warn('⚠️ No valid data points to display');
        showLineGraphEmpty();
        return;
    }
    
    // Hide empty state, show graph
    hideLineGraphEmpty();
    if (lineGraphSvg) lineGraphSvg.style.display = 'block';
    
    // SVG dimensions
    const width = 800;
    const height = 400;
    const padding = { top: 30, right: 40, bottom: 50, left: 60 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;
    
    console.log('📐 Graph dimensions:', { width, height, graphWidth, graphHeight });
    
    // Draw grid lines and Y-axis labels (mood scale 1-10)
    for (let i = 1; i <= 10; i++) {
        const y = padding.top + graphHeight - ((i - 1) / 9 * graphHeight);
        
        // Grid line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', Math.round(y));
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', Math.round(y));
        line.setAttribute('stroke', 'rgba(167, 169, 169, 0.2)');
        line.setAttribute('stroke-width', '1');
        if (i !== 1 && i !== 10) {
            line.setAttribute('stroke-dasharray', '4,4');
        }
        gridLines.appendChild(line);
        
        // Y-axis label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', padding.left - 10);
        label.setAttribute('y', Math.round(y) + 4);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('font-size', '12');
        label.setAttribute('fill', 'var(--color-text-secondary)');
        label.textContent = i;
        yAxisLabels.appendChild(label);
    }
    
    // Calculate coordinates for all valid data points
    const totalPoints = graphData.data.length;
    const points = validData.map((item) => {
        const x = padding.left + (item.index / Math.max(totalPoints - 1, 1)) * graphWidth;
        const y = padding.top + graphHeight - ((item.value - 1) / 9 * graphHeight);
        return { 
            x: Math.round(x), 
            y: Math.round(y), 
            value: item.value, 
            label: item.label,
            date: item.date
        };
    });
    
    console.log('📍 Generated points:', points);
    
    // Create SIMPLE LINEAR path (no complex curves)
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    
    console.log('📈 Path D:', pathD);
    
    // Create area fill path
    const areaPathD = pathD + 
        ` L ${points[points.length - 1].x} ${height - padding.bottom}` + 
        ` L ${points[0].x} ${height - padding.bottom} Z`;
    
    // Update line path
    if (moodLine) {
        moodLine.setAttribute('d', pathD);
        
        // Determine line color based on average mood
        const avgMood = points.reduce((sum, p) => sum + p.value, 0) / points.length;
        let lineColor = '#21808D';
        if (avgMood <= 4) lineColor = '#FF6B6B';
        else if (avgMood <= 7) lineColor = '#FFD93D';
        else lineColor = '#21808D';
        
        moodLine.setAttribute('stroke', lineColor);
        moodLine.setAttribute('stroke-width', '3');
        moodLine.setAttribute('fill', 'none');
        moodLine.setAttribute('stroke-linecap', 'round');
        moodLine.setAttribute('stroke-linejoin', 'round');
        moodLine.style.display = 'block';
        
        console.log('✅ Line path updated with color:', lineColor);
    }
    
    // Update area fill
    if (areaFill) {
        areaFill.setAttribute('d', areaPathD);
        areaFill.style.display = 'block';
    }
    
    // Add data point circles
    points.forEach((point, idx) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', '6');
        
        // Color based on individual mood
        let pointColor = '#21808D';
        if (point.value <= 4) pointColor = '#FF6B6B';
        else if (point.value <= 7) pointColor = '#FFD93D';
        else pointColor = '#21808D';
        
        circle.setAttribute('fill', pointColor);
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '2');
        circle.style.cursor = 'pointer';
        circle.setAttribute('data-mood', point.value);
        circle.setAttribute('data-label', point.label);
        
        // Hover events
        circle.addEventListener('mouseenter', (e) => {
            showLineTooltip(point, e);
            circle.setAttribute('r', '8');
        });
        circle.addEventListener('mouseleave', () => {
            hideLineTooltip();
            circle.setAttribute('r', '6');
        });
        
        dataPoints.appendChild(circle);
    });
    
    console.log('✅ Added', points.length, 'data points');
    
    // Add X-axis labels
    graphData.labels.forEach((label, index) => {
        const x = padding.left + (index / Math.max(totalPoints - 1, 1)) * graphWidth;
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', Math.round(x));
        labelText.setAttribute('y', height - padding.bottom + 25);
        labelText.setAttribute('text-anchor', 'middle');
        labelText.setAttribute('font-size', '11');
        labelText.setAttribute('fill', 'var(--color-text-secondary)');
        labelText.textContent = label;
        xAxisLabels.appendChild(labelText);
    });
    
    console.log('✅ Line graph drawing complete!');
}

/**
 * Show empty state for line graph
 */
function showLineGraphEmpty() {
    if (lineGraphEmpty) {
        lineGraphEmpty.style.display = 'flex';
        lineGraphEmpty.classList.add('show');
    }
    if (lineGraphSvg) lineGraphSvg.style.display = 'none';
    if (moodLine) moodLine.style.display = 'none';
    if (areaFill) areaFill.style.display = 'none';
}

/**
 * Hide empty state for line graph
 */
function hideLineGraphEmpty() {
    if (lineGraphEmpty) {
        lineGraphEmpty.style.display = 'none';
        lineGraphEmpty.classList.remove('show');
    }
}

/**
 * Show tooltip for line graph data point
 */
function showLineTooltip(point, event) {
    if (!lineTooltip) return;
    
    const dateElement = lineTooltip.querySelector('.tooltip-date');
    const moodElement = lineTooltip.querySelector('.tooltip-mood');
    
    if (dateElement && moodElement) {
        dateElement.textContent = point.label || point.date;
        const emoji = getMoodEmoji(point.value);
        const moodLabel = getMoodLabel(point.value);
        moodElement.innerHTML = `<span style="font-size: 20px; margin-right: 8px;">${emoji}</span> ${point.value}/10 - ${moodLabel}`;
    }
    
    // Position tooltip using page coordinates
    const svgRect = lineGraphSvg.getBoundingClientRect();
    const tooltipX = svgRect.left + point.x;
    const tooltipY = svgRect.top + point.y;
    
    lineTooltip.style.left = `${tooltipX}px`;
    lineTooltip.style.top = `${tooltipY - 20}px`;
    lineTooltip.style.transform = 'translate(-50%, -100%)';
    lineTooltip.classList.add('show');
    
    console.log('📍 Tooltip shown for:', point);
}

/**
 * Hide line graph tooltip
 */
function hideLineTooltip() {
    lineTooltip.classList.remove('show');
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
    
    // Redraw line graph with new period
    const graphData = prepareGraphData(currentPeriod);
    drawLineGraph(graphData, currentPeriod);
}

// ============================================
// STATISTICS (ONLY IN STATISTICS TAB)
// ============================================

/**
 * Update all statistics displays
 * Note: Statistics cards are ONLY shown in the Statistics tab
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
    
    const weeklyAvgEmoji = document.getElementById('weeklyAvgEmoji');
    if (weekEntries.length > 0) {
        const weekAvg = weekEntries.reduce((sum, e) => sum + e.overallMood, 0) / weekEntries.length;
        weeklyAvgDisplay.textContent = weekAvg.toFixed(1);
        if (weeklyAvgEmoji) weeklyAvgEmoji.textContent = getMoodEmoji(Math.round(weekAvg));
    } else {
        weeklyAvgDisplay.textContent = '-';
        if (weeklyAvgEmoji) weeklyAvgEmoji.textContent = '😊';
    }
    
    // Calculate monthly average (last 30 days)
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const monthEntries = moodEntries.filter(e => {
        const entryDate = new Date(e.date + 'T00:00:00');
        return entryDate >= monthAgo;
    });
    
    const monthlyAvgEmoji = document.getElementById('monthlyAvgEmoji');
    if (monthEntries.length > 0) {
        const monthAvg = monthEntries.reduce((sum, e) => sum + e.overallMood, 0) / monthEntries.length;
        monthlyAvgDisplay.textContent = monthAvg.toFixed(1);
        if (monthlyAvgEmoji) monthlyAvgEmoji.textContent = getMoodEmoji(Math.round(monthAvg));
    } else {
        monthlyAvgDisplay.textContent = '-';
        if (monthlyAvgEmoji) monthlyAvgEmoji.textContent = '😊';
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
    
    // Date range and mood filter
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
        filteredEntries = filteredEntries.filter(e => e.overallMood >= 7);
    } else if (currentFilter === 'tough') {
        filteredEntries = filteredEntries.filter(e => e.overallMood <= 4);
    }
    
    // Apply search filter
    if (currentSearchTerm) {
        filteredEntries = filteredEntries.filter(e => {
            return e.notes && e.notes.toLowerCase().includes(currentSearchTerm.toLowerCase());
        });
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
 * Create a history card for an entry with large emoji
 */
function createHistoryCard(entry) {
    const card = document.createElement('div');
    card.className = `history-card ${getMoodColorClass(entry.overallMood)}`;

    // Header with large emoji, rating, and date
    const header = document.createElement('div');
    header.className = 'history-header';
    
    const daysAgo = getDaysAgo(entry.date);
    let dateLabel = formatDate(entry.date);
    if (daysAgo === 0) dateLabel += ' (Today)';
    else if (daysAgo === 1) dateLabel += ' (Yesterday)';
    
    const emoji = getMoodEmoji(entry.overallMood);
    const moodLabel = getMoodLabel(entry.overallMood);
    
    header.innerHTML = `
        <div class="history-mood-emoji-large">${emoji}</div>
        <div class="history-mood-rating">${entry.overallMood}/10</div>
        <div class="history-mood-label">${moodLabel}</div>
        <span class="history-date">${dateLabel}</span>
    `;
    card.appendChild(header);

    // Attributes grid with labels
    const attributesDiv = document.createElement('div');
    attributesDiv.className = 'history-attributes';
    attributesDiv.innerHTML = `
        <div class="history-attribute">
            <span class="history-attribute-icon">⚡</span>
            <span class="history-attribute-value">${entry.attributes.energy}</span>
            <span class="history-attribute-label">Energy</span>
        </div>
        <div class="history-attribute">
            <span class="history-attribute-icon">😴</span>
            <span class="history-attribute-value">${entry.attributes.sleep}</span>
            <span class="history-attribute-label">Sleep</span>
        </div>
        <div class="history-attribute">
            <span class="history-attribute-icon">😰</span>
            <span class="history-attribute-value">${entry.attributes.stress}</span>
            <span class="history-attribute-label">Stress</span>
        </div>
        <div class="history-attribute">
            <span class="history-attribute-icon">✅</span>
            <span class="history-attribute-value">${entry.attributes.productivity}</span>
            <span class="history-attribute-label">Productive</span>
        </div>
        <div class="history-attribute">
            <span class="history-attribute-icon">💬</span>
            <span class="history-attribute-value">${entry.attributes.social}</span>
            <span class="history-attribute-label">Social</span>
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
    
    // Set up filter chips
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Update active state
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            // Update current filter
            currentFilter = chip.dataset.filter;
            displayHistory();
        });
    });
    
    // Set up search input
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
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
    
    // Trigger initial animations
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
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