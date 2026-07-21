/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  learning_goals: string;
  experience_level: 'Complete beginner' | 'Beginner' | 'Intermediate' | 'Advanced';
  main_device: 'Phone' | 'Computer' | 'Both';
  coding_knowledge: 'Yes' | 'No' | 'A little';
  interests: string[]; // e.g. ["AI tools", "AI agents", "Automation"]
  current_projects: string;
  preferred_explanation_style: 'Explain like I am five' | 'Beginner' | 'Standard' | 'Detailed';
  weekly_learning_time: number; // in hours
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIProviderSetting {
  id: string;
  user_id: string;
  provider: 'Google Gemini' | 'Groq' | 'OpenRouter';
  encrypted_api_key: string; // Stored securely
  selected_model: string;
  is_default: boolean;
  connection_status: 'Working' | 'Failed' | 'Not Tested';
  created_at: string;
  updated_at: string;
}

export interface KnowledgeItem {
  id: string;
  user_id: string;
  original_link?: string;
  content_type: string; // Instagram Reel, YouTube video, YouTube Short, LinkedIn post, X post, Podcast, Article, Course lesson, Other
  platform?: string;
  creator_name?: string;
  transcript: string;
  personal_notes?: string;
  
  // AI Generated fields
  title: string;
  main_topic: string;
  category: string;
  tool_name: string;
  simple_summary: string;
  detailed_summary: string;
  simple_explanation: {
    what_is_it: string;
    why_it_matters: string;
    how_it_works: string;
    where_to_use_it: string;
    what_to_do_next: string;
  };
  problem_solved: string;
  main_claims: string[];
  important_concepts: string[];
  important_steps: string[];
  possible_use_cases: string[];
  target_user: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown';
  estimated_time: string; // e.g. "30 mins", "2 hours"
  coding_required: 'Yes' | 'No' | 'Unknown';
  phone_friendly: 'Yes' | 'No' | 'Unknown';
  pricing_type: 'Free' | 'Freemium' | 'Paid' | 'Unknown';
  required_tools: string[];
  limitations: string[];
  investigation_questions: string[];
  relevance_score: number; // 0 to 100
  relevance_reason: string;
  recommended_decision: 'Test now' | 'Learn later' | 'Save as reference' | 'Compare' | 'Turn into content' | 'Turn into a product idea' | 'Archive' | 'Delete';
  suggested_action: string;
  
  status: 'Waiting for review' | 'Test now' | 'Learn later' | 'Save as reference' | 'Compare' | 'Turn into content' | 'Turn into a product idea' | 'Archived';
  created_at: string;
  updated_at: string;
}

export interface KnowledgeItemRelation {
  id: string;
  user_id: string;
  source_item_id: string;
  related_item_id: string;
  relation_type: 'duplicate' | 'similar' | 'alternative' | 'comparison' | 'prerequisite' | 'follow-up';
  similarity_score: number; // e.g. 0 to 100
  explanation: string;
  created_at: string;
}

export interface Experiment {
  id: string;
  user_id: string;
  knowledge_item_id: string;
  title: string;
  test_question: string;
  objective: string;
  why_it_matters: string;
  steps: string[];
  estimated_time: string;
  tools_required: string[];
  prompt_used: string;
  expected_result: string;
  success_criteria: string;
  evidence_required: string;
  possible_problems: string[];
  status: 'Planned' | 'Active' | 'Completed' | 'Adopted' | 'Rejected';
  start_date?: string;
  completion_date?: string;
  
  // User Logged results
  time_spent?: number; // minutes
  money_spent?: number; // USD
  what_worked?: string;
  what_failed?: string;
  confusing_parts?: string;
  claim_accuracy?: 'Accurate' | 'Exaggerated' | 'Inaccurate';
  use_again?: 'Yes' | 'No' | 'Maybe';
  final_rating?: number; // 1 to 5
  final_decision?: 'Adopted' | 'Useful sometimes' | 'Needs another test' | 'Rejected';
  
  // AI Post-Experiment Summary
  learning_summary?: {
    what_i_learned: string;
    what_worked: string;
    what_did_not_work: string;
    when_to_use: string;
    when_to_avoid: string;
    creator_claim_accurate: string;
    what_to_test_next: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  user_id: string;
  experiment_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface ContentDraft {
  id: string;
  user_id: string;
  knowledge_item_id: string;
  experiment_id?: string;
  content_type: 'LinkedIn post' | 'Short video script' | 'Carousel outline' | 'Tool review' | 'Tutorial' | 'Comparison post' | 'Newsletter note';
  title: string;
  body: string;
  status: 'Draft' | 'Published';
  created_at: string;
  updated_at: string;
}

export interface ProductIdea {
  id: string;
  user_id: string;
  source_knowledge_item_ids: string[];
  problem: string;
  evidence: string;
  target_user: string;
  existing_solutions: string;
  market_gap: string;
  proposed_solution: string;
  why_now: string;
  core_features: string[];
  mvp_scope: string;
  validation_test: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimated_cost: 'Free' | 'Low' | 'Medium' | 'High';
  monetization: string[];
  risks: string[];
  next_action: string;
  status: 'Exploring' | 'Validated' | 'Built' | 'Archived';
  created_at: string;
  updated_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  report_data: {
    items_added: number;
    items_reviewed: number;
    duplicate_items: number;
    experiments_started: number;
    experiments_completed: number;
    tools_adopted: number;
    tools_rejected: number;
    common_topics: string[];
    unfinished_actions: string[];
    skills_developed: string[];
    knowledge_gaps: string[];
  };
  recommended_focus: string;
  created_at: string;
}
