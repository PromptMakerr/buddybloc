
async function initAuthListener() {
    if (!window.supabaseClient) return;

    const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            console.log('User signed in:', session.user);
            // Optional: Redirect if on login/signup page
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
                window.location.href = 'dashboard.html';
            }
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            // Optional: Redirect if on protected page
            if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('matchmaking.html')) {
                window.location.href = 'login.html';
            }
        }
    });
}

async function handleSignup(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');
    const jobTitle = formData.get('jobTitle');
    const bio = formData.get('bio');
    const city = formData.get('city');
    const postalCode = formData.get('postalCode');
    const timezone = formData.get('timezone');
    const workStyle = formData.get('workStyle');

    // Collect interests
    const interests = [];
    document.querySelectorAll('input[name="interests"]:checked').forEach(cb => {
        interests.push(cb.value);
    });

    try {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    job_title: jobTitle,
                    bio: bio,
                    city: city,
                    postal_code: postalCode,
                    timezone: timezone,
                    work_style: workStyle,
                    interests: interests
                }
            }
        });

        if (error) throw error;

        // Create profile record (optional, if you want a separate table)
        // For now, we store metadata in auth.users which is accessible via session

        showNotification('Account created! Please check your email to verify.', 'success');

        // Optional: Auto-login logic or wait for verification
        // If email confirmation is disabled in Supabase, they are logged in automatically.
        // If enabled, they need to check email.

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);

    } catch (error) {
        console.error('Signup error:', error);
        showNotification(error.message, 'error');
    }
}

async function handleLogin(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember');

    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        showNotification('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message, 'error');
    }
}

async function handleLogout() {
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

// --------------------------------------------------
// Auth guard: redirect unauthenticated users
function requireAuth() {
    const user = window.supabaseClient?.auth?.user();
    if (!user) {
        console.warn('No authenticated user, redirecting to login');
        window.location.href = 'login.html';
    }
}

// --------------------------------------------------
// Load profile information and display user name
async function loadProfile() {
    try {
        const user = window.supabaseClient?.auth?.user();
        if (!user) return;
        const { data, error } = await window.supabaseClient
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
        if (error) {
            console.error('Profile load error:', error);
            return;
        }
        const nameEl = document.getElementById('profileName');
        if (nameEl && data && data.full_name) {
            nameEl.textContent = data.full_name;
        }
    } catch (e) {
        console.error('Unexpected error loading profile:', e);
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

    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// ===================================
// Form Validation & Submission
// ===================================
function setupFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(form => {
        form.addEventListener('submit', async function (e) {
            e.preventDefault(); // CRITICAL: Prevent default form submission

            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');

            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.innerHTML : '';

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
                }

                try {
                    const formData = new FormData(form);

                    if (form.id === 'signupForm') {
                        await handleSignup(formData);
                    } else if (form.id === 'loginForm') {
                        await handleLogin(formData);
                    } else {
                        // Generic form (e.g. contact)
                        console.log('Generic form submitted');
                        showNotification('Form submitted successfully', 'success');
                    }
                } catch (err) {
                    console.error('Form submission error:', err);
                    showNotification('An unexpected error occurred', 'error');
                } finally {
                    // Restore button state
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                }
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

// ===================================
// Modals
// ===================================
function setupModals() {
    document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal-trigger');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
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
function setupNotifications() {
    // Helper function is globally available
}

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
    showNotification,
    formatDate,
    formatTime,
    debounce
};
