
document.addEventListener('DOMContentLoaded', function() {
    createChatbotElements();
    initChatbotEvents();
    initResponseTemplates();
});

let botResponses = {};

const relevantKeywords = [
    "balo", "túi", "túi xách", "thời trang", "ba lô", "backpack", "fashion", 
    "phụ kiện", "sản phẩm", "giá", "đặt hàng", "mua", "thanh toán", "giao hàng", "ship", 
    "vận chuyển", "khuyến mãi", "giảm giá", "sale", "ưu đãi", "voucher", "mã giảm giá", 
    "chất liệu", "màu sắc", "size", "kích thước", "chi phí", "đổi trả", "bảo hành", 
    "sản phẩm mới", "xu hướng", "trend", "collection", "bộ sưu tập", "dòng sản phẩm",
    "adidas", "nike", "thể thao", "du lịch", "travel", "laptop", "học sinh", "sinh viên",
    "công sở", "chống nước", "bền", "đẹp", "thời trang", "fashionable"
];

const openaiConfig = {
    apiKey: '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', 
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
};

function createChatbotElements() {
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    
    const chatbotButton = document.createElement('div');
    chatbotButton.className = 'chatbot-button';
    chatbotButton.innerHTML = '<i class="fas fa-comments"></i>';
    
    const chatbotBox = document.createElement('div');
    chatbotBox.className = 'chatbot-box';
    
    const chatbotHeader = document.createElement('div');
    chatbotHeader.className = 'chatbot-header';
    chatbotHeader.innerHTML = '<h4>Hỗ trợ khách hàng</h4><span class="chatbot-close">&times;</span>';
    
    const chatbotMessages = document.createElement('div');
    chatbotMessages.className = 'chatbot-messages';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    typingIndicator.style.display = 'none';
    chatbotMessages.appendChild(typingIndicator);
    
    const chatbotInput = document.createElement('div');
    chatbotInput.className = 'chatbot-input';
    chatbotInput.innerHTML = '<input type="text" placeholder="Nhập tin nhắn..."><button>Gửi</button>';
    
    chatbotBox.appendChild(chatbotHeader);
    chatbotBox.appendChild(chatbotMessages);
    chatbotBox.appendChild(chatbotInput);
    
    chatbotContainer.appendChild(chatbotBox);
    chatbotContainer.appendChild(chatbotButton);
    document.body.appendChild(chatbotContainer);
}


function initChatbotEvents() {
    const chatbotButton = document.querySelector('.chatbot-button');
    const chatbotBox = document.querySelector('.chatbot-box');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotInput = document.querySelector('.chatbot-input input');
    const chatbotSendButton = document.querySelector('.chatbot-input button');
    
    chatbotButton.addEventListener('click', function() {
        chatbotBox.classList.add('active');
        chatbotButton.style.display = 'none';
        const messages = document.querySelector('.chatbot-messages');
        const messageElements = messages.querySelectorAll('.message');
        if (messageElements.length === 0) {
            addBotMessage("Xin chào! Tôi là trợ lý ảo của Shop Balo Thời Trang. Tôi có thể giúp bạn với thông tin về sản phẩm, giá cả, đặt hàng và các chương trình khuyến mãi.");
        }
    });
    
    
    chatbotClose.addEventListener('click', function() {
        chatbotBox.classList.remove('active');
        chatbotButton.style.display = 'flex';
    });
    
    
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    chatbotSendButton.addEventListener('click', sendMessage);
}


function sendMessage() {
    const chatbotInput = document.querySelector('.chatbot-input input');
    const message = chatbotInput.value.trim();
    
    if (message !== '') {
        addUserMessage(message);
        chatbotInput.value = '';
        showTypingIndicator();
        if (isRelevantQuestion(message)) {
            processWithOpenAI(message);
        } else {
            setTimeout(() => {
                processIrrelevantQuestion(message);
            }, 800);
        }
    }
}

function showTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    typingIndicator.style.display = 'block';
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    typingIndicator.style.display = 'none';
}

function addUserMessage(message) {
    const messagesContainer = document.querySelector('.chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.textContent = message;
    
    const typingIndicator = document.querySelector('.typing-indicator');
    messagesContainer.insertBefore(messageElement, typingIndicator);
    scrollToBottom();
}

function addBotMessage(message) {
    const messagesContainer = document.querySelector('.chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.textContent = message;
    const typingIndicator = document.querySelector('.typing-indicator');
    messagesContainer.insertBefore(messageElement, typingIndicator);
    
    scrollToBottom();
}


function scrollToBottom() {
    const messagesContainer = document.querySelector('.chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function isRelevantQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    return relevantKeywords.some(keyword => lowerQuestion.includes(keyword));
}


function processIrrelevantQuestion(question) {
    const prompt = `
    Người dùng đã hỏi: "${question}"
    
    Đây là một câu hỏi không liên quan đến các sản phẩm balo thời trang của cửa hàng chúng tôi. 
    Hãy trả lời lịch sự rằng bạn không hỗ trợ về vấn đề này và gợi ý một số chủ đề mà bạn có thể trợ giúp, 
    như thông tin về sản phẩm balo, túi xách, giá cả, đặt hàng, giao hàng, khuyến mãi, hoặc chính sách đổi trả.
    `;
    
    callOpenAI(prompt).then(response => {
        hideTypingIndicator();
        addBotMessage(response);
    }).catch(error => {
        console.error('Error calling OpenAI:', error);
        hideTypingIndicator();
        
        addBotMessage("Xin lỗi, tôi không thể hỗ trợ về vấn đề này. Tôi chỉ có thể giúp bạn với thông tin về sản phẩm balo, túi xách, giá cả, đặt hàng, giao hàng, khuyến mãi, hoặc chính sách đổi trả của cửa hàng.");
    });
}

function processWithOpenAI(question) {
    const prompt = `
    Người dùng đã hỏi: "${question}"
    
    Hãy đưa ra câu trả lời ngắn gọn, hữu ích và thân thiện về cửa hàng balo thời trang của chúng tôi.
    Chúng tôi chuyên bán các loại balo thời trang, túi xách, và phụ kiện thời trang với nhiều mẫu mã đa dạng.
    Sản phẩm có giá từ 100.000đ đến 1.000.000đ tùy loại.
    Chúng tôi có chính sách giao hàng toàn quốc, đổi trả trong vòng 7 ngày, và bảo hành 30 ngày cho các lỗi từ nhà sản xuất.
    Hiện có chương trình khuyến mãi giảm giá 20% cho tất cả sản phẩm và mua 2 tặng 1.
    `;
    
    callOpenAI(prompt).then(response => {
        hideTypingIndicator();
        addBotMessage(response);
    }).catch(error => {
        console.error('Error calling OpenAI:', error);
        hideTypingIndicator();
        processBotResponse(question); 
    });
}

async function callOpenAI(prompt) {
    try {
        const response = await fetch(openaiConfig.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: openaiConfig.model,
                messages: [
                    {
                        role: "system",
                        content: "Bạn là trợ lý ảo của cửa hàng balo thời trang. Hãy trả lời ngắn gọn, thân thiện và hữu ích."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
}

function processBotResponse(userMessage) {
    
    const message = userMessage.toLowerCase();
    let botResponse = "Xin lỗi, tôi không hiểu ý bạn. Bạn có thể hỏi về sản phẩm balo, túi xách, giá cả, hoặc cách đặt hàng.";
    for (const key in botResponses) {
        if (message.includes(key)) {
            botResponse = botResponses[key];
            break;
        }
    }
    
    addBotMessage(botResponse);
}

function initResponseTemplates() {
    botResponses = {
        "xin chào": "Xin chào! Tôi có thể giúp gì cho bạn?",
        "hello": "Xin chào! Tôi có thể giúp gì cho bạn?",
        "hi": "Xin chào! Tôi có thể giúp gì cho bạn?",
        
        "balo": "Chúng tôi có nhiều loại balo thời trang với nhiều kiểu dáng và màu sắc khác nhau. Các sản phẩm balo của chúng tôi đều được làm từ chất liệu cao cấp, bền đẹp và tiện dụng.",
        "túi xách": "Chúng tôi có đa dạng các mẫu túi xách thời trang dành cho nữ, từ túi xách công sở đến túi đeo chéo. Bạn có thể tham khảo các sản phẩm túi xách tại trang Sản phẩm.",
        "thời trang": "Chúng tôi chuyên cung cấp các sản phẩm balo, túi xách thời trang cao cấp với nhiều mẫu mã đa dạng và phong cách khác nhau.",
        
        "sản phẩm": "Chúng tôi có nhiều loại sản phẩm balo, túi xách thời trang. Bạn có thể xem chi tiết tại trang Sản phẩm.",
        "giá": "Giá sản phẩm của chúng tôi dao động từ 100.000đ đến 1.000.000đ tùy loại. Bạn có thể xem chi tiết giá từng sản phẩm tại trang Sản phẩm.",
        "đặt hàng": "Để đặt hàng, bạn chỉ cần chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán khác nhau.",
        
        "khuyến mãi": "Hiện tại chúng tôi đang có chương trình giảm giá 20% cho tất cả sản phẩm nhân dịp cuối năm. Mua 2 sản phẩm sẽ được tặng 1 mẫu thử miễn phí.",
        "giao hàng": "Chúng tôi giao hàng toàn quốc, phí ship từ 20.000đ đến 40.000đ tùy khu vực. Đơn hàng trên 500.000đ sẽ được miễn phí giao hàng.",
        
        "liên hệ": "Bạn có thể liên hệ với chúng tôi qua số điện thoại: 012 345 67890 hoặc email: info@example.com",
        "địa chỉ": "Địa chỉ cửa hàng: 123 Lê Văn Việt, Quận 9, TP.Hồ Chí Minh",
        
        "cảm ơn": "Không có gì! Rất vui được hỗ trợ bạn. Nếu có thắc mắc gì khác, hãy cho tôi biết nhé.",
        "tạm biệt": "Tạm biệt! Chúc bạn một ngày tốt lành!",
        "bye": "Tạm biệt! Chúc bạn một ngày tốt lành!",
        
        "đổi trả": "Chính sách đổi trả của chúng tôi cho phép bạn đổi hoặc trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm cần giữ nguyên tem nhãn và không có dấu hiệu đã qua sử dụng.",
        "bảo hành": "Chúng tôi bảo hành sản phẩm trong vòng 30 ngày đối với các lỗi từ nhà sản xuất. Vui lòng liên hệ với chúng tôi nếu sản phẩm của bạn gặp vấn đề."
    };
}