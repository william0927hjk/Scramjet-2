require('dotenv').config();
const express   = require('express');
const path      = require('path');
const { URL }   = require('url');
const { OpenAI } = require('openai');

const app   = express();
const PORT  = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/ai-game', async (req, res) => {
    const userPrompt = req.body.prompt?.trim() ?? '';

    if (process.env.OPENAI_API_KEY && userPrompt) {
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                temperature: 0.8,
                messages: [
                    { role: 'system', content: 'You are a text‑based adventure game engine. Reply ONLY with HTML fragments, never plain text.' },
                    { role: 'user', content: userPrompt }
                ],
            });

            const reply = completion.choices[0].message.content;
            return res.json({ reply });
        } catch (err) {
            console.error('OpenAI error →', err);
        }
    }

    const mockReply = `
        <strong>AI Dungeon Master:</strong> You find yourself in a dimly lit cavern. A faint dripping echo surrounds you.
        <br><br>Do you <em>explore deeper</em> or <em>light a torch</em>?
    `;
    res.json({ reply: mockReply });
});

const { createScramjetServer } = require('mercuryworkshop-scramjet');

const scramjetOptions = {};

const scramjetHandler = createScramjetServer(scramjetOptions);

app.use('/proxy', async (req, res) => {
    try {
        const encodedTarget = req.path.replace(/^\/+/, '');
        if (!encodedTarget) {
            return res.status(400).send('Missing target URL. Use /proxy/<url‑encoded‑dest>');
        }

        const targetUrl = decodeURIComponent(encodedTarget);
        const parsed = new URL(targetUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return res.status(400).send('Only http/https URLs are allowed.');
        }

        await scramjetHandler(req, res, targetUrl);
    } catch (e) {
        console.error('Proxy error →', e);
        res.status(500).send('Proxy failed – see server console.');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Unblocked Hub listening on http://localhost:${PORT}`);
    console.log(`🔀 Proxy endpoint → http://localhost:${PORT}/proxy/<url‑encoded>`);
    console.log(`🤖 AI endpoint   → POST http://localhost:${PORT}/api/ai-game`);
});