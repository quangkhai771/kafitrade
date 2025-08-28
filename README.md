# Kafi Trade Landing Page

Modern, responsive landing page for Kafi Trade app with form submission to Google Sheets and smart device detection for app store redirects.

## Features

- 📱 **Responsive Design**: Mobile-first approach, optimized for all devices
- 🎨 **Modern UI**: Clean, trendy design with smooth animations
- 📝 **Smart Form**: Configurable form fields with real-time validation
- 📊 **Google Sheets Integration**: Automatic lead collection via Apps Script
- 🔍 **Device Detection**: Smart redirect to appropriate app store (Android/iOS)
- ⚙️ **Easy Configuration**: Centralized config system for quick customization
- 🚀 **Performance Optimized**: Fast loading with minimal dependencies
- 📈 **Analytics Ready**: Built-in event tracking system

## Quick Start

1. **Clone/Download** this project
2. **Configure Google Sheets** (see setup instructions below)
3. **Update configuration** in `config.js`
4. **Deploy to Cloudflare Pages**

## Configuration

### Basic Setup

Edit `config.js` to customize:

```javascript
const CONFIG = {
    // App Store Links
    appLinks: {
        android: "YOUR_GOOGLE_PLAY_URL",
        ios: "YOUR_APP_STORE_URL"
    },
    
    // Google Sheets Integration
    googleSheets: {
        scriptUrl: "YOUR_APPS_SCRIPT_URL",
        sheetName: "Leads"
    },
    
    // Form Configuration
    form: {
        fields: {
            fullName: { enabled: true, required: true },
            phone: { enabled: true, required: true },
            email: { enabled: true, required: true },
            company: { enabled: false, required: false },
            experience: { enabled: false, required: false }
        }
    }
};
```

### Google Sheets Setup

1. **Create Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com)
   - Create new spreadsheet
   - Copy the Sheet ID from URL

2. **Setup Apps Script**:
   - Go to [Google Apps Script](https://script.google.com)
   - Create new project
   - Copy code from `google-apps-script.js`
   - Update `SHEET_ID` variable
   - Deploy as web app with "Anyone" permissions

3. **Update Config**:
   - Copy the web app URL
   - Update `CONFIG.googleSheets.scriptUrl` in `config.js`

### Form Field Configuration

Control which fields appear in the form:

```javascript
form: {
    fields: {
        fullName: {
            enabled: true,        // Show/hide field
            required: true,       // Required validation
            placeholder: "Họ và tên"
        },
        // ... other fields
    }
}
```

### Theme Customization

Modify colors and styling:

```javascript
theme: {
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    accentColor: "#f59e0b",
    backgroundColor: "#0f172a",
    textColor: "#ffffff"
}
```

## Deployment

### Cloudflare Pages

1. **Connect Repository**:
   - Go to Cloudflare Pages dashboard
   - Connect your Git repository

2. **Build Settings**:
   - Framework preset: `None`
   - Build command: (leave empty)
   - Build output directory: `/`

3. **Environment Variables** (optional):
   - Add any custom environment variables

4. **Deploy**:
   - Click "Save and Deploy"
   - Your site will be available at `your-project.pages.dev`

### Custom Domain

1. Add custom domain in Cloudflare Pages
2. Update DNS records as instructed
3. SSL certificate will be automatically provisioned

## File Structure

```
kafi-landingpage/
├── index.html              # Main HTML file
├── config.js               # Configuration file
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   ├── main.js            # Main JavaScript
│   ├── form-handler.js    # Form submission logic
│   ├── device-detection.js # Device detection & redirects
│   └── utils.js           # Utility functions
├── google-apps-script.js   # Apps Script code
└── README.md              # This file
```

## Device Detection

The landing page automatically detects user devices and:

- **Mobile (Android)**: Shows "Tải trên Google Play" button
- **Mobile (iOS)**: Shows "Tải trên App Store" button  
- **Desktop**: Shows modal with both options
- **Smart Redirects**: Attempts deep linking on mobile devices

## Form Features

- **Real-time Validation**: Instant feedback on form fields
- **Vietnamese Phone Validation**: Supports local phone formats
- **Email Validation**: Standard email format checking
- **Configurable Fields**: Show/hide fields via config
- **Loading States**: Visual feedback during submission
- **Success/Error Messages**: Clear user feedback
- **Analytics Tracking**: Built-in event tracking

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Performance

- **First Paint**: < 1.5s
- **Interactive**: < 2.5s
- **Lighthouse Score**: 90+
- **Mobile Optimized**: Perfect mobile experience

## Analytics & Tracking

Built-in event tracking for:

- Page views and device info
- Form interactions
- App download attempts
- Navigation clicks
- Error tracking

Access tracked events via browser console or integrate with analytics services.

## Customization Examples

### Adding New Form Field

1. **Update Config**:
```javascript
form: {
    fields: {
        // ... existing fields
        jobTitle: {
            enabled: true,
            required: false,
            placeholder: "Chức vụ (tùy chọn)"
        }
    }
}
```

2. **Add HTML**:
```html
<div class="form-group" data-field="jobTitle">
    <input type="text" id="jobTitle" name="jobTitle" placeholder="Chức vụ (tùy chọn)">
    <span class="form-error"></span>
</div>
```

3. **Update Apps Script** to handle the new field

### Changing Colors

Update the theme object in `config.js`:

```javascript
theme: {
    primaryColor: "#your-color",
    secondaryColor: "#your-color",
    // ... other colors
}
```

### Adding Custom Content

Modify the content object in `config.js`:

```javascript
content: {
    title: "Your App Name",
    subtitle: "Your tagline",
    description: "Your description",
    features: [
        "🚀 Your feature 1",
        "📊 Your feature 2",
        // ... more features
    ]
}
```

## Troubleshooting

### Form Not Submitting

1. Check Google Apps Script URL in config
2. Verify Apps Script permissions
3. Check browser console for errors

### App Store Links Not Working

1. Verify URLs in `config.js`
2. Test on actual mobile devices
3. Check device detection in browser dev tools

### Styling Issues

1. Clear browser cache
2. Check CSS file is loading
3. Verify config.js theme values

## Support

For issues and questions:

1. Check browser console for errors
2. Verify all configuration values
3. Test on different devices/browsers
4. Check Google Apps Script logs

## License

This project is open source and available under the MIT License.
