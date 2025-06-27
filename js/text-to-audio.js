const textToConvert = document.getElementById('textToConvert');
const charCount = document.getElementById('charCount');
const languageSelect = document.getElementById('languageSelect');
const speakButton = document.getElementById('speakButton');

const synth = window.speechSynthesis;

textToConvert.addEventListener('input', () => {
    charCount.innerText = textToConvert.value.length;
});

speakButton.addEventListener('click', () => {
    const text = textToConvert.value;
    const lang = languageSelect.value;

    if (text.length === 0) {
        alert('Please enter some text to convert.');
        return;
    }

    if (text.length > 300) {
        alert('Text exceeds the 300 character limit.');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Optional: Find a suitable voice
    const voices = synth.getVoices();
    const selectedVoice = voices.find(voice => voice.lang === lang);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    synth.speak(utterance);
});
