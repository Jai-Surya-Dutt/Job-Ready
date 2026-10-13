// Socket.IO connection
const socket = io('http://localhost:5000');

// DOM Elements
const profileSetup = document.getElementById('profileSetup');
const interviewInterface = document.getElementById('interviewInterface');
const userVideo = document.getElementById('userVideo');
const currentQuestion = document.getElementById('currentQuestion');
const answerText = document.getElementById('answerText');
const feedback = document.getElementById('feedback');
const startBtn = document.getElementById('startBtn');
const previousBtn = document.getElementById('previousBtn');
const nextBtn = document.getElementById('nextBtn');
const cameraToggle = document.getElementById('cameraToggle');
const micToggle = document.getElementById('micToggle');
const settingsToggle = document.getElementById('settingsToggle');

// Interview state
let currentSessionId = null;
let mediaStream = null;
let isRecording = false;
let recordedChunks = [];

// Initialize media devices
async function initializeMedia() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        userVideo.srcObject = mediaStream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Error accessing camera and microphone. Please ensure you have granted the necessary permissions.');
    }
}

// Start interview
async function startCustomizedInterview() {
    const jobRole = document.getElementById('jobRole').value;
    const experienceLevel = document.getElementById('experienceLevel').value;
    const userId = 'user-' + Date.now(); // In a real app, this would come from authentication

    if (!jobRole || !experienceLevel) {
        alert('Please select both job role and experience level');
        return;
    }

    // Initialize media devices
    await initializeMedia();

    // Show interview interface
    profileSetup.style.display = 'none';
    interviewInterface.style.display = 'block';

    // Start interview session
    socket.emit('startInterview', {
        jobRole,
        experienceLevel,
        userId
    });
}

// Socket event handlers
socket.on('question', (data) => {
    currentSessionId = data.sessionId;
    currentQuestion.textContent = data.question;
    answerText.textContent = '[Your response will appear here as you speak...]';
    feedback.textContent = 'Waiting for your response...';
});

socket.on('feedback', (data) => {
    if (data.sessionId === currentSessionId) {
        feedback.textContent = data.feedback;
    }
});

socket.on('interviewComplete', (data) => {
    if (data.sessionId === currentSessionId) {
        // Stop recording
        stopRecording();
        
        // Show completion message
        const feedbackSection = document.getElementById('feedbackSection');
        feedbackSection.style.display = 'block';
    }
});

socket.on('error', (data) => {
    alert(data.message);
});

// Recording functionality
function startRecording() {
    if (!mediaStream) return;
    
    recordedChunks = [];
    const mediaRecorder = new MediaRecorder(mediaStream);
    
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        // Here you would typically send the audio to a speech-to-text service
        // For now, we'll just simulate the answer
        simulateAnswer();
    };
    
    mediaRecorder.start();
    isRecording = true;
    startBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
}

function stopRecording() {
    if (!isRecording) return;
    
    mediaRecorder.stop();
    isRecording = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Recording';
}

// Simulate answer (replace with actual speech-to-text)
function simulateAnswer() {
    const sampleAnswer = "This is a sample answer to demonstrate the interview flow. In a real implementation, this would be the transcribed text from the user's audio recording.";
    answerText.textContent = sampleAnswer;
    socket.emit('answer', {
        answer: sampleAnswer,
        sessionId: currentSessionId
    });
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

cameraToggle.addEventListener('click', () => {
    if (mediaStream) {
        const videoTrack = mediaStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        cameraToggle.innerHTML = videoTrack.enabled ? 
            '<i class="fas fa-video"></i>' : 
            '<i class="fas fa-video-slash"></i>';
    }
});

micToggle.addEventListener('click', () => {
    if (mediaStream) {
        const audioTrack = mediaStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        micToggle.innerHTML = audioTrack.enabled ? 
            '<i class="fas fa-microphone"></i>' : 
            '<i class="fas fa-microphone-slash"></i>';
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Add any initialization code here
}); 