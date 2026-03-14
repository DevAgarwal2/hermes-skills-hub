export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string;
  version: string;
  author: string;
  category: SkillCategory;
  tags: string[];
  required_tools: string[];
  inputs: SkillIO[];
  outputs: SkillIO[];
  trust_score: number;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  completion_rate: number;
  retention_rate: number;
  composition_rate: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  install_count: number;
  created_at: string;
  updated_at: string;
  skill_content: string;
  compatible_with: string[];
}

export interface SkillIO {
  name: string;
  type: 'text' | 'json' | 'csv' | 'file' | 'url' | 'number' | 'boolean';
  description: string;
  required: boolean;
}

export type SkillCategory =
  | 'productivity'
  | 'development'
  | 'research'
  | 'data'
  | 'communication'
  | 'automation'
  | 'finance'
  | 'creative';

export interface ExecutionLog {
  id: string;
  skill_id: string;
  workflow_id?: string;
  status: 'success' | 'failure' | 'partial';
  started_at: string;
  completed_at: string;
  error_message?: string;
  duration_ms: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  skills: WorkflowStep[];
  created_at: string;
  created_by: string;
  total_runs: number;
  success_rate: number;
}

export interface WorkflowStep {
  order: number;
  skill_slug: string;
  skill_name: string;
  input_mapping: Record<string, string>;
}

export interface SearchParams {
  query?: string;
  category?: SkillCategory;
  tags?: string[];
  min_trust_score?: number;
  complexity?: string;
  required_tools?: string[];
  user_profile?: {
    tools_available?: string[];
    preferences?: string[];
  };
  limit?: number;
  offset?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  hint?: string;
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Skill submission types
export interface SkillSubmission {
  id: string;
  skill_name: string;
  skill_slug: string;
  description: string;
  long_description: string;
  category: SkillCategory;
  tags: string[];
  required_tools: string[];
  skill_content: string;
  submitted_by: string;
  submitted_by_type: 'human' | 'agent';
  status: 'pending' | 'approved' | 'rejected';
  ai_review_score?: number;
  ai_review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillReview {
  id: string;
  submission_id: string;
  review_score: number;
  review_notes: string;
  security_check: boolean;
  format_check: boolean;
  quality_check: boolean;
  reviewed_at: string;
}
