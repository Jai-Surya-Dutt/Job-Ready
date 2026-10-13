// DOM Elements
const jobRoleSelect = document.getElementById('jobRole');
const customRoleGroup = document.getElementById('customRoleGroup');
const customRoleInput = document.getElementById('customRole');
const experienceLevelSelect = document.getElementById('experienceLevel');
const interviewTypeSelect = document.getElementById('interviewType');
const difficultySelect = document.getElementById('difficulty');
const durationSelect = document.getElementById('duration');
const questionCountSelect = document.getElementById('questionCount');
const feedbackTypeSelect = document.getElementById('feedbackType');
const timerSelect = document.getElementById('timer');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load saved preferences if they exist
    loadSavedPreferences();

    // Handle custom role input
    jobRoleSelect.addEventListener('change', () => {
        if (jobRoleSelect.value === 'custom') {
            customRoleGroup.style.display = 'block';
        } else {
            customRoleGroup.style.display = 'none';
        }
    });

    // Handle skill checkboxes
    const skillCheckboxes = document.querySelectorAll('.skill-options input[type="checkbox"]');
    skillCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectedSkills();
        });
    });
});

// Save preferences to localStorage
function savePreferences() {
    const preferences = {
        jobRole: jobRoleSelect.value,
        customRole: customRoleInput.value,
        experienceLevel: experienceLevelSelect.value,
        interviewType: interviewTypeSelect.value,
        difficulty: difficultySelect.value,
        duration: durationSelect.value,
        questionCount: questionCountSelect.value,
        feedbackType: feedbackTypeSelect.value,
        timer: timerSelect.value,
        selectedSkills: getSelectedSkills()
    };

    localStorage.setItem('interviewPreferences', JSON.stringify(preferences));
    showNotification('Preferences saved successfully!');
}

// Load saved preferences from localStorage
function loadSavedPreferences() {
    const savedPreferences = localStorage.getItem('interviewPreferences');
    if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        
        // Set form values
        jobRoleSelect.value = preferences.jobRole;
        if (preferences.jobRole === 'custom') {
            customRoleGroup.style.display = 'block';
            customRoleInput.value = preferences.customRole;
        }
        
        experienceLevelSelect.value = preferences.experienceLevel;
        interviewTypeSelect.value = preferences.interviewType;
        difficultySelect.value = preferences.difficulty;
        durationSelect.value = preferences.duration;
        questionCountSelect.value = preferences.questionCount;
        feedbackTypeSelect.value = preferences.feedbackType;
        timerSelect.value = preferences.timer;

        // Set skill checkboxes
        if (preferences.selectedSkills) {
            preferences.selectedSkills.forEach(skill => {
                const checkbox = document.querySelector(`.skill-options input[value="${skill}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }
}

// Get selected skills
function getSelectedSkills() {
    const selectedSkills = [];
    document.querySelectorAll('.skill-options input[type="checkbox"]:checked').forEach(checkbox => {
        selectedSkills.push(checkbox.value);
    });
    return selectedSkills;
}

// Update selected skills display
function updateSelectedSkills() {
    const selectedSkills = getSelectedSkills();
    // You can add additional UI updates here if needed
}

// Start customized interview
function startCustomizedInterview() {
    // Validate required fields
    if (!validateForm()) {
        return;
    }

    // Collect all preferences
    const preferences = {
        jobRole: jobRoleSelect.value === 'custom' ? customRoleInput.value : jobRoleSelect.value,
        experienceLevel: experienceLevelSelect.value,
        interviewType: interviewTypeSelect.value,
        difficulty: difficultySelect.value,
        duration: durationSelect.value,
        questionCount: questionCountSelect.value,
        feedbackType: feedbackTypeSelect.value,
        timer: timerSelect.value,
        selectedSkills: getSelectedSkills()
    };

    // Save preferences before starting
    savePreferences();

    // Redirect to interview page with preferences
    window.location.href = `interview.html?preferences=${encodeURIComponent(JSON.stringify(preferences))}`;
}

// Form validation
function validateForm() {
    if (!jobRoleSelect.value || (jobRoleSelect.value === 'custom' && !customRoleInput.value)) {
        showNotification('Please select or specify a job role', 'error');
        return false;
    }

    if (!experienceLevelSelect.value) {
        showNotification('Please select your experience level', 'error');
        return false;
    }

    if (!interviewTypeSelect.value) {
        showNotification('Please select an interview type', 'error');
        return false;
    }

    if (!difficultySelect.value) {
        showNotification('Please select interview difficulty', 'error');
        return false;
    }

    if (!durationSelect.value) {
        showNotification('Please select interview duration', 'error');
        return false;
    }

    if (!questionCountSelect.value) {
        showNotification('Please select number of questions', 'error');
        return false;
    }

    if (!feedbackTypeSelect.value) {
        showNotification('Please select feedback type', 'error');
        return false;
    }

    if (!timerSelect.value) {
        showNotification('Please select answer timer', 'error');
        return false;
    }

    return true;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 