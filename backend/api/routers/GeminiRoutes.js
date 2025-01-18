const express = require('express')
const {GoogleGenerativeAI} = require('@google/generative-ai');
require('dotenv').config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});


const primer_history = [
    {
        role: 'user',
        parts: [{
            text: ""
        }]
    }
];

router.get('/ask-bruno', async (req, res) => {
    const question = req.query.question;

    if (!question){
        res.status(400).json({error: true, message: 'Missing required query parameters.'});
        return;
    }

    try {
        const chat = model.startChat({
            history: primer_history,
            generationConfig: {
                maxOutputTokens: 1000
            }
        })
        const result = await chat.sendMessage(question);
        res.status(200).json({error: false, response: result.response.text()});
    } catch (error){
        res.status(500).json({error: true, message: error.message});
    }
});

module.exports = router;