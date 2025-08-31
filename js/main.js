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
        this.generateDynamicForm();
        this.generateQRCode();
        this.updateSubmitButton();
        this.setupAnimations();
        this.isLoaded = true;
    }

    /**
     * Generate dynamic form fields based on CONFIG
     */
    generateDynamicForm() {
        const formFieldsContainer = document.getElementById('form-fields');
        if (!formFieldsContainer) return;

        const fields = CONFIG.form.fields;
        formFieldsContainer.innerHTML = '';

        // Add form title
        const formTitle = document.createElement('h3');
        formTitle.className = 'form-title';
        formTitle.textContent = 'ĐĂNG KÝ TÀI KHOẢN';
        formFieldsContainer.appendChild(formTitle);

        Object.keys(fields).forEach(fieldName => {
            const fieldConfig = fields[fieldName];
            
            if (fieldConfig.enabled) {
                const formGroup = this.createFormField(fieldName, fieldConfig);
                formFieldsContainer.appendChild(formGroup);
            }
        });

        // Add terms and privacy checkbox
        const termsGroup = this.createTermsCheckbox();
        formFieldsContainer.appendChild(termsGroup);
    }

    /**
     * Create a form field element
     */
    createFormField(fieldName, fieldConfig) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.id = `${fieldName}-group`;

        let inputElement;

        if (fieldName === 'experience') {
            // Create select dropdown for experience
            inputElement = document.createElement('select');
            inputElement.innerHTML = `
                <option value="">${fieldConfig.placeholder}</option>
                <option value="Mới bắt đầu">Mới bắt đầu</option>
                <option value="1-2 năm">1-2 năm</option>
                <option value="3-5 năm">3-5 năm</option>
                <option value="Trên 5 năm">Trên 5 năm</option>
            `;
        } else {
            // Create input field
            inputElement = document.createElement('input');
            inputElement.type = this.getInputType(fieldName);
            inputElement.placeholder = fieldConfig.placeholder;
        }

        inputElement.id = fieldName;
        inputElement.name = fieldName;
        if (fieldConfig.required) {
            inputElement.required = true;
        }

        const errorSpan = document.createElement('span');
        errorSpan.className = 'form-error';
        errorSpan.id = `${fieldName}-error`;

        formGroup.appendChild(inputElement);
        formGroup.appendChild(errorSpan);

        return formGroup;
    }

    /**
     * Create terms and privacy checkbox
     */
    createTermsCheckbox() {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group checkbox-group';
        formGroup.id = 'terms-group';

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'terms';
        checkbox.name = 'terms';
        checkbox.required = true;
        checkbox.checked = true; // Default checked

        const label = document.createElement('label');
        label.htmlFor = 'terms';
        label.innerHTML = `Tôi đồng ý với <a href="/terms.html" target="_blank">Điều khoản sử dụng</a> và <a href="/privacy.html" target="_blank">Chính sách bảo mật</a>`;

        const errorSpan = document.createElement('span');
        errorSpan.className = 'form-error';
        errorSpan.id = 'terms-error';

        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);
        formGroup.appendChild(checkboxWrapper);
        formGroup.appendChild(errorSpan);

        return formGroup;
    }

    /**
     * Get appropriate input type for field
     */
    getInputType(fieldName) {
        switch (fieldName) {
            case 'email':
                return 'email';
            case 'phone':
                return 'tel';
            default:
                return 'text';
        }
    }

    /**
     * Update submit button text from CONFIG
     */
    updateSubmitButton() {
        const submitText = document.getElementById('submit-text');
        if (submitText && CONFIG.form.submitText) {
            submitText.textContent = CONFIG.form.submitText;
        }
    }

    /**
     * Generate QR code based on device detection
     */
    generateQRCode() {
        const qrContainer = document.querySelector('.qr-placeholder');
        if (!qrContainer) return;

        // Detect device and get appropriate app link
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        let appUrl;
        if (isAndroid) {
            appUrl = CONFIG.appLinks.android;
        } else if (isIOS) {
            appUrl = CONFIG.appLinks.ios;
        } else {
            // Default to Android for desktop/other devices
            appUrl = CONFIG.appLinks.android;
        }

        // Generate QR code using a simple QR code service
        this.createQRCode(qrContainer, appUrl);
    }

    /**
     * Create QR code element
     */
    createQRCode(container, url) {
        // Use QR Server API to generate QR code with larger size
        const qrSize = 200; // Increased from 180 to 200
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(url)}`;
        
        const qrImg = document.createElement('img');
        qrImg.src = qrUrl;
        qrImg.alt = 'QR Code để tải app';
        qrImg.style.width = `${qrSize}px`;
        qrImg.style.height = `${qrSize}px`;
        qrImg.style.borderRadius = '12px';
        
        // Replace placeholder with actual QR code
        container.innerHTML = '';
        container.appendChild(qrImg);
    }

    /**
     * Setup basic animations
     */
    setupAnimations() {
        // Simple fade-in animation for form elements
        const formElements = document.querySelectorAll('.form-group');
        formElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kafiLandingPage = new KafiLandingPage();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KafiLandingPage;
}
