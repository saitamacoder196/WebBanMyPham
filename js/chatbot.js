// Chờ document load xong
document.addEventListener('DOMContentLoaded', function() {
    // Tạo các phần tử HTML cho chatbot
    createChatbotElements();
    
    // Khởi tạo event listeners
    initChatbotEvents();
    
    // Chuẩn bị các câu trả lời mẫu
    initResponseTemplates();
});

// Đối tượng lưu trữ các câu hỏi và trả lời
let botResponses = {};

// Tạo các phần tử HTML cho chatbot
function createChatbotElements() {
    // Tạo container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    
    // Tạo nút toggle
    const chatbotButton = document.createElement('div');
    chatbotButton.className = 'chatbot-button';
    chatbotButton.innerHTML = '<i class="fas fa-comments"></i>';
    
    // Tạo box chat
    const chatbotBox = document.createElement('div');
    chatbotBox.className = 'chatbot-box';
    
    // Tạo header
    const chatbotHeader = document.createElement('div');
    chatbotHeader.className = 'chatbot-header';
    chatbotHeader.innerHTML = '<h4>Hỗ trợ khách hàng</h4><span class="chatbot-close">&times;</span>';
    
    // Tạo khu vực tin nhắn
    const chatbotMessages = document.createElement('div');
    chatbotMessages.className = 'chatbot-messages';
    
    // Tạo khu vực input
    const chatbotInput = document.createElement('div');
    chatbotInput.className = 'chatbot-input';
    chatbotInput.innerHTML = '<input type="text" placeholder="Nhập tin nhắn..."><button>Gửi</button>';
    
    // Ghép các phần tử lại với nhau
    chatbotBox.appendChild(chatbotHeader);
    chatbotBox.appendChild(chatbotMessages);
    chatbotBox.appendChild(chatbotInput);
    
    chatbotContainer.appendChild(chatbotBox);
    chatbotContainer.appendChild(chatbotButton);
    
    // Thêm vào body
    document.body.appendChild(chatbotContainer);
}

// Khởi tạo các sự kiện cho chatbot
function initChatbotEvents() {
    const chatbotButton = document.querySelector('.chatbot-button');
    const chatbotBox = document.querySelector('.chatbot-box');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotInput = document.querySelector('.chatbot-input input');
    const chatbotSendButton = document.querySelector('.chatbot-input button');
    
    // Hiển thị chatbot khi click vào nút
    chatbotButton.addEventListener('click', function() {
        chatbotBox.classList.add('active');
        chatbotButton.style.display = 'none';
        
        // Hiển thị tin nhắn chào mừng nếu không có tin nhắn nào
        const messages = document.querySelector('.chatbot-messages');
        if (messages.children.length === 0) {
            addBotMessage("Xin chào! Tôi có thể giúp gì cho bạn?");
        }
    });
    
    // Đóng chatbot
    chatbotClose.addEventListener('click', function() {
        chatbotBox.classList.remove('active');
        chatbotButton.style.display = 'flex';
    });
    
    // Gửi tin nhắn khi nhấn Enter
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Gửi tin nhắn khi click nút Gửi
    chatbotSendButton.addEventListener('click', sendMessage);
}

// Hàm gửi tin nhắn
function sendMessage() {
    const chatbotInput = document.querySelector('.chatbot-input input');
    const message = chatbotInput.value.trim();
    
    if (message !== '') {
        // Hiển thị tin nhắn của người dùng
        addUserMessage(message);
        
        // Xóa text trong ô input
        chatbotInput.value = '';
        
        // Xử lý và hiển thị phản hồi của bot
        setTimeout(function() {
            processBotResponse(message);
        }, 500);
    }
}

// Thêm tin nhắn người dùng vào khung chat
function addUserMessage(message) {
    const messagesContainer = document.querySelector('.chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    
    // Cuộn xuống để hiển thị tin nhắn mới nhất
    scrollToBottom();
}

// Thêm tin nhắn bot vào khung chat
function addBotMessage(message) {
    const messagesContainer = document.querySelector('.chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    
    // Cuộn xuống để hiển thị tin nhắn mới nhất
    scrollToBottom();
}

// Cuộn xuống cuối cùng của khung chat
function scrollToBottom() {
    const messagesContainer = document.querySelector('.chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Xử lý phản hồi của bot
function processBotResponse(userMessage) {
    // Chuyển đổi tin nhắn người dùng thành chữ thường để dễ so sánh
    const message = userMessage.toLowerCase();
    
    // Tìm câu trả lời phù hợp
    let botResponse = "Xin lỗi, tôi không hiểu ý bạn. Bạn có thể hỏi về sản phẩm, giá cả, hoặc cách đặt hàng.";
    
    // Kiểm tra từ khóa trong tin nhắn
    for (const key in botResponses) {
        if (message.includes(key)) {
            botResponse = botResponses[key];
            break;
        }
    }
    
    // Hiển thị câu trả lời
    addBotMessage(botResponse);
}

// Khởi tạo các mẫu câu trả lời
function initResponseTemplates() {
    botResponses = {
        "xin chào": "Xin chào! Tôi có thể giúp gì cho bạn?",
        "hello": "Xin chào! Tôi có thể giúp gì cho bạn?",
        "hi": "Xin chào! Tôi có thể giúp gì cho bạn?",
        
        "sản phẩm": "Chúng tôi có nhiều loại sản phẩm chăm sóc da, trang điểm và dưỡng ẩm. Bạn có thể xem chi tiết tại trang Sản phẩm.",
        "giá": "Giá sản phẩm của chúng tôi dao động từ 100.000đ đến 1.000.000đ tùy loại. Bạn có thể xem chi tiết giá từng sản phẩm tại trang Sản phẩm.",
        "đặt hàng": "Để đặt hàng, bạn chỉ cần chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán khác nhau.",
        
        "khuyến mãi": "Hiện tại chúng tôi đang có chương trình giảm giá 20% cho tất cả sản phẩm nhân dịp cuối năm. Mua 2 sản phẩm sẽ được tặng 1 mẫu thử miễn phí.",
        "giao hàng": "Chúng tôi giao hàng toàn quốc, phí ship từ 20.000đ đến 40.000đ tùy khu vực. Đơn hàng trên 500.000đ sẽ được miễn phí giao hàng.",
        
        "liên hệ": "Bạn có thể liên hệ với chúng tôi qua số điện thoại: 012 345 67890 hoặc email: info@example.com",
        "địa chỉ": "Địa chỉ cửa hàng: 123 Lê Văn Việt, Quận 9, TP.Hồ Chí Minh",
        
        "cảm ơn": "Không có gì! Rất vui được hỗ trợ bạn. Nếu có thắc mắc gì khác, hãy cho tôi biết nhé.",
        "tạm biệt": "Tạm biệt! Chúc bạn một ngày tốt lành!",
        "bye": "Tạm biệt! Chúc bạn một ngày tốt lành!"
    };
}