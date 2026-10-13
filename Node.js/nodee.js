// {
//     "name": "jobready-backend",
//     "version": "1.0.0",
//     "description": "Backend for JobReady mock interview system",
//     "main": "server.js",
//     "scripts": {
//       "start": "node server.js",
//       "dev": "nodemon server.js"
//     },
//     "dependencies": {
//       "express": "^4.18.2",
//       "cors": "^2.8.5",
//       "dotenv": "^16.3.1",
//       "@google/generative-ai": "^0.1.3",
//       "socket.io": "^4.7.2"
//     },
//     "devDependencies": {
//       "nodemon": "^3.0.2"
//     }
//   }
  require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Interview state management
const interviewSessions = new Map();

// Interview questions based on job role and experience level
const interviewQuestions = {
    'software-engineer': {
        'entry': [
            "Tell me about your experience with programming languages.",
            "How do you handle debugging complex issues?",
            "Explain the concept of object-oriented programming.",
            "What's your experience with version control systems?",
            "How do you ensure code quality in your projects?"
        ],
        'mid': [
            "Describe a challenging technical problem you've solved.",
            "How do you approach system design?",
            "Explain your experience with microservices architecture.",
            "How do you handle technical debt?",
            "Describe your experience with CI/CD pipelines."
        ],
        'senior': [
            "How do you lead technical decisions in your team?",
            "Describe your experience with scaling applications.",
            "How do you mentor junior developers?",
            "Explain your approach to system architecture.",
            "How do you handle technical conflicts in your team?"
        ]
    },
    // Add more job roles as needed
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('startInterview', async (data) => {
        const { jobRole, experienceLevel, userId } = data;
        const sessionId = `${userId}-${Date.now()}`;
        
        // Initialize interview session
        interviewSessions.set(sessionId, {
            currentQuestionIndex: 0,
            questions: interviewQuestions[jobRole][experienceLevel] || [],
            model: genAI.getGenerativeModel({ model: "gemini-pro" }),
            chat: null
        });

        // Start the interview
        const session = interviewSessions.get(sessionId);
        if (session.questions.length > 0) {
            const firstQuestion = session.questions[0];
            socket.emit('question', {
                question: firstQuestion,
                sessionId: sessionId
            });
        }
    });

    socket.on('answer', async (data) => {
        const { answer, sessionId } = data;
        const session = interviewSessions.get(sessionId);
        
        if (!session) {
            socket.emit('error', { message: 'Interview session not found' });
            return;
        }

        try {
            // Get AI feedback using Gemini
            const prompt = `As an experienced technical interviewer, please provide feedback on this answer to the question: "${session.questions[session.currentQuestionIndex]}"\n\nAnswer: ${answer}\n\nProvide constructive feedback focusing on technical accuracy, clarity, and areas for improvement.`;
            
            const result = await session.model.generateContent(prompt);
            const feedback = result.response.text();

            // Send feedback to client
            socket.emit('feedback', {
                feedback: feedback,
                sessionId: sessionId
            });

            // Move to next question
            session.currentQuestionIndex++;
            if (session.currentQuestionIndex < session.questions.length) {
                setTimeout(() => {
                    socket.emit('question', {
                        question: session.questions[session.currentQuestionIndex],
                        sessionId: sessionId
                    });
                }, 2000); // Wait 2 seconds before next question
            } else {
                // Interview completed
                socket.emit('interviewComplete', {
                    message: 'Interview completed successfully',
                    sessionId: sessionId
                });
                interviewSessions.delete(sessionId);
            }
        } catch (error) {
            console.error('Error processing answer:', error);
            socket.emit('error', { message: 'Error processing your answer' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// API endpoints
app.post('/api/interview/start', (req, res) => {
    const { jobRole, experienceLevel, userId } = req.body;
    
    if (!jobRole || !experienceLevel || !userId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    res.json({ message: 'Interview session started' });
});

app.get('/api/interview/status/:sessionId', (req, res) => {
    const session = interviewSessions.get(req.params.sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.json({
        currentQuestion: session.currentQuestionIndex + 1,
        totalQuestions: session.questions.length
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
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