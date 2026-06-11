// List of all available time zones
const ALL_TIMEZONES = [
    'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Cairo', 'Africa/Nairobi',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Anchorage', 'America/Toronto', 'America/Mexico_City', 'America/Buenos_Aires',
    'America/Sao_Paulo', 'America/Caracas', 'Europe/London', 'Europe/Paris',
    'Europe/Berlin', 'Europe/Moscow', 'Europe/Istanbul', 'Asia/Dubai',
    'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Hong_Kong', 'Asia/Shanghai',
    'Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore', 'Australia/Sydney',
    'Australia/Melbourne', 'Australia/Perth', 'Pacific/Auckland', 'Pacific/Fiji',
    'Pacific/Honolulu', 'Asia/Jakarta', 'Asia/Manila', 'Asia/Taipei',
    'Europe/Athens', 'Europe/Amsterdam', 'Europe/Stockholm', 'Europe/Prague',
    'America/Jamaica', 'America/El_Salvador', 'America/Denver', 'Pacific/Samoa',
];

// Default time zones to display
const DEFAULT_TIMEZONES = [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
];

let selectedTimezones = [...DEFAULT_TIMEZONES];

// DOM Elements
const clocksContainer = document.getElementById('clocksContainer');
const addTimezoneBtn = document.getElementById('addTimezoneBtn');
const resetBtn = document.getElementById('resetBtn');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('timezoneModal');
const closeBtn = document.querySelector('.close');
const timezoneSearch = document.getElementById('timezoneSearch');
const timezoneList = document.getElementById('timezoneList');

// Event Listeners
addTimezoneBtn.addEventListener('click', openModal);
resetBtn.addEventListener('click', resetToDefault);
closeBtn.addEventListener('click', closeModal);
searchInput.addEventListener('input', filterClocks);
timezoneSearch.addEventListener('input', filterTimezones);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Initialize the app
function init() {
    loadTimezones();
    renderClocks();
    updateClocks();
    setInterval(updateClocks, 1000);
}

// Load timezones from localStorage
function loadTimezones() {
    const saved = localStorage.getItem('selectedTimezones');
    if (saved) {
        selectedTimezones = JSON.parse(saved);
    }
}

// Save timezones to localStorage
function saveTimezones() {
    localStorage.setItem('selectedTimezones', JSON.stringify(selectedTimezones));
}

// Render clock cards
function renderClocks() {
    clocksContainer.innerHTML = '';
    selectedTimezones.forEach(tz => {
        const card = createClockCard(tz);
        clocksContainer.appendChild(card);
    });
}

// Create a clock card element
function createClockCard(timezone) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.dataset.timezone = timezone;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => removeTimezone(timezone));

    const name = document.createElement('div');
    name.className = 'timezone-name';
    name.textContent = formatTimezone(timezone);

    const time = document.createElement('div');
    time.className = 'time-display';
    time.dataset.time = 'true';

    const date = document.createElement('div');
    date.className = 'date-display';
    date.dataset.date = 'true';

    const day = document.createElement('div');
    day.className = 'day-display';
    day.dataset.day = 'true';

    const offset = document.createElement('div');
    offset.className = 'offset-info';
    offset.dataset.offset = 'true';

    card.appendChild(removeBtn);
    card.appendChild(name);
    card.appendChild(time);
    card.appendChild(date);
    card.appendChild(day);
    card.appendChild(offset);

    return card;
}

// Update all clocks
function updateClocks() {
    const cards = document.querySelectorAll('.clock-card');
    cards.forEach(card => {
        const timezone = card.dataset.timezone;
        const now = new Date();

        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            const dateFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const dayFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                weekday: 'long'
            });

            const timeStr = formatter.format(now);
            const dateStr = dateFormatter.format(now);
            const dayStr = dayFormatter.format(now);

            card.querySelector('[data-time]').textContent = timeStr;
            card.querySelector('[data-date]').textContent = dateStr;
            card.querySelector('[data-day]').textContent = dayStr;

            // Calculate UTC offset
            const tzTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
            const offset = (now - tzTime) / (1000 * 60 * 60);
            const offsetStr = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
            card.querySelector('[data-offset]').textContent = `${timezone.split('/')[1]} (${offsetStr})`;
        } catch (error) {
            console.error(`Invalid timezone: ${timezone}`, error);
        }
    });
}

// Open modal
function openModal() {
    modal.classList.remove('hidden');
    populateTimezoneList();
}

// Close modal
function closeModal() {
    modal.classList.add('hidden');
}

// Populate timezone list
function populateTimezoneList() {
    timezoneList.innerHTML = '';
    const availableTimezones = ALL_TIMEZONES.filter(tz => !selectedTimezones.includes(tz));

    availableTimezones.forEach(tz => {
        const item = document.createElement('div');
        item.className = 'timezone-item';
        item.textContent = formatTimezone(tz);
        item.addEventListener('click', () => {
            addTimezoneToList(tz);
            closeModal();
        });
        timezoneList.appendChild(item);
    });
}

// Format timezone display name
function formatTimezone(tz) {
    return tz.replace(/_/g, ' ').split('/')[1] || tz;
}

// Add timezone to selected list
function addTimezoneToList(timezone) {
    if (!selectedTimezones.includes(timezone)) {
        selectedTimezones.push(timezone);
        saveTimezones();
        renderClocks();
        updateClocks();
    }
}

// Remove timezone from list
function removeTimezone(timezone) {
    selectedTimezones = selectedTimezones.filter(tz => tz !== timezone);
    saveTimezones();
    renderClocks();
    updateClocks();
}

// Reset to default timezones
function resetToDefault() {
    selectedTimezones = [...DEFAULT_TIMEZONES];
    saveTimezones();
    renderClocks();
    updateClocks();
    timezoneSearch.value = '';
}

// Filter clocks by search input
function filterClocks() {
    const query = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.clock-card');

    cards.forEach(card => {
        const timezone = card.querySelector('.timezone-name').textContent.toLowerCase();
        const time = card.querySelector('[data-time]').textContent.toLowerCase();
        
        if (timezone.includes(query) || time.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter timezones in modal
function filterTimezones() {
    const query = timezoneSearch.value.toLowerCase();
    const items = document.querySelectorAll('.timezone-item');

    items.forEach(item => {
        if (item.textContent.toLowerCase().includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Start the app
init();
