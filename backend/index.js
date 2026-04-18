const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Basic route
app.get('/', (req, res) => {
    res.send('MERN Backend is running');
});

// Gemini API Route
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Use gemini-2.5-flash as the default model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

// Opportunity Engine Route
app.post('/api/analyze-opportunities', async (req, res) => {
    try {
        const { emails, profile } = req.body;
        if (!emails || !profile) return res.status(400).json({ error: 'Missing data' });

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `You are an AI Opportunity Intelligence Engine.
EMAILS: ${JSON.stringify(emails)}
PROFILE: ${JSON.stringify(profile)}
TASK: 1. Classify (Include ALL emails, even spam/irrelevant). 2. Extract structured fields. 3. Match against profile. 4. Score (Fit 40%, Urgency 25%, Benefit 20%, Effort 15%. Give spam/irrelevant emails a score of 0) based on how well it fits the student profile. 5. Rank EVERY email from highest to lowest score.
OUTPUT EXACTLY A VALID JSON ARRAY OF OBJECTS WITH NO MARKDOWN FORMATTING OR CODEBLOCKS.
Format of each object:
{
  "rank": number,
  "title": "string",
  "score": {
    "total": number,
    "fit": number,
    "urgency": number,
    "benefit": number,
    "effort": number
  },
  "reason": "string (Why relevant or why it was classified as spam)",
  "urgencyLevel": "High" | "Medium" | "Low" | "Spam",
  "extractedDetails": {
    "opportunityType": "string",
    "deadline": "string",
    "eligibilityCriteria": ["string"],
    "requiredDocuments": ["string"],
    "contactInfo": "string"
  },
  "actionChecklist": ["step 1", "step 2"]
}`;
        
        const result = await model.generateContent(prompt);
        let rawResponse = result.response.text();
        rawResponse = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        let parsedResult = JSON.parse(rawResponse);

        res.json({ result: parsedResult });
    } catch (error) {
        console.error("AI Analysis Error", error);
        res.status(500).json({ error: error.message || 'Analysis failed or AI returned invalid format' });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
