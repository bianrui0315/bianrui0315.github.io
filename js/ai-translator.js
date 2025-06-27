const textToTranslate = document.getElementById('textToTranslate');
const translationDirection = document.getElementById('translationDirection');
const translateButton = document.getElementById('translateButton');
const translatedTextDisplay = document.getElementById('translatedTextDisplay');

// Simple dictionary for demonstration purposes
const translations = {
    "en-zh": {
        "hello": "你好",
        "how are you": "你好吗",
        "thank you": "谢谢",
        "goodbye": "再见",
        "artificial intelligence": "人工智能",
        "machine learning": "机器学习",
        "data science": "数据科学",
        "software engineering": "软件工程",
        "my name is rui": "我叫锐",
        "what is your name": "你叫什么名字",
        "i love ai": "我爱人工智能"
    },
    "zh-en": {
        "你好": "Hello",
        "你好吗": "How are you",
        "谢谢": "Thank you",
        "再见": "Goodbye",
        "人工智能": "Artificial Intelligence",
        "机器学习": "Machine Learning",
        "数据科学": "Data Science",
        "软件工程": "Software Engineering",
        "我叫锐": "My name is Rui",
        "你叫什么名字": "What is your name",
        "我爱人工智能": "I love AI"
    }
};

translateButton.addEventListener('click', () => {
    const inputText = textToTranslate.value.toLowerCase().trim();
    const direction = translationDirection.value;
    let translatedText = "";

    if (inputText === "") {
        translatedTextDisplay.innerText = "Please enter text to translate.";
        return;
    }

    if (translations[direction] && translations[direction][inputText]) {
        translatedText = translations[direction][inputText];
    } else {
        translatedText = "(Demo Translation: Phrase not found in dictionary. Try 'hello', 'thank you', or 'artificial intelligence'.)";
    }

    translatedTextDisplay.innerText = translatedText;
});
