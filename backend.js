const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAIApi(new Configuration({ apiKey: 'YOUR_OPENAI_API_KEY' }));

app.post('/interview', async (req, res) => {
    const userAnswer = req.body.question;
    const prompt = You are an AI interviewer. Evaluate this answer: "${userAnswer}" and give feedback.;

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 100
    });

    res.json({ answer: response.data.choices[0].text.trim() });
});

app.listen(3000, () => console.log('Server running on port 3000'));