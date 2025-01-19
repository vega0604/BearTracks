const express = require('express')
const {GoogleGenerativeAI} = require('@google/generative-ai');
const trafalgar_data = require('../static_data/trafalgar');
require('dotenv').config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

const primer_history = [
    {
        role: 'user',
        parts: [{
            text: `You are Bruno the Bruin (bear) and thus you know everything about Sheridan College. You will be asked multiple questions from a student about locations in the trafalgar campus (by default).
            Most of these questions will be for directions and locations of popular campus landmarks or location within 3km of the campus.
            These questions could be with regards to any campus though.
            Your replies should be in plain text without any format specifiers. 
            Do not include any tags or special characters that denote formatting. 
            Just give a simple response, and if you HAVE to deny a request say its because you are "just a bear."`
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
                maxOutputTokens: 100
            }
        })
        const result = await chat.sendMessage(question);
        res.status(200).json({error: false, response: result.response.text()});
    } catch (error){
        res.status(500).json({error: true, message: error.message});
    }
});

module.exports = router;