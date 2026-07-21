/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON body limits for long transcripts
app.use(express.json({ limit: '10mb' }));

// Utility to get the appropriate Gemini API client
function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No API Key configured. Please add a GEMINI_API_KEY to your workspace secrets or provide a custom key.');
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Custom fetch helper for third-party providers (Groq & OpenRouter)
async function callOpenAICompatibleProvider(
  url: string,
  key: string,
  model: string,
  systemInstruction: string,
  userPrompt: string,
  jsonMode = false
) {
  try {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
    if (url.includes('openrouter')) {
      headers['HTTP-Referer'] = 'https://ai.studio/build';
      headers['X-Title'] = 'AI Learning Vault';
    }

    const body = {
      model: model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: jsonMode ? { type: 'json_object' } : undefined
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Provider returned error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    throw new Error(`Failed to contact API provider: ${error.message}`);
  }
}

// Helper to parse JSON from AI outputs safely
function parseAIJson(text: string) {
  try {
    // Find first '{' and last '}' to strip markdown formatting if any
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error('AI response did not contain a JSON object block.');
    }
    const cleanJson = text.substring(start, end + 1);
    return JSON.parse(cleanJson);
  } catch (err: any) {
    console.error('JSON parsing failed on text:', text);
    throw new Error(`Could not parse structured output from AI: ${err.message}. Response was: ${text}`);
  }
}

// --- API ENDPOINTS ---

// Test Provider Connection
app.post('/api/ai/test-connection', async (req: express.Request, res: express.Response): Promise<void> => {
  const { provider, apiKey, model } = req.body;
  if (!apiKey) {
    res.status(400).json({ error: 'API key is required to test connection.' });
    return;
  }

  try {
    if (provider === 'Google Gemini') {
      const ai = getGeminiClient(apiKey);
      const testModel = model || 'gemini-3.5-flash';
      const response = await ai.models.generateContent({
        model: testModel,
        contents: 'Respond with exactly one word: "OK"',
      });
      const result = response.text?.trim() || '';
      if (result.toUpperCase().includes('OK')) {
        res.json({ success: true, message: 'Connection successful!' });
      } else {
        res.json({ success: false, message: `Unexpected response: ${result}` });
      }
    } else if (provider === 'Groq') {
      const testModel = model || 'llama-3.3-70b-versatile';
      const result = await callOpenAICompatibleProvider(
        'https://api.groq.com/openai/v1/chat/completions',
        apiKey,
        testModel,
        'You are a testing utility.',
        'Respond with exactly one word: "OK"'
      );
      if (result.toUpperCase().includes('OK')) {
        res.json({ success: true, message: 'Connection successful!' });
      } else {
        res.json({ success: false, message: `Unexpected response: ${result}` });
      }
    } else if (provider === 'OpenRouter') {
      const testModel = model || 'meta-llama/llama-3.3-70b-instruct:free';
      const result = await callOpenAICompatibleProvider(
        'https://openrouter.ai/api/v1/chat/completions',
        apiKey,
        testModel,
        'You are a testing utility.',
        'Respond with exactly one word: "OK"'
      );
      if (result.toUpperCase().includes('OK')) {
        res.json({ success: true, message: 'Connection successful!' });
      } else {
        res.json({ success: false, message: `Unexpected response: ${result}` });
      }
    } else {
      res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Connection test failed.' });
  }
});

// Analyze Content Transcript
app.post('/api/ai/analyse-transcript', async (req: express.Request, res: express.Response): Promise<void> => {
  const {
    transcript,
    content_type,
    platform,
    creator_name,
    original_link,
    personal_notes,
    user_experience_level,
    user_learning_goals,
    user_interests,
    customProvider,
    customKey,
    customModel
  } = req.body;

  if (!transcript || transcript.trim() === '') {
    res.status(400).json({ error: 'Transcript text is required for AI analysis.' });
    return;
  }

  const systemInstruction = `You are a beginner-friendly educational AI assistant.
Your job is to read transcripts from AI-related videos/reels and turn them into highly structured, actionable, and extremely simple knowledge cards.
Adhere strictly to the "Explain Like I Am Five" (ELI5) methodology:
- Use short, punchy sentences.
- Use humble, simple words. Avoid technical jargon without explaining it first.
- Provide simple examples and real-life analogies.
- Calculate a personal relevance score (0-100) and a brief reason based on the user's experience level, interests, and goals.

Return a valid, structured JSON object matching this schema EXACTLY:
{
  "title": "A short, simple, catchy title for this lesson",
  "main_topic": "The main technical topic, e.g. Autonomous Agents",
  "category": "One of: AI tools, AI agents, Automation, Content creation, Research, Product building, Coding, Productivity, Other",
  "tool_name": "Name of the main tool mentioned, or 'None' if none",
  "simple_summary": "One sentence simple summary of what this teaches",
  "detailed_summary": "A 3-4 sentence comprehensive overview",
  "simple_explanation": {
    "what_is_it": "Simple explanation of what this is (ELI5)",
    "why_it_matters": "Why a beginner should care about this",
    "how_it_works": "How it works in plain terms",
    "where_to_use_it": "Real world situation where they can apply this",
    "what_to_do_next": "A clear, small first action step"
  },
  "problem_solved": "The precise frustration this tool/technique solves",
  "main_claims": ["List of 2-3 main claims the video creator made"],
  "important_concepts": ["List of 2-3 key terms or concepts to learn"],
  "important_steps": ["Step-by-step instructions (3-5 steps) explained in simple terms"],
  "possible_use_cases": ["2-3 practical, simple use cases"],
  "target_user": "Who this is ideally for",
  "difficulty": "Easy, Medium, or Hard",
  "estimated_time": "Time needed to try this, e.g. 10 minutes, 1 hour",
  "coding_required": "Yes, No, or Unknown",
  "phone_friendly": "Yes, No, or Unknown",
  "pricing_type": "Free, Freemium, Paid, or Unknown",
  "required_tools": ["List of tools they need to sign up for to try this"],
  "limitations": ["List of 1-2 limitations or things that might fail"],
  "investigation_questions": ["1-2 questions that still need testing to prove the claims"],
  "relevance_score": 85,
  "relevance_reason": "Explain simply why this is relevant to their goals and interests",
  "recommended_decision": "One of: Test now, Learn later, Save as reference, Compare",
  "suggested_action": "Specific next step action"
}`;

  const userPrompt = `Analyze this transcript with the user goals in mind:
Experience level: ${user_experience_level || 'Beginner'}
Goals: ${user_learning_goals || 'Learn AI'}
Interests: ${(user_interests || []).join(', ') || 'AI productivity'}

Transcript text:
"${transcript}"

Content Details:
Type: ${content_type}
Platform: ${platform || 'Unknown'}
Creator: ${creator_name || 'Unknown'}
Original Link: ${original_link || 'None'}
Personal Notes: ${personal_notes || 'None'}`;

  try {
    let aiResponseText = '';

    if (customProvider && customProvider !== 'Google Gemini' && customKey) {
      // Third-party provider
      const apiUrl = customProvider === 'Groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions';
      const fallbackModel = customProvider === 'Groq'
        ? 'llama-3.3-70b-versatile'
        : 'meta-llama/llama-3.3-70b-instruct:free';
      
      aiResponseText = await callOpenAICompatibleProvider(
        apiUrl,
        customKey,
        customModel || fallbackModel,
        systemInstruction,
        userPrompt,
        true
      );
    } else {
      // Google Gemini (Default or custom key)
      const ai = getGeminiClient(customKey);
      const selectedModel = customModel || 'gemini-3.5-flash';
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });
      aiResponseText = response.text || '';
    }

    const structuredData = parseAIJson(aiResponseText);
    res.json(structuredData);
  } catch (error: any) {
    console.error('Error during transcript analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze transcript.' });
  }
});

// Explain a Detail Section Like I Am 5 (ELI5 rewrite)
app.post('/api/ai/explain-section', async (req: express.Request, res: express.Response): Promise<void> => {
  const { section_title, section_content, explanation_style, customKey } = req.body;
  if (!section_content) {
    res.status(400).json({ error: 'Section content is required.' });
    return;
  }

  const systemInstruction = `You are an expert at simplification. Rewrite the provided topic/content to be extremely easy to understand.
Style requirement: "${explanation_style || 'Explain like I am five'}".
Use short sentences, friendly tone, simple real-world analogies, and zero unexplained technical jargon. Keep it under 150 words.`;

  const userPrompt = `Please simplify this content:
Section Title: ${section_title || 'Topic'}
Content to simplify:
"${section_content}"`;

  try {
    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: { systemInstruction, temperature: 0.3 }
    });
    res.json({ explanation: response.text?.trim() || '' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to simplify section.' });
  }
});

// Generate a Micro-Experiment
app.post('/api/ai/generate-experiment', async (req: express.Request, res: express.Response): Promise<void> => {
  const { title, tool_name, main_topic, simple_explanation, important_steps, required_tools, customKey } = req.body;

  const systemInstruction = `You are a practical learning AI assistant. Your goal is to design a small, hyper-focused, safe micro-experiment based on a tool or technique.
The experiment MUST be achievable in under 15 minutes, require NO coding, and focus on testing one narrow claim in a free sandbox.
Avoid vague or heavy instructions. Give specific, bite-sized tasks.

Return a valid, structured JSON object matching this schema EXACTLY:
{
  "title": "A fun, simple experiment title",
  "test_question": "What is the specific, narrow question being tested? (e.g., Does Vapi disconnect on a 10s silence?)",
  "objective": "A 1-sentence simple objective",
  "why_it_matters": "Why testing this is important (ELI5)",
  "steps": ["Step 1...", "Step 2...", "Step 3... (max 4 steps)"],
  "estimated_time": "Time estimate, e.g. 10 minutes",
  "tools_required": ["List of free tools needed"],
  "prompt_used": "A copy-pasteable prompt they can use to test it, or 'None' if not applicable",
  "expected_result": "What they should see happen",
  "success_criteria": "The exact condition that proves the claim worked",
  "evidence_required": "What screenshot or log they should save as proof",
  "possible_problems": ["1-2 things that could go wrong or be confusing"]
}`;

  const userPrompt = `Create an experiment for this item:
Title: ${title}
Tool: ${tool_name}
Topic: ${main_topic}
Explanation: ${JSON.stringify(simple_explanation)}
Steps: ${JSON.stringify(important_steps)}
Required tools: ${JSON.stringify(required_tools)}`;

  try {
    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });
    const experimentData = parseAIJson(response.text || '');
    res.json(experimentData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate experiment.' });
  }
});

// Generate Product Idea
app.post('/api/ai/generate-product-idea', async (req: express.Request, res: express.Response): Promise<void> => {
  const { items, customKey } = req.body;
  if (!items || items.length === 0) {
    res.status(400).json({ error: 'Please select at least one knowledge item.' });
    return;
  }

  const systemInstruction = `You are a startup and micro-SaaS advisor.
Your goal is to help non-technical beginners turn their saved AI knowledge into realistic, micro-product ideas that solve real local business frustrations.
Clearly explain the difference between an interesting idea and a real problem that people will pay for.

Return a valid, structured JSON object matching this schema EXACTLY:
{
  "problem": "The specific painful problem observed in real life",
  "evidence": "How the saved content provides proof of demand or capability",
  "target_user": "The specific small business or professional who has this pain",
  "existing_solutions": "What they currently use and why it is frustrating",
  "market_gap": "What is missing that your simple AI solution can fix",
  "proposed_solution": "A simple, non-technical AI solution built with no-code",
  "why_now": "Why this is possible and valuable today",
  "core_features": ["3 basic features of the MVP"],
  "mvp_scope": "The absolute smallest, fastest way to test this idea in 1 day",
  "validation_test": "How to get 1st customer or validation proof",
  "difficulty": "Easy, Medium, or Hard",
  "estimated_cost": "Free, Low, Medium, or High",
  "monetization": ["1-2 simple pricing models, e.g., $50 setup fee"],
  "risks": ["1-2 simple risks or hurdles"],
  "next_action": "The very first, easiest thing the user should do today"
}`;

  const userPrompt = `Generate a business idea from these saved items:
${items.map((it: any, i: number) => `Item ${i+1}:
Title: ${it.title}
Tool: ${it.tool_name}
Topic: ${it.main_topic}
Problem: ${it.problem_solved}
Use cases: ${JSON.stringify(it.possible_use_cases)}`).join('\n\n')}`;

  try {
    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });
    const ideaData = parseAIJson(response.text || '');
    res.json(ideaData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate product idea.' });
  }
});

// Generate Content Draft
app.post('/api/ai/generate-content-draft', async (req: express.Request, res: express.Response): Promise<void> => {
  const { title, tool_name, main_claims, experiment, content_type, customKey } = req.body;

  const systemInstruction = `You are an educational content creator.
Your goal is to write a highly engaging social media post (or draft script) that explains a tool.
Crucially, you MUST separate hype from reality:
- Clearly state what the original video creator claimed.
- Clearly describe what the user actually tested in their experiment.
- Explain what happened, what worked, and what failed.
- Share a helpful lesson or honest advice.
Avoid marketing jargon. Be humble, transparent, and educational.`;

  const userPrompt = `Draft a ${content_type} based on this test:
Knowledge Item: ${title}
Tool: ${tool_name}
Original claims: ${JSON.stringify(main_claims)}
Experiment tested: ${JSON.stringify(experiment)}`;

  try {
    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: { systemInstruction, temperature: 0.4 }
    });
    res.json({ draft: response.text?.trim() || '' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate content draft.' });
  }
});

// Generate Weekly Review
app.post('/api/ai/generate-weekly-review', async (req: express.Request, res: express.Response): Promise<void> => {
  const { stats, onboarding, customKey } = req.body;

  const systemInstruction = `You are a supportive learning coach.
Analyze the user's weekly learning stats and provide a friendly report.
Highlight what they saved, what they actually tested (remember: testing matters most!), what skills they developed, and knowledge gaps.
Provide a clear, reassuring recommended focus message for next week (e.g. encouraging them to try a pending experiment).

Return a valid, structured JSON object matching this schema EXACTLY:
{
  "report_data": {
    "items_added": 0,
    "items_reviewed": 0,
    "duplicate_items": 0,
    "experiments_started": 0,
    "experiments_completed": 0,
    "tools_adopted": 0,
    "tools_rejected": 0,
    "common_topics": ["List of 2-3 most frequent topics"],
    "unfinished_actions": ["1-2 actions currently left open"],
    "skills_developed": ["1-2 soft or hard skills developed by experimenting"],
    "knowledge_gaps": ["1-2 things they might want to learn or investigate next"]
  },
  "recommended_focus": "Supportive learning advice and concrete focus action for next week"
}`;

  const userPrompt = `Generate a weekly report based on these stats:
Weekly activity:
- Items saved: ${stats.items_added || 0}
- Items reviewed: ${stats.items_reviewed || 0}
- Duplicates caught: ${stats.duplicate_items || 0}
- Experiments started: ${stats.experiments_started || 0}
- Experiments completed: ${stats.experiments_completed || 0}
- Tools adopted: ${stats.tools_adopted || 0}
- Tools rejected: ${stats.tools_rejected || 0}
- Common topics: ${JSON.stringify(stats.common_topics || [])}

User's onboarding profile:
- Experience level: ${onboarding.experience_level || 'Beginner'}
- What they are learning: ${onboarding.learning_goals || 'AI'}
- Interests: ${JSON.stringify(onboarding.interests || [])}`;

  try {
    const ai = getGeminiClient(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });
    const reviewData = parseAIJson(response.text || '');
    res.json(reviewData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate weekly review.' });
  }
});

// --- VITE MIDDLEWARE CONFIGURATION ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
