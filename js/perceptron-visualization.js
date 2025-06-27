const canvas = document.getElementById('perceptronCanvas');
const ctx = canvas.getContext('2d');
const trainButton = document.getElementById('trainPerceptron');
const resetButton = document.getElementById('resetPerceptron');

const points = [];
let weights = [Math.random() * 2 - 1, Math.random() * 2 - 1]; // x, y
let bias = Math.random() * 2 - 1;
const learningRate = 0.1;

function drawLine() {
    // y = mx + b
    // 0 = w0*x + w1*y + bias
    // y = (-w0*x - bias) / w1
    const x1 = 0;
    const y1 = (-weights[0] * (x1 - canvas.width / 2) / (canvas.width / 2) - bias) / weights[1];
    const x2 = canvas.width;
    const y2 = (-weights[0] * (x2 - canvas.width / 2) / (canvas.width / 2) - bias) / weights[1];

    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.moveTo(x1, (y1 * canvas.height / 2) + canvas.height / 2);
    ctx.lineTo(x2, (y2 * canvas.height / 2) + canvas.height / 2);
    ctx.stroke();
}

function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLine();

    for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = p.label === 1 ? 'green' : 'red';
        ctx.fill();
        ctx.stroke();
    }
}

function activate(sum) {
    return sum >= 0 ? 1 : -1;
}

function train() {
    let errorCount = 0;
    for (const p of points) {
        const inputX = (p.x - canvas.width / 2) / (canvas.width / 2);
        const inputY = (p.y - canvas.height / 2) / (canvas.height / 2);
        const sum = inputX * weights[0] + inputY * weights[1] + bias;
        const prediction = activate(sum);
        const error = p.label - prediction;

        if (error !== 0) {
            errorCount++;
            weights[0] += error * inputX * learningRate;
            weights[1] += error * inputY * learningRate;
            bias += error * learningRate;
        }
    }
    drawPoints();
    return errorCount;
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determine label based on position (simple linear separation for demo)
    const label = y < canvas.height / 2 ? 1 : -1; // Points above center are green, below are red

    points.push({ x, y, label });
    drawPoints();
});

trainButton.addEventListener('click', () => {
    let errors = train();
    let iterations = 0;
    const interval = setInterval(() => {
        errors = train();
        iterations++;
        if (errors === 0 || iterations > 1000) { // Stop if no errors or max iterations
            clearInterval(interval);
        }
    }, 50);
});

resetButton.addEventListener('click', () => {
    points.length = 0;
    weights = [Math.random() * 2 - 1, Math.random() * 2 - 1];
    bias = Math.random() * 2 - 1;
    drawPoints();
});

drawPoints(); // Initial draw
