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