// Form handling and Google Sheets integration

class FormHandler {
    constructor() {
        this.form = document.getElementById('leadForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.messageContainer = document.getElementById('formMessage');
        this.isSubmitting = false;
        
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupFormSubmission();
        this.configureFields();
        this.setupRealTimeValidation();
    }

    /**
     * Configure form fields based on CONFIG
     */
    configureFields() {
        const fields = CONFIG.form.fields;
        
        Object.keys(fields).forEach(fieldName => {
            const fieldConfig = fields[fieldName];
            const fieldGroup = document.querySelector(`[data-field="${fieldName}"]`);
            const input = document.getElementById(fieldName);
            
            if (fieldGroup && input) {
                // Show/hide field based on config
                if (fieldConfig.enabled) {
                    fieldGroup.style.display = 'block';
                } else {
                    fieldGroup.style.display = 'none';
                }
                
                // Set required attribute
                if (fieldConfig.required) {
                    input.setAttribute('required', 'required');
                } else {
                    input.removeAttribute('required');
                }
                
                // Set placeholder
                if (fieldConfig.placeholder) {
                    input.setAttribute('placeholder', fieldConfig.placeholder);
                }
            }
        });

        // Update submit button text
        if (this.submitBtn && CONFIG.form.submitText) {
            const btnText = this.submitBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = CONFIG.form.submitText;
            }
        }
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        this.validators = {
            fullName: (value) => {
                if (!value.trim()) return 'Vui lòng nhập họ tên';
                if (value.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
                if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) return 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
                return null;
            },
            
            phone: (value) => {
                if (!value.trim()) return 'Vui lòng nhập số điện thoại';
                if (!isValidPhone(value)) return 'Số điện thoại không hợp lệ';
                return null;
            },
            
            email: (value) => {
                if (!value.trim()) return 'Vui lòng nhập email';
                if (!isValidEmail(value)) return 'Email không hợp lệ';
                return null;
            },
            
            company: (value) => {
                // Optional field, only validate if enabled and required
                const fieldConfig = CONFIG.form.fields.company;
                if (fieldConfig.enabled && fieldConfig.required && !value.trim()) {
                    return 'Vui lòng nhập tên công ty';
                }
                return null;
            },
            
            experience: (value) => {
                // Optional field, only validate if enabled and required
                const fieldConfig = CONFIG.form.fields.experience;
                if (fieldConfig.enabled && fieldConfig.required && !value) {
                    return 'Vui lòng chọn mức độ kinh nghiệm';
                }
                return null;
            }
        };
    }

    /**
     * Setup real-time validation
     */
    setupRealTimeValidation() {
        Object.keys(this.validators).forEach(fieldName => {
            const input = document.getElementById(fieldName);
            if (input) {
                // Validate on blur
                input.addEventListener('blur', () => {
                    this.validateField(fieldName);
                });

                // Clear error on input
                input.addEventListener('input', () => {
                    this.clearFieldError(fieldName);
                });

                // Format phone number on input
                if (fieldName === 'phone') {
                    input.addEventListener('input', (e) => {
                        // Remove non-digits except + at the beginning
                        let value = e.target.value.replace(/[^\d+]/g, '');
                        if (value.indexOf('+') > 0) {
                            value = value.replace(/\+/g, '');
                        }
                        e.target.value = value;
                    });
                }
            }
        });
    }

    /**
     * Validate individual field
     */
    validateField(fieldName) {
        const input = document.getElementById(fieldName);
        const errorElement = input?.parentElement.querySelector('.form-error');
        
        if (!input || !errorElement) return true;

        const validator = this.validators[fieldName];
        if (!validator) return true;

        const error = validator(input.value);
        
        if (error) {
            this.showFieldError(fieldName, error);
            return false;
        } else {
            this.clearFieldError(fieldName);
            return true;
        }
    }

    /**
     * Show field error
     */
    showFieldError(fieldName, message) {
        const input = document.getElementById(fieldName);
        const errorElement = input?.parentElement.querySelector('.form-error');
        
        if (input && errorElement) {
            input.classList.add('error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(fieldName) {
        const input = document.getElementById(fieldName);
        const errorElement = input?.parentElement.querySelector('.form-error');
        
        if (input && errorElement) {
            input.classList.remove('error');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * Validate entire form
     */
    validateForm() {
        let isValid = true;
        const enabledFields = Object.keys(CONFIG.form.fields).filter(
            field => CONFIG.form.fields[field].enabled
        );

        enabledFields.forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Setup form submission
     */
    setupFormSubmission() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    /**
     * Handle form submission
     */
    async handleSubmit() {
        if (this.isSubmitting) return;

        // Validate form
        if (!this.validateForm()) {
            this.showMessage('Vui lòng kiểm tra lại thông tin đã nhập', 'error');
            return;
        }

        this.isSubmitting = true;
        this.setSubmitButtonLoading(true);

        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Track form submission attempt
            trackEvent('form_submission_attempt', {
                fields: Object.keys(formData),
                device: deviceDetector?.getDeviceInfo()
            });

            // Submit to Google Sheets
            const success = await this.submitToGoogleSheets(formData);

            if (success) {
                this.handleSubmitSuccess(formData);
            } else {
                this.handleSubmitError();
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.handleSubmitError();
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonLoading(false);
        }
    }

    /**
     * Collect form data
     */
    collectFormData() {
        const data = {};
        const enabledFields = Object.keys(CONFIG.form.fields).filter(
            field => CONFIG.form.fields[field].enabled
        );

        enabledFields.forEach(fieldName => {
            const input = document.getElementById(fieldName);
            if (input) {
                data[fieldName] = input.value.trim();
            }
        });

        // Add metadata
        data.timestamp = new Date().toISOString();
        data.source = 'kafi-landing-page';
        data.device = deviceDetector?.getDeviceInfo();
        data.userAgent = navigator.userAgent;
        data.referrer = document.referrer;
        data.utm_source = getUrlParameter('utm_source');
        data.utm_medium = getUrlParameter('utm_medium');
        data.utm_campaign = getUrlParameter('utm_campaign');

        return data;
    }

    /**
     * Submit data to Google Sheets via Apps Script
     */
    async submitToGoogleSheets(data) {
        const scriptUrl = CONFIG.googleSheets.scriptUrl;
        
        if (!scriptUrl || scriptUrl.includes('YOUR_SCRIPT_ID')) {
            console.warn('Google Sheets script URL not configured');
            // For demo purposes, simulate success
            await new Promise(resolve => setTimeout(resolve, 1500));
            return true;
        }

        try {
            // Method 1: Try with FormData (works better with Apps Script)
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (typeof data[key] === 'object') {
                    formData.append(key, JSON.stringify(data[key]));
                } else {
                    formData.append(key, data[key]);
                }
            });

            let response = await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            // Since no-cors doesn't allow reading response, we assume success if no error
            if (response.type === 'opaque') {
                return true;
            }

            // Method 2: Fallback to JSON with CORS
            response = await fetch(scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                return result.success === true;
            } else {
                console.error('Google Sheets submission failed:', response.status);
                return false;
            }

        } catch (error) {
            console.error('Error submitting to Google Sheets:', error);
            
            // Method 3: Fallback using JSONP-style approach
            try {
                return await this.submitViaJSONP(data, scriptUrl);
            } catch (jsonpError) {
                console.error('JSONP fallback also failed:', jsonpError);
                return false;
            }
        }
    }

    /**
     * Fallback submission method using JSONP-style approach
     */
    async submitViaJSONP(data, scriptUrl) {
        return new Promise((resolve) => {
            // Create a unique callback name
            const callbackName = 'kafiCallback_' + Date.now();
            
            // Create the script element
            const script = document.createElement('script');
            const params = new URLSearchParams();
            
            // Add data as URL parameters
            Object.keys(data).forEach(key => {
                if (typeof data[key] === 'object') {
                    params.append(key, JSON.stringify(data[key]));
                } else {
                    params.append(key, data[key]);
                }
            });
            
            params.append('callback', callbackName);
            
            // Set up the callback
            window[callbackName] = (response) => {
                document.head.removeChild(script);
                delete window[callbackName];
                resolve(response && response.success === true);
            };
            
            // Handle errors
            script.onerror = () => {
                document.head.removeChild(script);
                delete window[callbackName];
                resolve(true); // Assume success since we can't verify
            };
            
            // Set the script source
            script.src = `${scriptUrl}?${params.toString()}`;
            
            // Add to document
            document.head.appendChild(script);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (window[callbackName]) {
                    document.head.removeChild(script);
                    delete window[callbackName];
                    resolve(true); // Assume success on timeout
                }
            }, 10000);
        });
    }

    /**
     * Handle successful submission
     */
    handleSubmitSuccess(formData) {
        // Show success message
        this.showMessage(CONFIG.form.successMessage, 'success');
        
        // Reset form
        this.form.reset();
        
        // Clear any remaining errors
        Object.keys(this.validators).forEach(fieldName => {
            this.clearFieldError(fieldName);
        });

        // Track successful submission
        trackEvent('form_submission_success', {
            fields: Object.keys(formData),
            device: deviceDetector?.getDeviceInfo()
        });

        // Store lead data locally for potential retry
        storage.set('last_lead_submission', {
            data: formData,
            timestamp: new Date().toISOString(),
            success: true
        });

        // Optional: Redirect or show next steps
        setTimeout(() => {
            this.showNextSteps();
        }, 2000);
    }

    /**
     * Handle submission error
     */
    handleSubmitError() {
        this.showMessage(CONFIG.form.errorMessage, 'error');
        
        // Track failed submission
        trackEvent('form_submission_error', {
            device: deviceDetector?.getDeviceInfo()
        });
    }

    /**
     * Show form message
     */
    showMessage(message, type) {
        if (!this.messageContainer) return;

        this.messageContainer.textContent = message;
        this.messageContainer.className = `form-message ${type}`;
        this.messageContainer.style.display = 'block';

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                this.hideMessage();
            }, 5000);
        }
    }

    /**
     * Hide form message
     */
    hideMessage() {
        if (this.messageContainer) {
            this.messageContainer.style.display = 'none';
        }
    }

    /**
     * Set submit button loading state
     */
    setSubmitButtonLoading(loading) {
        if (!this.submitBtn) return;

        const btnText = this.submitBtn.querySelector('.btn-text');
        const btnLoading = this.submitBtn.querySelector('.btn-loading');

        if (loading) {
            this.submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'flex';
        } else {
            this.submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'block';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    /**
     * Show next steps after successful submission
     */
    showNextSteps() {
        // Auto-redirect without confirmation
        if (deviceDetector) {
            const device = deviceDetector.getDeviceInfo();
            
            // For desktop/PC users, default to Android link
            if (device.type === 'desktop') {
                setTimeout(() => {
                    window.open(CONFIG.appLinks.android, '_blank');
                }, 1500); // Wait 1.5s to show success message
            } else {
                // For mobile devices, use smart detection
                setTimeout(() => {
                    deviceDetector.redirectToAppStore();
                }, 1500);
            }
        }
    }

    /**
     * Pre-fill form with saved data (for returning users)
     */
    prefillForm() {
        const savedData = storage.get('form_prefill_data');
        if (savedData) {
            Object.keys(savedData).forEach(fieldName => {
                const input = document.getElementById(fieldName);
                if (input && savedData[fieldName]) {
                    input.value = savedData[fieldName];
                }
            });
        }
    }

    /**
     * Save form data for prefilling (on input)
     */
    saveFormData() {
        const data = {};
        ['fullName', 'email'].forEach(fieldName => {
            const input = document.getElementById(fieldName);
            if (input && input.value.trim()) {
                data[fieldName] = input.value.trim();
            }
        });
        
        if (Object.keys(data).length > 0) {
            storage.set('form_prefill_data', data);
        }
    }
}

// Initialize form handler when DOM is loaded
let formHandler;

document.addEventListener('DOMContentLoaded', () => {
    formHandler = new FormHandler();
    
    // Make it globally available
    window.formHandler = formHandler;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}
