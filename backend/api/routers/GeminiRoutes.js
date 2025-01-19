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
            text: `You will be asked multiple questions about Sheridan College Campuses.
            Most of these questions will be for directions and locations of popular Sheridan College Campus landmarks, or popular landmarks within 3km of a Sheridan College Campus.
            These questions could be with regards to either the Trafalgar Campus, or the HMC Campus. 
            Your replies should be in plain text without any format specifiers or structured data formats like JSON. 
            Do not include any tags or special characters that denote formatting. 
            Just provide the answer in simple text.
            Your response should align with the following data: `
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