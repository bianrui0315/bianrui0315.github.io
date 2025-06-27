import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const classifyButton = document.getElementById('classifyButton');
const predictionResult = document.getElementById('predictionResult');

let model;

async function loadModel() {
    predictionResult.innerText = 'Loading AI model...';
    model = await mobilenet.load();
    predictionResult.innerText = 'AI model loaded! Upload an image.';
}

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
            classifyButton.style.display = 'block';
            predictionResult.innerText = '';
        };
        reader.readAsDataURL(file);
    }
});

classifyButton.addEventListener('click', async () => {
    if (model && uploadedImage.src && uploadedImage.src !== '#') {
        predictionResult.innerText = 'Classifying...';
        const predictions = await model.classify(uploadedImage);
        
        if (predictions.length > 0) {
            const topPrediction = predictions[0];
            predictionResult.innerHTML = `I think it's a <strong>${topPrediction.className}</strong>! (Confidence: ${(topPrediction.probability * 100).toFixed(2)}%)`;
        } else {
            predictionResult.innerText = 'Could not classify the image.';
        }
    } else {
        predictionResult.innerText = 'Please upload an image first.';
    }
});

loadModel();
