/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  Profile,
  KnowledgeItem,
  KnowledgeItemRelation,
  Experiment,
  Attachment,
  ContentDraft,
  ProductIdea,
  WeeklyReview
} from '../types';

// Storage keys
const KEYS = {
  CURRENT_USER: 'ailv_current_user',
  PROFILE: 'ailv_profile',
  KNOWLEDGE_ITEMS: 'ailv_knowledge_items',
  KNOWLEDGE_RELATIONS: 'ailv_knowledge_relations',
  EXPERIMENTS: 'ailv_experiments',
  ATTACHMENTS: 'ailv_attachments',
  CONTENT_DRAFTS: 'ailv_content_drafts',
  PRODUCT_IDEAS: 'ailv_product_ideas',
  WEEKLY_REVIEWS: 'ailv_weekly_reviews',
};

// Seed Data definition
const SEED_USER_ID = 'demo-user-id';

const SEED_PROFILE: Profile = {
  id: SEED_USER_ID,
  email: 'rohitsinghpanwar637@gmail.com',
  full_name: 'Demo Learner',
  learning_goals: 'Master AI automation and build simple productivity assistants without deep coding.',
  experience_level: 'Beginner',
  main_device: 'Phone',
  coding_knowledge: 'A little',
  interests: ['AI tools', 'AI agents', 'Automation', 'Productivity', 'Product building'],
  current_projects: 'A simple recruitment automated helper, personal notes organizer.',
  preferred_explanation_style: 'Explain like I am five',
  weekly_learning_time: 4,
  onboarding_completed: true,
  created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

const SEED_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'ki-1',
    user_id: SEED_USER_ID,
    original_link: 'https://www.instagram.com/p/C_agent_video',
    content_type: 'Instagram Reel',
    platform: 'Instagram',
    creator_name: 'AITrendsetter',
    transcript: 'In this video, I am going to show you how to build a fully working autonomous AI Agent in under 5 minutes using AgentCreator. It is completely free. Just log into their dashboard, give your agent a job description like "Screen recruitment candidates and suggest interview times", hook up your calendar, and boom! It runs in the background. It sends emails, matches qualifications, and books slots. You do not need any coding or complicated developer setup. It is 100% phone-friendly as well.',
    personal_notes: 'Highly relevant for my recruitment assistant project idea!',
    title: 'Autonomous Recruitment Assistant with AgentCreator',
    main_topic: 'AI Agents',
    category: 'AI agents',
    tool_name: 'AgentCreator',
    simple_summary: 'An easy way to build a virtual calendar and recruitment helper that runs autonomously in 5 minutes.',
    detailed_summary: 'This short tutorial demonstrates building a recruiting screener assistant via AgentCreator. The process is completely web-based, requires zero code, and can be completed entirely on a mobile phone. The agent filters candidates based on custom parameters and automatically coordinates calendar slots with top-matching profiles.',
    simple_explanation: {
      what_is_it: 'A virtual robot helper that filters work candidates and books interviews for you.',
      why_it_matters: 'It saves hours of boring calendar back-and-forth emails.',
      how_it_works: 'You write down the job rules in plain English, connect your calendar, and let it send emails for you.',
      where_to_use_it: 'In your hiring workflow or for booking customer appointments.',
      what_to_do_next: 'Set up a free test account on AgentCreator and try screening one resume.'
    },
    problem_solved: 'Repetitive resume screening and manual back-and-forth email calendar coordination.',
    main_claims: [
      'Build a fully working AI Agent in 5 minutes',
      'Requires zero coding knowledge',
      '100% phone-friendly workflow'
    ],
    important_concepts: ['Autonomous Agent', 'Integrations', 'Calendar Automation'],
    important_steps: [
      'Sign up on the AgentCreator dashboard',
      'Write down a simple job description for the agent',
      'Authorize calendar access',
      'Activate the agent'
    ],
    possible_use_cases: [
      'Screening initial job applications',
      'Booking tutoring sessions',
      'Automated patient appointment slots'
    ],
    target_user: 'Recruiters, HR managers, solopreneurs, and small business owners.',
    difficulty: 'Easy',
    estimated_time: '10 minutes',
    coding_required: 'No',
    phone_friendly: 'Yes',
    pricing_type: 'Free',
    required_tools: ['AgentCreator account', 'Google Calendar or Outlook account'],
    limitations: ['May misinterpret highly customized CV structures', 'Limited direct integrations in the free tier'],
    investigation_questions: ['Does it store candidate resume files securely?', 'How does it handle schedule conflicts?'],
    relevance_score: 95,
    relevance_reason: 'Matches your current project goal of building a simple recruitment automated helper perfectly.',
    recommended_decision: 'Test now',
    suggested_action: 'Build a 10-minute recruitment screening agent in AgentCreator to verify calendar sync.',
    status: 'Test now',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ki-2',
    user_id: SEED_USER_ID,
    original_link: 'https://tiktok.com/@aiexpert/video/7391983',
    content_type: 'Other',
    platform: 'TikTok',
    creator_name: 'NoCodeGuru',
    transcript: 'Create an automatic hiring agent in minutes. Go to AgentCreator, enter the prompt: Screen job profiles and sync schedules, connect your Gmail and calendar, and you are ready. There is no code, it is totally free, and you can manage the entire workspace straight from your smartphone.',
    personal_notes: 'Very similar to the AITrendsetter reel. Let\'s see if this is duplicate content.',
    title: 'TikTok Automated Hiring Agent with AgentCreator',
    main_topic: 'AI Agents',
    category: 'AI agents',
    tool_name: 'AgentCreator',
    simple_summary: 'Duplicate walkthrough of setting up a calendar scheduling recruiter agent on AgentCreator.',
    detailed_summary: 'A short mobile video describing identical steps for creating a scheduling recruiter agent using AgentCreator. No new techniques or tools are presented compared to prior knowledge items.',
    simple_explanation: {
      what_is_it: 'Another short video showing the exact same calendar scheduling agent.',
      why_it_matters: 'It proves many creators are sharing the exact same tool, confirming its current popularity.',
      how_it_works: 'Create account, link calendar, input plain-English prompts.',
      where_to_use_it: 'Hiring coordination.',
      what_to_do_next: 'No action needed on this duplicate; merge it with your primary item.'
    },
    problem_solved: 'Hiring scheduling coordination.',
    main_claims: ['Zero-code setup', 'Managed on a smartphone', '100% free account'],
    important_concepts: ['Hiring Agent', 'No-code API Integration'],
    important_steps: ['Log in to AgentCreator', 'Write agent prompt', 'Authorize calendar'],
    possible_use_cases: ['Hiring pipeline scheduling'],
    target_user: 'Solopreneurs, small business owners',
    difficulty: 'Easy',
    estimated_time: '5 minutes',
    coding_required: 'No',
    phone_friendly: 'Yes',
    pricing_type: 'Free',
    required_tools: ['AgentCreator'],
    limitations: ['Overlaps entirely with previous saves'],
    investigation_questions: ['Are there any alternative tools that offer superior scheduling control?'],
    relevance_score: 90,
    relevance_reason: 'Directly overlaps with your primary AgentCreator knowledge item.',
    recommended_decision: 'Compare',
    suggested_action: 'Merge this duplicate item into the main "Autonomous Recruitment Assistant" item.',
    status: 'Compare',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ki-3',
    user_id: SEED_USER_ID,
    original_link: 'https://youtube.com/shorts/nocode_chatbot_voice',
    content_type: 'YouTube Short',
    platform: 'YouTube',
    creator_name: 'BuildWithAI',
    transcript: 'Check this out. Today I am showing you how to build a voice-powered customer support chatbot in 10 minutes without code. We are using Vapi. It lets you configure highly responsive voice agents that sound extremely realistic. You just supply a prompt, select a voice provider like ElevenLabs, hook up a Twilio phone number, and you have an AI receptionist answering customer phone calls, writing down notes, and saving them to your Google Sheet.',
    personal_notes: 'Awesome receptionist tool! Might be useful for a local business client.',
    title: 'Voice-powered AI Receptionist with Vapi',
    main_topic: 'AI Tools',
    category: 'AI tools',
    tool_name: 'Vapi',
    simple_summary: 'Build an ultra-realistic voice AI receptionist that answers calls and takes notes.',
    detailed_summary: 'This tutorial details Vapi, a platform for creating low-latency voice agents. The author hooks up ElevenLabs for voice synthesis and Twilio for phone connectivity, showing a complete call-and-record feedback loop that pushes notes to Google Sheets.',
    simple_explanation: {
      what_is_it: 'A virtual phone receptionist that answers calls and speaks like a real human.',
      why_it_matters: 'You can have a 24/7 receptionist answering business calls without hiring full-time staff.',
      how_it_works: 'When someone calls, Vapi listens, converts speech to text, gets an AI response, and speaks it back in milliseconds.',
      where_to_use_it: 'Local restaurants, dentists, or support desks.',
      what_to_do_next: 'Create a free sandbox account on Vapi and do a browser-based test call.'
    },
    problem_solved: 'Missing customer phone calls during busy hours or off-duty periods.',
    main_claims: [
      'Ultra-realistic voice synthesis',
      'Low-latency responsive voice agents',
      'No coding required to configure'
    ],
    important_concepts: ['Voice AI', 'Latency Optimization', 'AI Receptionist'],
    important_steps: [
      'Sign up on Vapi platform',
      'Write the agent prompt detailing its receptionist persona',
      'Select a realistic voice',
      'Execute a test call directly from the web browser dashboard'
    ],
    possible_use_cases: [
      'Restaurant table reservation bookings',
      'After-hours customer service support line',
      'Incoming lead qualification screener'
    ],
    target_user: 'Small businesses, service companies, agency builders.',
    difficulty: 'Medium',
    estimated_time: '15 minutes',
    coding_required: 'No',
    phone_friendly: 'No',
    pricing_type: 'Freemium',
    required_tools: ['Vapi account', 'Twilio number (optional)', 'Google Sheets account'],
    limitations: ['Requires Twilio setup for actual phone line configuration', 'Voice synthesis costs can scale with call volume'],
    investigation_questions: ['What is the cost per minute of active voice chat?', 'How does it handle accents or speech impediments?'],
    relevance_score: 75,
    relevance_reason: 'Useful for building client projects or a high-end service agency business.',
    recommended_decision: 'Save as reference',
    suggested_action: 'Try Vapi browser sandbox and check voice latency quality.',
    status: 'Save as reference',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ki-4',
    user_id: SEED_USER_ID,
    original_link: 'https://twitter.com/prompt_expert/status/1234567',
    content_type: 'X post',
    platform: 'X',
    creator_name: 'PromptGod',
    transcript: 'Stop writing simple prompts. Use this secret structure for outstanding Gemini results: 1. Persona (You are an expert recruiter) 2. Context (Hiring a backend developer) 3. Task (Write 3 screening questions) 4. Constraints (Max 150 words, friendly tone, no jargon). This structure forces the AI to output exactly what you need without useless fluff.',
    personal_notes: 'Simple prompting framework to improve AI responses in my apps.',
    title: 'Secret 4-Step Prompt Structure for Gemini',
    main_topic: 'Prompt Engineering',
    category: 'Productivity',
    tool_name: 'Gemini Prompting',
    simple_summary: 'A structured 4-step framework (Persona, Context, Task, Constraints) to write highly accurate AI prompts.',
    detailed_summary: 'An educational post describing the PCT-C prompting methodology. By explicitly defining the persona, supplying background context, delineating the exact task, and setting concrete constraints, users can secure significantly better outputs from Gemini.',
    simple_explanation: {
      what_is_it: 'A simple recipe card for writing better instructions to any AI.',
      why_it_matters: 'If you give the AI sloppy instructions, it gives you sloppy answers. This recipe guarantees neat replies.',
      how_it_works: 'Instead of saying "write questions", you explain WHO the AI is, WHAT the situation is, EXACTLY what you need, and the RULES it must obey.',
      where_to_use_it: 'Whenever you chat with Gemini, ChatGPT, or write prompt files.',
      what_to_do_next: 'Copy this 4-step structure and try using it during your next AI chat session.'
    },
    problem_solved: 'Sloppy, generic, or overly verbose AI chatbot responses.',
    main_claims: [
      'Drastically increases output quality',
      'Prevents AI from adding unnecessary fluff',
      'Works across all major language models'
    ],
    important_concepts: ['Prompt Engineering', 'Role-Play Persona', 'Constraint Mapping'],
    important_steps: [
      'State the Persona ("You are...")',
      'Explain the Context ("We are doing...")',
      'Define the Task ("Create a...")',
      'Impose Constraints ("Limit to...")'
    ],
    possible_use_cases: [
      'Refining resume-screening prompts',
      'Drafting marketing social media copy',
      'Formatting automated spreadsheet text'
    ],
    target_user: 'AI beginners, content creators, business owners.',
    difficulty: 'Easy',
    estimated_time: '2 minutes',
    coding_required: 'No',
    phone_friendly: 'Yes',
    pricing_type: 'Free',
    required_tools: ['Any AI chat application (e.g., Gemini)'],
    limitations: ['Relies entirely on manual prompt construction'],
    investigation_questions: ['Can this structure be automated inside server-side code templates?'],
    relevance_score: 85,
    relevance_reason: 'Directly helps you write better instructions for your recruitment assistant prompts.',
    recommended_decision: 'Learn later',
    suggested_action: 'Test this PCT-C structure inside your AI Settings or test prompt workspace.',
    status: 'Learn later',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ki-5',
    user_id: SEED_USER_ID,
    original_link: 'https://medium.com/ai/getting-started-gemini-3-5',
    content_type: 'Article',
    platform: 'Medium',
    creator_name: 'CodeCraft',
    transcript: 'Today we explore the new Google @google/genai TypeScript SDK. To start, install npm install @google/genai. Initialize the client securely using GoogleGenAI({ apiKey }). Call generative content via ai.models.generateContent({ model: "gemini-3.5-flash", contents: "Prompt" }). Never expose this key in front-end client-side code; it must be run server-side in Node or Express.',
    personal_notes: 'Technical guide on integrating Gemini. Let\'s use this as reference for our API route backend!',
    title: 'Integrating Gemini 3.5 using @google/genai SDK',
    main_topic: 'AI Integration',
    category: 'Coding',
    tool_name: '@google/genai SDK',
    simple_summary: 'A developer guide on installing and utilizing the modern Google GenAI library securely on a server.',
    detailed_summary: 'An article explaining standard implementation of the newly updated Google GenAI SDK. It highlights the mandatory server-side setup, instantiation parameters, and calling methods to fetch flash model outputs securely.',
    simple_explanation: {
      what_is_it: 'A manual explaining how software programs connect to the Gemini AI brain.',
      why_it_matters: 'It teaches you how to let your website or app think, write, and understand things automatically.',
      how_it_works: 'You install a connector package, give it a secret password, and write a small server route to send prompts to Gemini.',
      where_to_use_it: 'Building custom software that uses AI capabilities.',
      what_to_do_next: 'Read this as reference when setting up your own backend server.'
    },
    problem_solved: 'Insecure exposure of secret API passwords on frontend browsers.',
    main_claims: [
      'Modern SDK is faster and more reliable',
      'Provides standard TypeScript type safety',
      'Enables advanced features like structured JSON responses'
    ],
    important_concepts: ['Server-Side Security', 'SDK Initialization', 'Node Environment Configuration'],
    important_steps: [
      'Run npm install @google/genai',
      'Load process.env.GEMINI_API_KEY securely on your server',
      'Instantiate GoogleGenAI',
      'Send prompts using ai.models.generateContent'
    ],
    possible_use_cases: [
      'Building a secure transcript summarizing website',
      'Automating email draft replies via server cron jobs',
      'Running background data analysis code'
    ],
    target_user: 'Software developers, tech-savvy creators.',
    difficulty: 'Hard',
    estimated_time: '30 minutes',
    coding_required: 'Yes',
    phone_friendly: 'No',
    pricing_type: 'Free',
    required_tools: ['Node.js runtime', 'Gemini API key', 'TypeScript compiler'],
    limitations: ['Requires programming skills and server hosting knowledge'],
    investigation_questions: ['Can we host this server easily on free Cloud container systems?'],
    relevance_score: 80,
    relevance_reason: 'Directly aligns with the core backend architecture of your AI Learning Vault.',
    recommended_decision: 'Turn into content',
    suggested_action: 'Draft an article explaining how we built this vault using the secure server-side SDK.',
    status: 'Turn into content',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const SEED_RELATIONS: KnowledgeItemRelation[] = [
  {
    id: 'rel-1',
    user_id: SEED_USER_ID,
    source_item_id: 'ki-1',
    related_item_id: 'ki-2',
    relation_type: 'duplicate',
    similarity_score: 92,
    explanation: 'Both items focus on constructing recruitment schedule agents on AgentCreator with identical steps and claims.',
    created_at: new Date().toISOString()
  }
];

const SEED_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-1',
    user_id: SEED_USER_ID,
    knowledge_item_id: 'ki-1',
    title: 'Hiring Screener Agent Test',
    test_question: 'Can AgentCreator screen 3 test resumes accurately and connect with my Google Calendar without code errors?',
    objective: 'Create a temporary scheduler assistant in AgentCreator, upload three draft resumes, and test the calendar booking feedback loop.',
    why_it_matters: 'Validates if the core technology actually works as claimed before committing real candidates to it.',
    steps: [
      'Log into AgentCreator and write candidate parameters: Backend Developer requirements.',
      'Authorize candidate calendar connection using a spare test Google account.',
      'Upload three mock candidate PDFs: one highly qualified, one mismatched, one borderline.',
      'Send test mail simulating candidate screening response and verify calendar invite creation.'
    ],
    estimated_time: '15 minutes',
    tools_required: ['AgentCreator Sandbox', 'Spare Google Calendar', 'Three mock CV draft files'],
    prompt_used: 'Screen candidates based on backend experience (>3 yrs Node.js). If they qualify, invite them to calendar. If not, draft a polite refusal mail.',
    expected_result: 'The qualified resume receives an invite link, the borderline one is flagged for review, and the mismatched resume receives a polite refusal.',
    success_criteria: 'Calendar bookings match candidate qualifications perfectly with zero misclassifications.',
    evidence_required: 'Screenshots of calendar invites and candidate qualification classifications.',
    possible_problems: ['Calendar API sync errors', 'Parsing error with standard PDF columns'],
    status: 'Planned',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    user_id: SEED_USER_ID,
    knowledge_item_id: 'ki-4',
    title: 'PCT-C Framework Validation',
    test_question: 'Does the Persona-Context-Task-Constraint structure reduce Gemini response fluff by more than 50%?',
    objective: 'Compare output word counts and direct usefulness scores of a generic prompt vs a structured PCT-C prompt for identical tasks.',
    why_it_matters: 'Proves if prompt engineering actually improves speed and value of AI responses in daily use.',
    steps: [
      'Write a simple prompt: "Write recruiter screening questions for a backend developer role."',
      'Send it to Gemini and note word count and relevance.',
      'Write a structured PCT-C prompt following prompt expert structure.',
      'Send it to Gemini, note word count, check if it contains fluff and rate its usefulness.'
    ],
    estimated_time: '5 minutes',
    tools_required: ['Gemini Chat interface'],
    prompt_used: 'Persona: Expert recruiter. Context: Backend Node developer role. Task: Write 3 screening questions. Constraints: Max 150 words, friendly tone, no jargon.',
    expected_result: 'The PCT-C prompt returns clean, directly applicable questions with no generic introductions or concluding chat fluff.',
    success_criteria: 'Structured prompt word count is at least 40% shorter while usefulness remains superior.',
    evidence_required: 'Side-by-side prompt output comparisons.',
    possible_problems: ['Varying model temperatures on separate chats'],
    status: 'Planned',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    user_id: SEED_USER_ID,
    knowledge_item_id: 'ki-3',
    title: 'Voice AI receptionist latency check',
    test_question: 'Is Vapi voice response fast enough (<800ms) to feel natural during an active phone call?',
    objective: 'Build a sandbox receptionist on Vapi, make a live web test call, and assess the conversational rhythm.',
    why_it_matters: 'An AI phone agent is useless if clients hang up due to uncomfortable silences.',
    steps: [
      'Open Vapi and configure default agent persona: "Friendly local pizzeria receptionist".',
      'Select a prebuilt ElevenLabs high-speed voice.',
      'Click "Test Call" in browser and ask: "Is your pizza gluten free?" and "What time do you close?"',
      'Record latency and conversational awkwardness.'
    ],
    estimated_time: '10 minutes',
    tools_required: ['Vapi free account', 'Microphone and speakers'],
    prompt_used: 'You are an AI receptionist for a pizza restaurant. Answer simple customer queries concisely.',
    expected_result: 'AI response latency is acceptable, answering restaurant hours immediately.',
    success_criteria: 'Conversational response latency feels natural and averages below 1 second.',
    evidence_required: 'Recording or latency logs in Vapi debugger.',
    possible_problems: ['Network lag on client microphone', 'Speech synthesis speech-slurs'],
    status: 'Planned',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-4',
    user_id: SEED_USER_ID,
    knowledge_item_id: 'ki-1',
    title: 'AgentCreator Quick Screening Test',
    test_question: 'Does AgentCreator accurately parse candidate resumes for specific skills?',
    objective: 'Test skills extraction on candidate resume files.',
    why_it_matters: 'Confirms resume reading accuracy of the tool.',
    steps: [
      'Create standard recruiter agent.',
      'Load sample resume files with diverse formatting.',
      'Verify if it correctly flags required tools.'
    ],
    estimated_time: '15 minutes',
    tools_required: ['AgentCreator Dashboard'],
    prompt_used: 'Extract all software developer skills from this CV.',
    expected_result: 'Accurate skill mapping.',
    success_criteria: '100% correct skills extraction.',
    evidence_required: 'Parsed profiles logs.',
    possible_problems: ['Table reading issues'],
    status: 'Completed',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completion_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    time_spent: 12,
    money_spent: 0,
    what_worked: 'Extremely easy resume reading. Gmail integration worked within 2 minutes of setup.',
    what_failed: 'Struggled slightly when text was embedded inside complex image headers on a Canva resume layout.',
    confusing_parts: 'The candidate matching weighting settings were a bit hidden under advanced tabs.',
    claim_accuracy: 'Accurate',
    use_again: 'Yes',
    final_rating: 5,
    final_decision: 'Adopted',
    learning_summary: {
      what_i_learned: 'AgentCreator is powerful for standard PDF resumes. However, resumes built with heavy designer layouts (like multi-column Canva layouts) might have text parsed out of order, which is a key limitation.',
      what_worked: 'Calendar synchronization and automated candidate mail drafts worked perfectly.',
      what_did_not_work: 'Scanning design-heavy Canva resume graphics directly.',
      when_to_use: 'When screening standard PDF or Word document resume uploads.',
      when_to_avoid: 'When resumes are submitted as raw photo attachments or heavy background templates.',
      creator_claim_accurate: 'Yes, the 5-minute setup claim is highly accurate for basic workflows.',
      what_to_test_next: 'How it handles automated candidate reminder notifications.'
    },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'exp-5',
    user_id: SEED_USER_ID,
    knowledge_item_id: 'ki-3',
    title: 'Pizzeria Recep Test with Vapi',
    test_question: 'Does the voice assistant handle interrupting customers gracefully?',
    objective: 'Assess interruption handling on Vapi phone lines.',
    why_it_matters: 'Users will talk over the AI assistant during phone calls.',
    steps: [
      'Trigger web sandbox call.',
      'Deliberately interrupt during an active response and observe agent behavior.'
    ],
    estimated_time: '10 minutes',
    tools_required: ['Vapi Voice console'],
    prompt_used: 'Default restaurant receptionist persona prompt.',
    expected_result: 'Vapi immediately stops speaking when user speaks.',
    success_criteria: 'Stops speaking within 300ms of user interruption.',
    evidence_required: 'Call audio recording log.',
    possible_problems: ['Acoustic echo cancelation failures'],
    status: 'Completed',
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completion_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    time_spent: 20,
    money_spent: 5,
    what_worked: 'Voice synthesized beautifully. Latency was very low.',
    what_failed: 'Interruption was slow. It took around 1.5 seconds for the agent to realize I was speaking and stop.',
    confusing_parts: 'Tuning the ambient noise threshold settings in the control panel was extremely confusing.',
    claim_accuracy: 'Exaggerated',
    use_again: 'Maybe',
    final_rating: 2,
    final_decision: 'Rejected',
    learning_summary: {
      what_i_learned: 'While the voice sounds highly realistic, the latency and interruption delay makes it frustrating for active, fast-paced customer calls.',
      what_worked: 'Realistic vocal inflection and integration with Twilio.',
      what_did_not_work: 'Instant interruption cut-off. Customers got annoyed as the bot continued speaking over them.',
      when_to_use: 'Simple informational answering machine scenarios where back-and-forth chat is minimal.',
      when_to_avoid: 'Busy customer lines requiring immediate responsive interrupting coordination.',
      creator_claim_accurate: 'No, the "ultra-responsive natural chat" claim is exaggerated for complex client conversations.',
      what_to_test_next: 'Alternative low-latency voice wrappers like Retell.'
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const SEED_DRAFTS: ContentDraft[] = [
  {
    id: 'drf-1',
    user_id: SEED_USER_ID,
    knowledge_item_id: 'ki-3',
    experiment_id: 'exp-5',
    content_type: 'LinkedIn post',
    title: 'The Reality of Voice AI Assistants: What Creators Don\'t Tell You',
    body: `Are Voice AI receptionists ready for prime time? 📞

I saw a viral video claiming you can build an "ultra-realistic, zero-code AI phone receptionist in under 10 minutes" that solves all your support needs. 

It sounded perfect, so I actually built and tested it! Here is what happened:

🔴 The Original Claim:
- Build in 10 minutes without code.
- Fully natural voice synthesis that can talk to any customer.
- Saves thousands on receptionist hiring costs.

🟢 What I Actually Did (The Experiment):
- Created a pizzeria virtual receptionist using Vapi & Twilio.
- Triggered sample sandbox calls and deliberately tried to interrupt, mumble, and ask complicated menu questions.
- Time spent: 20 minutes | Cost spent: $5.

⚠️ What Actually Happened (The Reality):
- Yes, the voice synthesis was incredibly lifelike.
- However, the "natural back-and-forth" failed during interruptions. It took 1.5+ seconds of me talking before the bot stopped speaking, leading to awkward overlaps.
- Configuring the background noise threshold required highly complex settings, far from "zero code".

💡 My Final Verdict:
The tech is amazing for simple, one-way answering machines (e.g., announcing shop hours). But for rapid, natural booking, your clients will get frustrated. Don't believe everything in viral reels — always test it in a small sandbox first!

#AI #VoiceAI #NoCode #TechReview #AIExperiment`,
    status: 'Draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const SEED_PRODUCT_IDEAS: ProductIdea[] = [
  {
    id: 'prd-1',
    user_id: SEED_USER_ID,
    source_knowledge_item_ids: ['ki-1'],
    problem: 'Small local agencies spend hours reviewing resumes and manually sending scheduling emails for initial candidate screenings.',
    evidence: 'Saved content tutorial on AgentCreator candidate coordination, combined with direct feedback from local recruiters complaining about calendar alignment friction.',
    target_user: 'Boutique local staffing agencies and small recruiting teams.',
    existing_solutions: 'Calendly (manual), greenhouse (expensive enterprise ATS).',
    market_gap: 'A budget-friendly screener that combines lightweight skills extraction with automated, proactive booking in one simple, self-managed agent interface.',
    proposed_solution: 'A specialized template package on AgentCreator specifically optimized to screen resume attachments, grade against key developer criteria, and automatically email selected profiles with direct booking links.',
    why_now: 'No-code agents are now robust enough to handle calendar APIs and document readers without custom coding servers.',
    core_features: [
      'Candidate resume drag-drop inbox',
      'Simple skill-scoring weighting panel',
      'Proactive calendar sync slots booking email',
      'Unified HR status dashboard'
    ],
    mvp_scope: 'A localized workflow built on AgentCreator running on a private calendar, tested with 20 real resume submissions.',
    validation_test: 'Acquire 3 local recruitment agency trials. If they successfully run 15 candidates through the scheduler and rate it >4 stars, demand is validated.',
    difficulty: 'Medium',
    estimated_cost: 'Low',
    monetization: ['Setup service retainer ($200)', 'Monthly agent maintenance fee ($30/mo)'],
    risks: ['Parsing accuracy of weird PDF columns', 'Candidate privacy rules (GDPR)'],
    next_action: 'Pitch the booking agent solution to 3 local hiring contacts to secure free sandbox test agreements.',
    status: 'Exploring',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const SEED_WEEKLY_REVIEW: WeeklyReview = {
  id: 'rev-1',
  user_id: SEED_USER_ID,
  week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  week_end: new Date().toISOString(),
  report_data: {
    items_added: 5,
    items_reviewed: 4,
    duplicate_items: 1,
    experiments_started: 3,
    experiments_completed: 2,
    tools_adopted: 1,
    tools_rejected: 1,
    common_topics: ['AI Agents', 'Voice Synthesis', 'Prompting Frameworks'],
    unfinished_actions: ['Hiring Screener Agent Test', 'PCT-C Framework Validation'],
    skills_developed: ['No-code Agent configuration', 'Voice AI latency assessment'],
    knowledge_gaps: ['Understanding server-side secure API proxy structures', 'Twilio phone numbers configuration costing']
  },
  recommended_focus: 'You saved several items and experiments about autonomous agents this week, and successfully adopted AgentCreator. Try starting the planned "Hiring Screener Agent Test" to take action on your core recruitment project idea!',
  created_at: new Date().toISOString()
};

// Database Service Class
class DatabaseService {
  private isLocal = true;

  constructor() {
    this.isLocal = !isSupabaseConfigured();
    if (this.isLocal) {
      console.log('AI Learning Vault running in Offline Local Mode (localStorage)');
      this.initLocalDB();
    } else {
      console.log('AI Learning Vault running in connected Supabase Mode');
    }
  }

  private initLocalDB() {
    // Current user
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({ id: SEED_USER_ID, email: SEED_PROFILE.email }));
    }
    // Profile
    if (!localStorage.getItem(KEYS.PROFILE)) {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(SEED_PROFILE));
    }
    // Knowledge items
    if (!localStorage.getItem(KEYS.KNOWLEDGE_ITEMS)) {
      localStorage.setItem(KEYS.KNOWLEDGE_ITEMS, JSON.stringify(SEED_KNOWLEDGE_ITEMS));
    }
    // Relations
    if (!localStorage.getItem(KEYS.KNOWLEDGE_RELATIONS)) {
      localStorage.setItem(KEYS.KNOWLEDGE_RELATIONS, JSON.stringify(SEED_RELATIONS));
    }
    // Experiments
    if (!localStorage.getItem(KEYS.EXPERIMENTS)) {
      localStorage.setItem(KEYS.EXPERIMENTS, JSON.stringify(SEED_EXPERIMENTS));
    }
    // Attachments
    if (!localStorage.getItem(KEYS.ATTACHMENTS)) {
      localStorage.setItem(KEYS.ATTACHMENTS, JSON.stringify([]));
    }
    // Content drafts
    if (!localStorage.getItem(KEYS.CONTENT_DRAFTS)) {
      localStorage.setItem(KEYS.CONTENT_DRAFTS, JSON.stringify(SEED_DRAFTS));
    }
    // Product ideas
    if (!localStorage.getItem(KEYS.PRODUCT_IDEAS)) {
      localStorage.setItem(KEYS.PRODUCT_IDEAS, JSON.stringify(SEED_PRODUCT_IDEAS));
    }
    // Weekly reviews
    if (!localStorage.getItem(KEYS.WEEKLY_REVIEWS)) {
      localStorage.setItem(KEYS.WEEKLY_REVIEWS, JSON.stringify([SEED_WEEKLY_REVIEW]));
    }
  }

  isOfflineMode(): boolean {
    return this.isLocal;
  }

  // --- Auth Simulation / Helpers ---
  async getCurrentUser() {
    if (this.isLocal) {
      const u = localStorage.getItem(KEYS.CURRENT_USER);
      return u ? JSON.parse(u) : null;
    }
    const { data: { user } } = await supabase!.auth.getUser();
    return user;
  }

  async login(email: string) {
    if (this.isLocal) {
      const u = { id: SEED_USER_ID, email };
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(u));
      return { data: { user: u }, error: null };
    }
    // Real Supabase would handle auth, but since user can enter anything in preview,
    // we provide a clean mockup flow if real supabase auth isn't actually provisioned yet.
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({ email, password: 'password123' });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async logout() {
    if (this.isLocal) {
      localStorage.removeItem(KEYS.CURRENT_USER);
      return { error: null };
    }
    const { error } = await supabase!.auth.signOut();
    return { error };
  }

  // --- Profiles ---
  async getProfile(userId: string): Promise<Profile | null> {
    if (this.isLocal) {
      const p = localStorage.getItem(KEYS.PROFILE);
      return p ? JSON.parse(p) : null;
    }
    const { data, error } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }

  async updateProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
    if (this.isLocal) {
      const current = await this.getProfile(profile.id);
      const updated = { ...current, ...profile, updated_at: new Date().toISOString() } as Profile;
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
      return updated;
    }
    const { data, error } = await supabase!
      .from('profiles')
      .upsert({ ...profile, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Knowledge Items ---
  async getKnowledgeItems(userId: string): Promise<KnowledgeItem[]> {
    if (this.isLocal) {
      const data = localStorage.getItem(KEYS.KNOWLEDGE_ITEMS);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase!
      .from('knowledge_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching knowledge items:', error);
      return [];
    }
    return data || [];
  }

  async saveKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<KnowledgeItem> {
    if (this.isLocal) {
      const list = await this.getKnowledgeItems(item.user_id);
      let savedItem: KnowledgeItem;

      if (item.id) {
        const idx = list.findIndex(x => x.id === item.id);
        list[idx] = {
          ...list[idx],
          ...item,
          updated_at: new Date().toISOString()
        } as KnowledgeItem;
        savedItem = list[idx];
      } else {
        savedItem = {
          ...item,
          id: 'ki-' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as KnowledgeItem;
        list.unshift(savedItem);
      }

      localStorage.setItem(KEYS.KNOWLEDGE_ITEMS, JSON.stringify(list));
      return savedItem;
    }

    const { data, error } = await supabase!
      .from('knowledge_items')
      .upsert({
        ...item,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteKnowledgeItem(id: string, userId: string): Promise<void> {
    if (this.isLocal) {
      const list = await this.getKnowledgeItems(userId);
      const filtered = list.filter(x => x.id !== id);
      localStorage.setItem(KEYS.KNOWLEDGE_ITEMS, JSON.stringify(filtered));

      // Also delete related relations and experiments
      const rels = await this.getRelations(userId);
      const filteredRels = rels.filter(x => x.source_item_id !== id && x.related_item_id !== id);
      localStorage.setItem(KEYS.KNOWLEDGE_RELATIONS, JSON.stringify(filteredRels));

      const exps = await this.getExperiments(userId);
      const filteredExps = exps.filter(x => x.knowledge_item_id !== id);
      localStorage.setItem(KEYS.EXPERIMENTS, JSON.stringify(filteredExps));
      return;
    }

    // Cascade should be handled by Postgres constraints, but we can call standard API delete
    const { error } = await supabase!
      .from('knowledge_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // --- Relations ---
  async getRelations(userId: string): Promise<KnowledgeItemRelation[]> {
    if (this.isLocal) {
      const data = localStorage.getItem(KEYS.KNOWLEDGE_RELATIONS);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase!
      .from('knowledge_item_relations')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching relations:', error);
      return [];
    }
    return data || [];
  }

  async saveRelation(relation: Omit<KnowledgeItemRelation, 'id' | 'created_at'>): Promise<KnowledgeItemRelation> {
    if (this.isLocal) {
      const list = await this.getRelations(relation.user_id);
      const newRel = {
        ...relation,
        id: 'rel-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      } as KnowledgeItemRelation;
      list.push(newRel);
      localStorage.setItem(KEYS.KNOWLEDGE_RELATIONS, JSON.stringify(list));
      return newRel;
    }
    const { data, error } = await supabase!
      .from('knowledge_item_relations')
      .insert(relation)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteRelation(id: string, userId: string): Promise<void> {
    if (this.isLocal) {
      const list = await this.getRelations(userId);
      const filtered = list.filter(x => x.id !== id);
      localStorage.setItem(KEYS.KNOWLEDGE_RELATIONS, JSON.stringify(filtered));
      return;
    }
    const { error } = await supabase!
      .from('knowledge_item_relations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // --- Experiments ---
  async getExperiments(userId: string): Promise<Experiment[]> {
    if (this.isLocal) {
      const data = localStorage.getItem(KEYS.EXPERIMENTS);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase!
      .from('experiments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching experiments:', error);
      return [];
    }
    return data || [];
  }

  async saveExperiment(experiment: Omit<Experiment, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Experiment> {
    if (this.isLocal) {
      const list = await this.getExperiments(experiment.user_id);
      let savedExp: Experiment;

      if (experiment.id) {
        const idx = list.findIndex(x => x.id === experiment.id);
        list[idx] = {
          ...list[idx],
          ...experiment,
          updated_at: new Date().toISOString()
        } as Experiment;
        savedExp = list[idx];
      } else {
        savedExp = {
          ...experiment,
          id: 'exp-' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Experiment;
        list.unshift(savedExp);
      }

      localStorage.setItem(KEYS.EXPERIMENTS, JSON.stringify(list));
      return savedExp;
    }

    const { data, error } = await supabase!
      .from('experiments')
      .upsert({
        ...experiment,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Attachments ---
  async getAttachments(userId: string): Promise<Attachment[]> {
    if (this.isLocal) {
      const data = localStorage.getItem(KEYS.ATTACHMENTS);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase!
      .from('attachments')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
    return data || [];
  }

  async saveAttachment(attachment: Omit<Attachment, 'id' | 'created_at'>): Promise<Attachment> {
    if (this.isLocal) {
      const list = await this.getAttachments(attachment.user_id);
      const newAtt = {
        ...attachment,
        id: 'att-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      } as Attachment;
      list.push(newAtt);
      localStorage.setItem(KEYS.ATTACHMENTS, JSON.stringify(list));
      return newAtt;
    }
    const { data, error } = await supabase!
      .from('attachments')
      .insert(attachment)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteAttachment(id: string, userId: string): Promise<void> {
    if (this.isLocal) {
      const list = await this.getAttachments(userId);
      const filtered = list.filter(x => x.id !== id);
      localStorage.setItem(KEYS.ATTACHMENTS, JSON.stringify(filtered));
      return;
    }
    const { error } = await supabase!
      .from('attachments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // --- Content Drafts ---
  async getContentDrafts(userId: string): Promise<ContentDraft[]> {
    if (this.isLocal) {
      const data = localStorage.getItem(KEYS.CONTENT_DRAFTS);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase!
      .from('content_drafts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching content drafts:', error);
      return [];
    }
    return data || [];
  }

  async saveContentDraft(draft: Omit<ContentDraft, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<ContentDraft> {
    if (this.isLocal) {
      const list = await this.getContentDrafts(draft.user_id);
      let savedDraft: ContentDraft;

      if (draft.id) {
        const idx = list.findIndex(x => x.id === draft.id);
        list[idx] = {
          ...list[idx],
          ...draft,
          updated_at: new Date().toISOString()
        } as ContentDraft;
        savedDraft = list[idx];
      } else {
        savedDraft = {
          ...draft,
          id: 'drf-' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as ContentDraft;
        list.unshift(savedDraft);
      }

      localStorage.setItem(KEYS.CONTENT_DRAFTS, JSON.stringify(list));
      return savedDraft;
    }

    const { data, error } = await supabase!
      .from('content_drafts')
      .upsert({
        ...draft,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Product Ideas ---
  async getProductIdeas(userId: string): Promise<ProductIdea[]> {
    if (this.isLocal) {
      const data = localStorage.getItem(KEYS.PRODUCT_IDEAS);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase!
      .from('product_ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching product ideas:', error);
      return [];
    }
    return data || [];
  }

  async saveProductIdea(idea: Omit<ProductIdea, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<ProductIdea> {
    if (this.isLocal) {
      const list = await this.getProductIdeas(idea.user_id);
      let savedIdea: ProductIdea;

      if (idea.id) {
        const idx = list.findIndex(x => x.id === idea.id);
        list[idx] = {
          ...list[idx],
          ...idea,
          updated_at: new Date().toISOString()
        } as ProductIdea;
        savedIdea = list[idx];
      } else {
        savedIdea = {
          ...idea,
          id: 'prd-' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as ProductIdea;
        list.unshift(savedIdea);
      }

      localStorage.setItem(KEYS.PRODUCT_IDEAS, JSON.stringify(list));
      return savedIdea;
    }

    const { data, error } = await supabase!
      .from('product_ideas')
      .upsert({
        ...idea,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Weekly Reviews ---
  async getWeeklyReviews(userId: string): Promise<WeeklyReview[]> {
    if (this.isLocal) {
      const data = localStorage.getItem(KEYS.WEEKLY_REVIEWS);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase!
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching weekly reviews:', error);
      return [];
    }
    return data || [];
  }

  async saveWeeklyReview(review: Omit<WeeklyReview, 'id' | 'created_at'>): Promise<WeeklyReview> {
    if (this.isLocal) {
      const list = await this.getWeeklyReviews(review.user_id);
      const newRev = {
        ...review,
        id: 'rev-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      } as WeeklyReview;
      list.unshift(newRev);
      localStorage.setItem(KEYS.WEEKLY_REVIEWS, JSON.stringify(list));
      return newRev;
    }
    const { data, error } = await supabase!
      .from('weekly_reviews')
      .insert(review)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export const dbService = new DatabaseService();
export default dbService;
