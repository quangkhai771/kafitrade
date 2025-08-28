// Device detection and app store redirect functionality

class DeviceDetector {
    constructor() {
        this.userAgent = navigator.userAgent.toLowerCase();
        this.platform = navigator.platform.toLowerCase();
        this.init();
    }

    init() {
        this.detectDevice();
        this.setupRedirects();
        this.trackDeviceInfo();
    }

    /**
     * Detect device type and operating system
     */
    detectDevice() {
        this.device = {
            type: this.getDeviceType(),
            os: this.getOperatingSystem(),
            browser: this.getBrowser(),
            isMobile: this.isMobileDevice(),
            isTablet: this.isTabletDevice(),
            isDesktop: this.isDesktopDevice()
        };
    }

    /**
     * Get device type
     */
    getDeviceType() {
        if (this.isMobileDevice()) return 'mobile';
        if (this.isTabletDevice()) return 'tablet';
        return 'desktop';
    }

    /**
     * Get operating system
     */
    getOperatingSystem() {
        if (/android/.test(this.userAgent)) return 'android';
        if (/iphone|ipad|ipod/.test(this.userAgent)) return 'ios';
        if (/windows/.test(this.userAgent)) return 'windows';
        if (/mac/.test(this.userAgent)) return 'mac';
        if (/linux/.test(this.userAgent)) return 'linux';
        return 'unknown';
    }

    /**
     * Get browser information
     */
    getBrowser() {
        if (/chrome/.test(this.userAgent) && !/edge/.test(this.userAgent)) return 'chrome';
        if (/firefox/.test(this.userAgent)) return 'firefox';
        if (/safari/.test(this.userAgent) && !/chrome/.test(this.userAgent)) return 'safari';
        if (/edge/.test(this.userAgent)) return 'edge';
        if (/opera/.test(this.userAgent)) return 'opera';
        return 'unknown';
    }

    /**
     * Check if device is mobile
     */
    isMobileDevice() {
        return /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent) ||
               (window.innerWidth <= 768);
    }

    /**
     * Check if device is tablet
     */
    isTabletDevice() {
        return (/ipad/i.test(this.userAgent) || 
                (/android/i.test(this.userAgent) && !/mobile/i.test(this.userAgent))) &&
               (window.innerWidth > 768 && window.innerWidth <= 1024);
    }

    /**
     * Check if device is desktop
     */
    isDesktopDevice() {
        return !this.isMobileDevice() && !this.isTabletDevice();
    }

    /**
     * Setup app store redirects
     */
    setupRedirects() {
        const downloadBtn = document.getElementById('downloadBtn');
        const androidLink = document.getElementById('androidLink');
        const iosLink = document.getElementById('iosLink');

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.redirectToAppStore();
            });
        }

        if (androidLink && CONFIG.appLinks.android) {
            androidLink.href = CONFIG.appLinks.android;
            androidLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToStore('android');
            });
        }

        if (iosLink && CONFIG.appLinks.ios) {
            iosLink.href = CONFIG.appLinks.ios;
            iosLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToStore('ios');
            });
        }

        // Update button text based on device
        this.updateDownloadButton();
    }

    /**
     * Update download button based on device
     */
    updateDownloadButton() {
        const downloadBtn = document.getElementById('downloadBtn');
        if (!downloadBtn) return;

        const btnText = downloadBtn.querySelector('.btn-text') || downloadBtn;
        
        switch (this.device.os) {
            case 'android':
                btnText.innerHTML = '<span class="btn-icon">📱</span> Tải trên Google Play';
                break;
            case 'ios':
                btnText.innerHTML = '<span class="btn-icon">📱</span> Tải trên App Store';
                break;
            default:
                btnText.innerHTML = '<span class="btn-icon">📱</span> Tải ứng dụng ngay';
        }
    }

    /**
     * Redirect to appropriate app store
     */
    redirectToAppStore() {
        const os = this.device.os;
        
        if (os === 'android') {
            this.redirectToStore('android');
        } else if (os === 'ios') {
            this.redirectToStore('ios');
        } else {
            // For desktop/other devices, show both options
            this.showAppStoreOptions();
        }
    }

    /**
     * Redirect to specific store
     */
    redirectToStore(store) {
        const links = CONFIG.appLinks;
        let url = '';

        switch (store) {
            case 'android':
                url = links.android;
                trackEvent('app_download_attempt', { store: 'google_play', device: this.device });
                break;
            case 'ios':
                url = links.ios;
                trackEvent('app_download_attempt', { store: 'app_store', device: this.device });
                break;
        }

        if (url) {
            // Try to open in app first, then fallback to browser
            if (this.device.isMobile) {
                this.tryDeepLink(url);
            } else {
                window.open(url, '_blank');
            }
        }
    }

    /**
     * Try deep link for mobile devices
     */
    tryDeepLink(url) {
        const startTime = Date.now();
        const timeout = 2000; // 2 seconds

        // Create invisible iframe to trigger app
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);

        // Fallback to browser if app doesn't open
        setTimeout(() => {
            const timeElapsed = Date.now() - startTime;
            if (timeElapsed < timeout + 100) {
                // App likely didn't open, redirect to browser
                window.location.href = url;
            }
            document.body.removeChild(iframe);
        }, timeout);
    }

    /**
     * Show app store options for desktop users
     */
    showAppStoreOptions() {
        const modal = this.createAppStoreModal();
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        trackEvent('app_store_modal_shown', { device: this.device });
    }

    /**
     * Create app store selection modal
     */
    createAppStoreModal() {
        const modal = document.createElement('div');
        modal.className = 'app-store-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chọn nền tảng của bạn</h3>
                    <button class="modal-close" onclick="this.closest('.app-store-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Kafi Trade có sẵn trên cả hai nền tảng:</p>
                    <div class="store-options">
                        <a href="${CONFIG.appLinks.android}" target="_blank" class="store-option android" onclick="deviceDetector.trackStoreClick('android')">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play">
                            <span>Android</span>
                        </a>
                        <a href="${CONFIG.appLinks.ios}" target="_blank" class="store-option ios" onclick="deviceDetector.trackStoreClick('ios')">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store">
                            <span>iOS</span>
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .app-store-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .app-store-modal.show {
                opacity: 1;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }
            .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: 1rem;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            .modal-header h3 {
                margin: 0;
                color: var(--text-primary);
            }
            .modal-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-body p {
                color: var(--text-secondary);
                margin-bottom: 1.5rem;
            }
            .store-options {
                display: flex;
                gap: 1rem;
                flex-direction: column;
            }
            .store-option {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: var(--background-color);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                text-decoration: none;
                color: var(--text-primary);
                transition: all 0.3s ease;
            }
            .store-option:hover {
                border-color: var(--primary-color);
                transform: translateY(-2px);
            }
            .store-option img {
                height: 40px;
                width: auto;
            }
            @media (min-width: 640px) {
                .store-options {
                    flex-direction: row;
                }
            }
        `;
        document.head.appendChild(style);

        return modal;
    }

    /**
     * Track store click
     */
    trackStoreClick(store) {
        trackEvent('app_store_click', { 
            store: store,
            device: this.device,
            source: 'modal'
        });
    }

    /**
     * Track device information
     */
    trackDeviceInfo() {
        trackEvent('page_view', {
            device: this.device,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
    }

    /**
     * Get device info for analytics
     */
    getDeviceInfo() {
        return this.device;
    }

    /**
     * Check if user can install PWA
     */
    canInstallPWA() {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }

    /**
     * Get recommended download method
     */
    getRecommendedDownload() {
        if (this.device.os === 'android') {
            return {
                type: 'store',
                store: 'google_play',
                url: CONFIG.appLinks.android,
                text: 'Tải trên Google Play'
            };
        } else if (this.device.os === 'ios') {
            return {
                type: 'store',
                store: 'app_store',
                url: CONFIG.appLinks.ios,
                text: 'Tải trên App Store'
            };
        } else {
            return {
                type: 'options',
                text: 'Chọn nền tảng'
            };
        }
    }
}

// Initialize device detector when DOM is loaded
let deviceDetector;

document.addEventListener('DOMContentLoaded', () => {
    deviceDetector = new DeviceDetector();
    
    // Make it globally available
    window.deviceDetector = deviceDetector;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceDetector;
}
