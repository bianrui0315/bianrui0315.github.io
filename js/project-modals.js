document.addEventListener('DOMContentLoaded', () => {
    const projectDetailModal = new bootstrap.Modal(document.getElementById('projectDetailModal'));
    const modalTitle = document.getElementById('projectDetailModalLabel');
    const modalSubheading = document.getElementById('modalProjectSubheading');
    const modalDescription = document.getElementById('modalProjectDescription');
    const modalTechnologies = document.getElementById('modalProjectTechnologies');
    const modalLinks = document.getElementById('modalProjectLinks');

    const projectDetails = {
        'image-classifier': {
            title: `Cute Animal Image Classifier`,
            subheading: `An interactive AI demonstration using TensorFlow.js.`,
            description: `This project showcases real-time image classification in the browser. It uses a pre-trained MobileNet model to identify various animals from user-uploaded images. This demonstrates the power of transfer learning and client-side machine learning.`,
            technologies: `TensorFlow.js, MobileNet, HTML, CSS, JavaScript`,
            links: `
                <a href="#" target="_blank" class="btn btn-sm btn-primary me-2">View Demo</a>
                <a href="#" target="_blank" class="btn btn-sm btn-secondary">GitHub Repo</a>
            `
        },
        'perceptron-visualization': {
            title: `Simple Perceptron Visualization`,
            subheading: `An interactive visualization of a basic neural network.`,
            description: `This tool allows users to interactively explore how a single perceptron learns to classify data points. You can add data points by clicking on the canvas and then train the perceptron to find a decision boundary. It visually demonstrates concepts like weights, bias, and iterative learning.`,
            technologies: `HTML Canvas, JavaScript`,
            links: `
                <a href="#" target="_blank" class="btn btn-sm btn-primary me-2">View Demo</a>
                <a href="#" target="_blank" class="btn btn-sm btn-secondary">GitHub Repo</a>
            `
        },
        'ai-translator': {
            title: `AI Language Translator (Demo)`,
            subheading: `Demonstrating basic language processing and translation.`,
            description: `This is a simplified demonstration of an AI-powered language translator. It uses a predefined dictionary to translate common phrases between English and Chinese, showcasing the fundamental concept of machine translation without requiring a backend API.`,
            technologies: `HTML, CSS, JavaScript`,
            links: `
                <a href="#" target="_blank" class="btn btn-sm btn-primary me-2">View Demo</a>
                <a href="#" target="_blank" class="btn btn-sm btn-secondary">GitHub Repo</a>
            `
        },
        'text-to-audio': {
            title: `Text-to-Audio Converter`,
            subheading: `Convert text to speech in multiple languages.`,
            description: `This tool leverages the Web Speech API to convert written text into spoken audio. It supports multiple languages (English, Chinese, Spanish, French, German, Japanese) and demonstrates the power of browser-based AI capabilities for natural language generation.`,
            technologies: `Web Speech API, HTML, CSS, JavaScript`,
            links: `
                <a href="#" target="_blank" class="btn btn-sm btn-primary me-2">View Demo</a>
                <a href="#" target="_blank" class="btn btn-sm btn-secondary">GitHub Repo</a>
            `
        },
        'ai-fact-generator': {
            title: `AI Fact Generator`,
            subheading: `Discover random AI knowledge and fun facts!`,
            description: `An engaging tool that randomly presents interesting facts and knowledge about Artificial Intelligence. It's designed to spark curiosity and provide quick insights into various AI concepts, from machine learning to robotics.`,
            technologies: `HTML, CSS, JavaScript`,
            links: `
                <a href="#" target="_blank" class="btn btn-sm btn-primary me-2">View Demo</a>
                <a href="#" target="_blank" class="btn btn-sm btn-secondary">GitHub Repo</a>
            `
        },
        'transparent-proxy': {
            title: `Transparent Proxy Detection and Analysis`,
            subheading: `Developed a novel method to detect and analyze transparent proxies.`,
            description: `This research project focused on identifying and analyzing over 1.5 million vulnerable transparent proxies on the internet. It involved developing sophisticated methods to detect these proxies and understand their ecosystem, contributing to internet security research.`,
            technologies: `Python, Scapy, Nmap, API, HTML, Curl, Ping, TraceRoute`,
            links: `
                <a href="https://www.sciencedirect.com/science/article/pii/S1389128622000937" target="_blank" class="btn btn-sm btn-primary me-2">View Publication</a>
            `
        },
        'anycast-analysis': {
            title: `Passive Analysis of Anycast in Global Routing`,
            subheading: `Designed a BGP-based methodology to identify anycast prefixes.`,
            description: `This project involved designing a novel methodology based on Border Gateway Protocol (BGP) to accurately identify anycast prefixes and analyze the unintended impact of remote peering on global routing. Achieved 90% detection accuracy.`,
            technologies: `Python, Bash, BGPStream, RIPE Atlas, Machine Learning, Routing Analytics`,
            links: `
                <a href="https://dl.acm.org/doi/10.1145/3371927.3371930" target="_blank" class="btn btn-sm btn-primary me-2">View Publication</a>
            `
        },
        'school-matching': {
            title: `School Matching AI Program`,
            subheading: `Machine learning-powered recommendation engine for school selection.`,
            description: `Built a machine learning-powered recommendation engine designed to assist parents in identifying suitable schools for their children. This involved data analysis, model development, and integration with visualization tools.`,
            technologies: `Python, Scikit-learn, Tableau, Azure AI, NLP`,
            links: `
                <a href="#" target="_blank" class="btn btn-sm btn-primary me-2">View Demo</a>
            `
        },
        'microlens-fabrication': {
            title: `SU-8 Microlens Array Fabrication`,
            subheading: `Novel method for fabricating ultralong focal length microlens arrays.`,
            description: `Proposed and simulated a novel method to fabricate microlens arrays with ultralong focal lengths using SU-8 photoresist. This project involved advanced simulation and design techniques in optical engineering.`,
            technologies: `Matlab, ANSYS, Surface Evolver, Photolithography, Finite Element Method`,
            links: `
                <a href="https://opg.optica.org/ao/abstract.cfm?uri=ao-54-16-5088" target="_blank" class="btn btn-sm btn-primary me-2">View Publication</a>
            `
        }
    };

    document.querySelectorAll('[data-bs-toggle="modal"]').forEach(button => {
        button.addEventListener('click', (event) => {
            const projectId = event.currentTarget.dataset.projectId;
            const project = projectDetails[projectId];

            console.log('Project ID:', projectId);
            console.log('Project Data:', project);

            if (project) {
                modalTitle.innerText = project.title;
                modalSubheading.innerText = project.subheading;
                modalDescription.innerText = project.description;
                modalTechnologies.innerHTML = `<strong>Technologies:</strong> ${project.technologies}`;
                modalLinks.innerHTML = project.links;
                projectDetailModal.show();
            }
        });
    });
});
