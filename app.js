// ===================================
// BuddyBloc - Shared Application JavaScript
// ===================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // ===================================
    // Initialize Demo Data
    // ===================================
    initializeDemoData();

    // ===================================
    // Navigation Handling
    // ===================================
    setupNavigation();

    // ===================================
    // Form Validation
    // ===================================
    setupFormValidation();

    // ===================================
    // Modal Controls
    // ===================================
    setupModals();

    // ===================================
    // Tab Switching
    // ===================================
    setupTabs();

    // ===================================
    // Sidebar Toggle
    // ===================================
    setupSidebar();

    // ===================================
    // Notifications
    // ===================================
    setupNotifications();

    // ===================================
    // Star Rating
    // ===================================
    setupStarRating();

    // ===================================
    // Badge Progress
    // ===================================
    setupBadgeProgress();

});

// ===================================
// Demo Data Management
// ===================================
function initializeDemoData() {
    if (!localStorage.getItem('buddybloc_user')) {
        const demoUser = {
            id: 1,
            name: 'Jordan Smith',
            email: 'jordan@example.com',
            avatar: '',
            rating: 4.8,
            reliability: 96,
            sessionsCompleted: 127,
            hoursCompleted: 342,
            currentStreak: 15,
            badges: ['welcome', 'first_session', '7_day_streak', 'bronze_buddy'],
            verifications: ['email', 'linkedin'],
            memberSince: '2024-01-15'
        };
        localStorage.setItem('buddybloc_user', JSON.stringify(demoUser));
    }
}

function getCurrentUser() {
    const userStr = localStorage.getItem('buddybloc_user');
    return userStr ? JSON.parse(userStr) : null;
}

function updateUser(updates) {
    const user = getCurrentUser();
    if (user) {
        Object.assign(user, updates);
        localStorage.setItem('buddybloc_user', JSON.stringify(user));
    }
}

// ===================================
// Navigation
// ===================================
function setupNavigation() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// Form Validation
// ===================================
function setupFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');

            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                // Form is valid, handle submission
                handleFormSubmit(form);
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => clearError(input));
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    let isValid = true;
    let errorMessage = '';

    // Required check
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Email validation
    else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Password validation
    else if (type === 'password' && value && input.hasAttribute('data-min-length')) {
        const minLength = parseInt(input.getAttribute('data-min-length'));
        if (value.length < minLength) {
            isValid = false;
            errorMessage = `Password must be at least ${minLength} characters`;
        }
    }

    // Password confirmation
    else if (input.hasAttribute('data-confirm')) {
        const confirmId = input.getAttribute('data-confirm');
        const originalInput = document.getElementById(confirmId);
        if (originalInput && value !== originalInput.value) {
            isValid = false;
            errorMessage = 'Passwords do not match';
        }
    }

    if (!isValid) {
        showError(input, errorMessage);
    } else {
        clearError(input);
    }

    return isValid;
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('error');
        let errorEl = formGroup.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            formGroup.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }
}

function clearError(input) {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        const errorEl = formGroup.querySelector('.error-message');
        if (errorEl) {
            errorEl.remove();
        }
    }
}

function handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
    }

    // Simulate API call
    setTimeout(() => {
        console.log('Form submitted:', data);
        showNotification('Success! Form submitted.', 'success');

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
        }

        // Handle specific form actions
        if (form.id === 'loginForm') {
            window.location.href = 'dashboard.html';
        } else if (form.id === 'signupForm') {
            window.location.href = 'dashboard.html';
        }
    }, 1500);
}

// ===================================
// Modals
// ===================================
function setupModals() {
    // Open modal
    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-open');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close modal
    document.querySelectorAll('[data-modal-close]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modal = trigger.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

// ===================================
// Tabs
// ===================================
function setupTabs() {
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabGroup = tab.closest('[data-tab-group]');
            const tabId = tab.getAttribute('data-tab');

            // Remove active from all tabs and panels in this group
            tabGroup.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
            tabGroup.querySelectorAll('[data-tab-panel]').forEach(p => p.classList.remove('active'));

            // Add active to clicked tab and corresponding panel
            tab.classList.add('active');
            const panel = tabGroup.querySelector(`[data-tab-panel="${tabId}"]`);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
}

// ===================================
// Sidebar
// ===================================
function setupSidebar() {
    const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebar_collapsed', sidebar.classList.contains('collapsed'));
        });

        // Restore sidebar state
        if (localStorage.getItem('sidebar_collapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }
    }
}

// ===================================
// Notifications
// ===================================
function showNotification(message, type = 'info') {
    const container = getOrCreateNotificationContainer();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });

    // Auto remove after 5 seconds
    setTimeout(() => removeNotification(notification), 5000);
}

function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
}

function getOrCreateNotificationContainer() {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    return container;
}

// ===================================
// Star Rating
// ===================================
function setupStarRating() {
    document.querySelectorAll('.star-rating').forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const input = rating.querySelector('input[type="hidden"]');

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const value = index + 1;
                if (input) input.value = value;

                // Update visual state
                stars.forEach((s, i) => {
                    if (i < value) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });

            star.addEventListener('mouseenter', () => {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.classList.add('hover');
                    } else {
                        s.classList.remove('hover');
                    }
                });
            });
        });

        rating.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// ===================================
// Badge Progress
// ===================================
function setupBadgeProgress() {
    document.querySelectorAll('.badge-progress').forEach(badge => {
        const progress = badge.getAttribute('data-progress');
        const progressBar = badge.querySelector('.progress-bar');
        if (progressBar && progress) {
            setTimeout(() => {
                progressBar.style.width = progress + '%';
            }, 100);
        }
    });
}

// ===================================
// Utility Functions
// ===================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

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

// Export for use in other files
window.BuddyBloc = {
    getCurrentUser,
    updateUser,
    showNotification,
    formatDate,
    formatTime,
    debounce
};
