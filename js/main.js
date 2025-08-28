// Main JavaScript file for Kafi Trade Landing Page

class KafiLandingPage {
    constructor() {
        this.isLoaded = false;
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.populateContent();
        this.setupAnimations();
        this.setupScrollEffects();
        this.setupNavigation();
        this.applyTheme();
        this.hideLoading();
        this.isLoaded = true;

        // Track page load
        trackEvent('page_loaded', {
            loadTime: performance.now(),
            device: deviceDetector?.getDeviceInfo()
        });
    }

    /**
     * Populate content from CONFIG
     */
    populateContent() {
        const content = CONFIG.content;

        // Update hero content
        this.updateElement('heroTitle', content.title);
        this.updateElement('heroSubtitle', content.subtitle);
        this.updateElement('heroDescription', content.description);

        // Update offer content
        this.updateElement('offerTitle', content.offer.title);
        this.updateElement('offerDescription', content.offer.description);

        // Populate features
        this.populateFeatures(content.features);

        // Populate benefits
        this.populateBenefits(content.offer.benefits);

        // Update app store links
        this.updateAppStoreLinks();
    }

    /**
     * Update element content safely
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element && content) {
            element.textContent = content;
        }
    }

    /**
     * Populate features grid
     */
    populateFeatures(features) {
        const grid = document.getElementById('featuresGrid');
        if (!grid || !features) return;

        grid.innerHTML = '';

        features.forEach((feature, index) => {
            const featureCard = document.createElement('div');
            featureCard.className = 'feature-card';
            featureCard.innerHTML = `
                <div class="feature-icon">${this.getFeatureIcon(index)}</div>
                <h3 class="feature-title">${this.extractFeatureTitle(feature)}</h3>
                <p class="feature-description">${this.extractFeatureDescription(feature)}</p>
            `;
            
            // Add animation delay
            featureCard.style.animationDelay = `${index * 0.1}s`;
            
            grid.appendChild(featureCard);
        });
    }

    /**
     * Extract feature title from feature string
     */
    extractFeatureTitle(feature) {
        // Remove emoji and get first part as title
        const cleaned = feature.replace(/[^\w\s]/gi, '').trim();
        const words = cleaned.split(' ');
        return words.slice(0, 3).join(' ');
    }

    /**
     * Extract feature description from feature string
     */
    extractFeatureDescription(feature) {
        // Remove emoji and return as description
        return feature.replace(/^[^\w\s]+\s*/, '').trim();
    }

    /**
     * Get feature icon based on index
     */
    getFeatureIcon(index) {
        const icons = ['🚀', '📊', '🤖', '💰', '🔒', '⚡', '📱', '🎯', '🌟', '💎'];
        return icons[index % icons.length];
    }

    /**
     * Populate benefits grid
     */
    populateBenefits(benefits) {
        const grid = document.getElementById('benefitsGrid');
        if (!grid || !benefits) return;

        grid.innerHTML = '';

        benefits.forEach((benefit, index) => {
            const benefitItem = document.createElement('div');
            benefitItem.className = 'benefit-item';
            benefitItem.textContent = benefit;
            
            // Add animation delay
            benefitItem.style.animationDelay = `${index * 0.1}s`;
            
            grid.appendChild(benefitItem);
        });
    }

    /**
     * Update app store links
     */
    updateAppStoreLinks() {
        const androidLink = document.getElementById('androidLink');
        const iosLink = document.getElementById('iosLink');

        if (androidLink && CONFIG.appLinks.android) {
            androidLink.href = CONFIG.appLinks.android;
        }

        if (iosLink && CONFIG.appLinks.ios) {
            iosLink.href = CONFIG.appLinks.ios;
        }
    }

    /**
     * Setup scroll animations
     */
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll(
            '.feature-card, .benefit-item, .form-card, .section-title'
        );

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Setup scroll effects
     */
    setupScrollEffects() {
        let ticking = false;

        const updateScrollEffects = () => {
            const scrollY = window.pageYOffset;
            const windowHeight = window.innerHeight;

            // Parallax effect for hero background
            this.updateParallax(scrollY);

            // Header background opacity
            this.updateHeaderOpacity(scrollY);

            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    }

    /**
     * Update parallax effect
     */
    updateParallax(scrollY) {
        const orbs = document.querySelectorAll('.gradient-orb');
        orbs.forEach((orb, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = scrollY * speed;
            orb.style.transform = `translateY(${yPos}px)`;
        });
    }

    /**
     * Update header opacity based on scroll
     */
    updateHeaderOpacity(scrollY) {
        const header = document.querySelector('.header');
        if (header) {
            const opacity = Math.min(scrollY / 100, 1);
            header.style.background = `rgba(15, 23, 42, ${0.8 + (opacity * 0.2)})`;
        }
    }

    /**
     * Setup navigation
     */
    setupNavigation() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                scrollToElement(targetId);
                
                trackEvent('navigation_click', {
                    target: targetId,
                    source: 'nav_link'
                });
            });
        });

        // Mobile menu toggle (if needed)
        this.setupMobileMenu();
    }

    /**
     * Setup mobile menu
     */
    setupMobileMenu() {
        // Add mobile menu button if nav exists
        const nav = document.querySelector('.nav');
        const header = document.querySelector('.header .container');
        
        if (nav && header && window.innerWidth <= 768) {
            const menuButton = document.createElement('button');
            menuButton.className = 'mobile-menu-toggle';
            menuButton.innerHTML = '☰';
            menuButton.addEventListener('click', () => {
                nav.classList.toggle('mobile-open');
                menuButton.innerHTML = nav.classList.contains('mobile-open') ? '✕' : '☰';
            });
            
            header.appendChild(menuButton);
        }
    }

    /**
     * Apply theme from CONFIG
     */
    applyTheme() {
        const theme = CONFIG.theme;
        const root = document.documentElement;

        Object.keys(theme).forEach(property => {
            const cssProperty = `--${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssProperty, theme[property]);
        });
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        setTimeout(() => {
            hideLoading();
        }, 500);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update mobile menu on resize
        if (window.innerWidth > 768) {
            const nav = document.querySelector('.nav');
            const menuButton = document.querySelector('.mobile-menu-toggle');
            
            if (nav) nav.classList.remove('mobile-open');
            if (menuButton) menuButton.innerHTML = '☰';
        }
    }

    /**
     * Handle visibility change (tab switching)
     */
    handleVisibilityChange() {
        if (document.hidden) {
            trackEvent('page_hidden');
        } else {
            trackEvent('page_visible');
        }
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            trackEvent('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            trackEvent('unhandled_promise_rejection', {
                reason: event.reason?.toString()
            });
        });
    }

    /**
     * Get page performance metrics
     */
    getPerformanceMetrics() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
            };
        }
        return null;
    }
}

// Global functions for HTML onclick handlers
window.scrollToForm = scrollToForm;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kafiLandingPage = new KafiLandingPage();
});

// Handle window events
window.addEventListener('resize', throttle(() => {
    if (window.kafiLandingPage) {
        window.kafiLandingPage.handleResize();
    }
}, 250));

window.addEventListener('beforeunload', () => {
    trackEvent('page_unload', {
        timeOnPage: Date.now() - performance.timing.navigationStart,
        performance: window.kafiLandingPage?.getPerformanceMetrics()
    });
});

document.addEventListener('visibilitychange', () => {
    if (window.kafiLandingPage) {
        window.kafiLandingPage.handleVisibilityChange();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KafiLandingPage;
}
