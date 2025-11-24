// ===================================
// BuddyBloc - Interactive JavaScript
// ===================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===================================
    // Header Scroll Effect
    // ===================================
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // ===================================
    // Smooth Scroll Navigation
    // ===================================
    const navLinks = document.querySelectorAll('.nav-links a, a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal links
            if (href.startsWith('#')) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ===================================
    // Mobile Menu Toggle
    // ===================================
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinksContainer.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('.material-symbols-outlined');
            if (navLinksContainer.classList.contains('active')) {
                icon.textContent = 'close';
            } else {
                icon.textContent = 'menu';
            }
        });
        
        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinksContainer.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('.material-symbols-outlined');
                icon.textContent = 'menu';
            });
        });
    }
    
    // ===================================
    // Intersection Observer for Fade-in Animations
    // ===================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
    
    // ===================================
    // Button Click Handlers (Placeholder)
    // ===================================
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-white');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Check if it's a CTA button (not navigation)
            const buttonText = this.textContent.trim();
            
            if (buttonText.includes('Find Your Buddy') || 
                buttonText.includes('Get Started') || 
                buttonText.includes('Sign Up')) {
                
                // Placeholder for sign-up functionality
                console.log('Sign up clicked - implement sign-up flow');
                
                // You can add modal, redirect, or other functionality here
                // For now, just add a visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            }
        });
    });
    
    // ===================================
    // Parallax Effect for Hero Image (Optional)
    // ===================================
    const heroImage = document.querySelector('.hero-image');
    
    if (heroImage) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.3;
            
            if (scrolled < window.innerHeight) {
                heroImage.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
        });
    }
    
    // ===================================
    // Dynamic Year in Footer
    // ===================================
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = `&copy; ${currentYear} BuddyBloc. All rights reserved.`;
    }
    
    // ===================================
    // Feature Cards Stagger Animation
    // ===================================
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // ===================================
    // Gradient Animation on Hover (Optional Enhancement)
    // ===================================
    const gradientButtons = document.querySelectorAll('.btn-primary');
    
    gradientButtons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            button.style.setProperty('--mouse-x', `${x}px`);
            button.style.setProperty('--mouse-y', `${y}px`);
        });
    });
    
    // ===================================
    // Console Welcome Message
    // ===================================
    console.log('%c🚀 Welcome to BuddyBloc! ', 'background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
    console.log('%cNever work alone again. Find your productivity partner today!', 'color: #3B82F6; font-size: 14px; font-weight: 500;');
    
});

// ===================================
// Utility Functions
// ===================================

// Debounce function for performance optimization
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

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
