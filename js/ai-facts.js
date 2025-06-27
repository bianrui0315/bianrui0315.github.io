const aiFacts = [
    { fact: "Artificial Intelligence (AI) is a broad field of computer science that enables machines to perform tasks that typically require human intelligence.", icon: "fas fa-robot" },
    { fact: "Machine Learning (ML) is a subset of AI that allows systems to learn from data without being explicitly programmed.", icon: "fas fa-brain" },
    { fact: "Deep Learning is a subfield of Machine Learning that uses neural networks with many layers (deep neural networks) to learn complex patterns.", icon: "fas fa-network-wired" },
    { fact: "The Turing Test, proposed by Alan Turing in 1950, is a test of a machine's ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human.", icon: "fas fa-user-secret" },
    { fact: "Neural networks are inspired by the structure and function of the human brain.", icon: "fas fa-brain" },
    { fact: "Natural Language Processing (NLP) is an AI field focused on enabling computers to understand, interpret, and generate human language.", icon: "fas fa-language" },
    { fact: "Computer Vision is an AI field that enables computers to 'see' and interpret visual information from the world.", icon: "fas fa-eye" },
    { fact: "Reinforcement Learning is an area of Machine Learning concerned with how intelligent agents ought to take actions in an environment to maximize the notion of cumulative reward.", icon: "fas fa-gamepad" },
    { fact: "The term 'Artificial Intelligence' was coined by John McCarthy in 1956.", icon: "fas fa-lightbulb" },
    { fact: "AlphaGo, an AI program developed by DeepMind, defeated the world Go champion Lee Sedol in 2016.", icon: "fas fa-chess-king" },
    { fact: "AI is used in various applications, including self-driving cars, medical diagnosis, financial trading, and personalized recommendations.", icon: "fas fa-cogs" },
    { fact: "Generative AI models, like GANs (Generative Adversarial Networks) and LLMs (Large Language Models), can create new content such as images, text, and music.", icon: "fas fa-paint-brush" },
    { fact: "The 'AI Winter' refers to periods of reduced funding and interest in AI research.", icon: "fas fa-snowflake" },
    { fact: "Robotics is a field that deals with the design, construction, operation, and use of robots, often incorporating AI.", icon: "fas fa-robot" },
    { fact: "Expert systems were an early form of AI that used rule-based systems to mimic human decision-making.", icon: "fas fa-user-tie" }
];

const aiFactDisplay = document.getElementById('aiFactDisplay');
const generateFactButton = document.getElementById('generateFactButton');

function getRandomFact() {
    const randomIndex = Math.floor(Math.random() * aiFacts.length);
    return aiFacts[randomIndex];
}

generateFactButton.addEventListener('click', () => {
    const factObj = getRandomFact();
    aiFactDisplay.innerHTML = `<i class="${factObj.icon} me-2"></i>${factObj.fact}`;
    aiFactDisplay.style.animation = 'none'; // Reset animation
    void aiFactDisplay.offsetWidth; // Trigger reflow
    aiFactDisplay.style.animation = null; // Reapply animation
});

// Display a random fact when the page loads
window.addEventListener('load', () => {
    const factObj = getRandomFact();
    aiFactDisplay.innerHTML = `<i class="${factObj.icon} me-2"></i>${factObj.fact}`;
});