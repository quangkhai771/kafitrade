// Configuration file for Kafi Trade Landing Page
const CONFIG = {
    // App Store Links
    appLinks: {
        android: "https://play.google.com/store/apps/details?id=vn.kafi.tradeapp&hl=vi",
        ios: "https://apps.apple.com/vn/app/kafi-trade/id1633169952"
    },
    
    // Google Sheets Integration
    googleSheets: {
        scriptUrl: "https://script.google.com/macros/s/AKfycbzOltKetO8uhGcvfKA2QpTgC9ea_F_i_SFNouhFdvnaCy0oHTCsi83vJtAWYydINGzZ/exec",
        sheetName: "Leads"
    },
    
    // Form Configuration
    form: {
        fields: {
            fullName: {
                enabled: true,
                required: true,
                placeholder: "Họ và tên"
            },
            phone: {
                enabled: true,
                required: true,
                placeholder: "Số điện thoại"
            },
            email: {
                enabled: false,
                required: false,
                placeholder: "Email"
            },
            company: {
                enabled: false,
                required: false,
                placeholder: "Công ty (tùy chọn)"
            },
            experience: {
                enabled: false,
                required: false,
                placeholder: "Kinh nghiệm trading"
            }
        },
        submitText: "Nhận ưu đãi ngay",
        successMessage: "Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm nhất.",
        errorMessage: "Có lỗi xảy ra. Vui lòng thử lại."
    },
    
    // Page Content
    content: {
        title: "MỞ TÀI KHOẢN",
        subtitle: "",
        description: "",
        features: [
            "🚀 Giao diện thân thiện, dễ sử dụng",
            "📊 Phân tích kỹ thuật chuyên sâu",
            "🤖 AI hỗ trợ đưa ra quyết định",
            "💰 Phí giao dịch thấp nhất thị trường",
            "🔒 Bảo mật cấp ngân hàng"
        ],
        offer: {
            title: "Ưu đãi đặc biệt",
            description: "Đăng ký ngay để nhận:",
            benefits: [
                "💎 Tài khoản VIP miễn phí 30 ngày",
                "🎁 Bonus 100$ khi nạp lần đầu",
                "📚 Khóa học trading miễn phí",
                "👨‍💼 Hỗ trợ 1-1 từ chuyên gia"
            ]
        }
    },
    
    // Styling
    theme: {
        primaryColor: "#6366f1",
        secondaryColor: "#8b5cf6",
        accentColor: "#f59e0b",
        backgroundColor: "#0f172a",
        textColor: "#ffffff"
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
