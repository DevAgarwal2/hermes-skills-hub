import { NextRequest, NextResponse } from 'next/server';
import { getSkillBySlug, skillsDatabase } from '@/lib/skills-data';
import { createWorkflow } from '@/lib/workflows-data';
import type { APIResponse, Workflow, WorkflowStep, Skill } from '@/lib/types';

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

interface SkillSummary {
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  inputs: string[];
  outputs: string[];
  trust_score: number;
}

/**
 * Build a concise summary of all available skills for the LLM
 * Adds enhanced descriptions for complex skills
 */
function buildSkillsCatalog(): SkillSummary[] {
  return skillsDatabase.map(skill => {
    let description = skill.description;
    
    // Enhance gogcli description to emphasize Google Sheets capability
    if (skill.slug === 'gogcli') {
      description = `${skill.description} KEY CAPABILITIES: Can read/write Google Sheets (service: 'sheets', action: 'append' or 'get'), manage Gmail, Calendar, Drive, Contacts, Docs, and Tasks. Use for cloud storage, data backup, and Google Workspace automation.`;
    }
    
    // Enhance nutrition-tracker description
    if (skill.slug === 'nutrition-tracker') {
      description = `${skill.description} KEY CAPABILITIES: Logs meals, tracks calories/protein/carbs/fat, provides daily stats and remaining targets, suggests meals, views history. Exports JSON data that can be saved to CSV or synced to cloud.`;
    }
    
    // Enhance csv-analyzer description
    if (skill.slug === 'csv-analyzer') {
      description = `${skill.description} KEY CAPABILITIES: Analyzes CSV files or inline CSV content, generates statistics, saves to local files. Use for local data storage and analysis.`;
    }
    
    // Enhance obsidian description
    if (skill.slug === 'obsidian') {
      description = `${skill.description} KEY CAPABILITIES: Creates, searches, and manages Markdown notes in Obsidian vaults. Use for local knowledge storage and documentation.`;
    }
    
    return {
      slug: skill.slug,
      name: skill.name,
      description,
      category: skill.category,
      tags: skill.tags,
      inputs: skill.inputs.map(i => i.name),
      outputs: skill.outputs.map(o => o.name),
      trust_score: skill.trust_score,
    };
  });
}

/**
 * Call OpenRouter API to get AI-powered skill selection
 */
async function selectSkillsWithAI(goal: string, skills: SkillSummary[]): Promise<string[]> {
  if (!OPENROUTER_API_KEY) {
    console.warn('OPENROUTER_API_KEY not set, falling back to keyword matching');
    return fallbackSkillSelection(goal, skills);
  }

  const systemPrompt = `You are an intelligent workflow composer for an AI agent skill marketplace. Your job is to analyze a user's goal and select the most appropriate skills from the available catalog to accomplish that goal.

Available Skills Catalog:
${JSON.stringify(skills, null, 2)}

SELECTION RULES:
1. Analyze the goal carefully and understand what the user wants to accomplish
2. Select 3-5 skills that work together logically in a workflow
3. Consider skill dependencies - skills that produce outputs needed by other skills
4. Prefer skills with higher trust_score
5. Include at least one "data source" skill (search, scraper, tracker) if the goal involves gathering information
6. Include at least one "output/sink" skill (communication, report generator) if the goal involves delivering results

STORAGE & CLOUD INTEGRATION:
- Use 'gogcli' for Google Workspace integration (Gmail, Google Sheets, Drive, Calendar, Docs)
  - For Google Sheets: service='sheets', action='append' to add data, action='get' to read
  - Example: nutrition data → gogcli → saved to Google Sheets
- Use 'csv-analyzer' for local CSV file storage and analysis
- Use 'obsidian' for local Markdown-based knowledge storage
- Use 'markdown-report-generator' for creating reports that can be saved locally or sent

DATA FLOW EXAMPLES:
- Track data locally: source → csv-analyzer → markdown-report-generator
- Sync to cloud: source → gogcli (sheets) → slack-notifier (confirmation)
- Backup strategy: source → csv-analyzer (local) + gogcli (cloud)

Output Format: Return ONLY a JSON array of skill slugs in execution order: ["skill-slug-1", "skill-slug-2", "skill-slug-3"]`;

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hermeshub.ai',
        'X-Title': 'HermesHub AI Composer',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Goal: "${goal}"\n\nSelect the best skills for this goal. Return only the JSON array.` }
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return fallbackSkillSelection(goal, skills);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenRouter response');
      return fallbackSkillSelection(goal, skills);
    }

    // Extract JSON array from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Could not parse skill selection from response:', content);
      return fallbackSkillSelection(goal, skills);
    }

    const selectedSlugs = JSON.parse(jsonMatch[0]);
    
    // Validate selected skills exist
    const validSlugs = selectedSlugs.filter((slug: string) => 
      skills.some(s => s.slug === slug)
    );

    if (validSlugs.length === 0) {
      console.error('No valid skills selected by AI');
      return fallbackSkillSelection(goal, skills);
    }

    return validSlugs.slice(0, 5); // Max 5 skills
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return fallbackSkillSelection(goal, skills);
  }
}

/**
 * Fallback skill selection using keyword matching
 */
function fallbackSkillSelection(goal: string, skills: SkillSummary[]): string[] {
  const lowerGoal = goal.toLowerCase();
  const keywords = lowerGoal.split(/\s+/);
  
  // Score each skill based on keyword matches
  const scored = skills.map(skill => {
    let score = skill.trust_score * 0.3; // Base score from trust
    
    const skillText = `${skill.name} ${skill.description} ${skill.tags.join(' ')}`.toLowerCase();
    
    // Count keyword matches
    for (const keyword of keywords) {
      if (keyword.length < 3) continue; // Skip short words
      if (skillText.includes(keyword)) {
        score += 10;
      }
    }
    
    // Exact phrase matching
    if (skillText.includes(lowerGoal)) {
      score += 20;
    }
    
    return { slug: skill.slug, score };
  });
  
  // Sort by score and return top 4
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map(s => s.slug);
}

/**
 * AI-powered composer: uses LLM to intelligently select skills
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal }: { goal: string } = body;

    if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'A "goal" string is required in the request body',
        hint: 'Example: { "goal": "scrape HN for AI news and send a Slack summary" }',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    // Step 1: Get skills catalog
    const skillsCatalog = buildSkillsCatalog();
    
    if (skillsCatalog.length === 0) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'No skills available in the catalog',
        hint: 'The skills database appears to be empty.',
      };
      return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
    }

    // Step 2: Use AI to select relevant skills
    const selectedSlugs = await selectSkillsWithAI(goal, skillsCatalog);
    
    if (selectedSlugs.length === 0) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'Could not find suitable skills for the given goal',
        hint: 'Try rephrasing your goal or use GET /api/v1/workflows to browse pre-built workflows.',
      };
      return NextResponse.json(resp, { status: 404, headers: corsHeaders() });
    }

    // Step 3: Retrieve full skill objects
    const selectedSkills: Skill[] = [];
    for (const slug of selectedSlugs) {
      const skill = getSkillBySlug(slug);
      if (skill) {
        selectedSkills.push(skill);
      }
    }

    // Step 4: Order by dependencies (sources before sinks)
    const ordered = orderByDependencies(selectedSkills);
    
    // Limit to max 5 skills for clarity
    const limited = ordered.slice(0, 5);
    
    return buildWorkflow(goal, limited);
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Compose error:', error);
    const resp: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
  }
}

/**
 * Build and return workflow response
 */
function buildWorkflow(goal: string, skills: Skill[]): NextResponse {
  // Build workflow steps with input mappings
  const steps: WorkflowStep[] = skills.map((skill, index) => {
    const inputMapping: Record<string, string> = {};

    if (index > 0) {
      // For each required input of this skill, try to find a matching output
      for (const input of skill.inputs) {
        for (let prev = index - 1; prev >= 0; prev--) {
          const prevSkill = skills[prev];
          const matchingOutput = prevSkill.outputs.find(
            (o) => o.type === input.type || o.name.toLowerCase().includes(input.name.toLowerCase()),
          );
          if (matchingOutput) {
            inputMapping[input.name] = `step_${prev + 1}.${matchingOutput.name}`;
            break;
          }
        }
      }
    }

    return {
      order: index + 1,
      skill_slug: skill.slug,
      skill_name: skill.name,
      input_mapping: inputMapping,
    };
  });

  // Create and persist the workflow
  const workflow = createWorkflow(
    `Composed: ${goal.slice(0, 80)}`,
    `Auto-composed workflow for goal: "${goal}"`,
    steps,
    'composer-agent',
  );

  const resp: APIResponse<Workflow> = {
    success: true,
    data: workflow,
  };

  return NextResponse.json(resp, { status: 201, headers: corsHeaders() });
}

/**
 * Topological-ish ordering: skills whose output types are consumed by
 * other skills' inputs are placed earlier. Pure sinks (e.g. notifiers)
 * go last.
 */
function orderByDependencies(skills: Skill[]): Skill[] {
  // Build a set of all output type strings each skill produces
  const outputTypes = new Map<string, Set<string>>();
  for (const skill of skills) {
    outputTypes.set(
      skill.slug,
      new Set(skill.outputs.map((o) => o.type as string)),
    );
  }

  // For each skill, count how many other skills in the set consume its output types
  const feedsCount = new Map<string, number>();
  for (const skill of skills) {
    let count = 0;
    const myOutputs = outputTypes.get(skill.slug)!;
    for (const other of skills) {
      if (other.slug === skill.slug) continue;
      const otherNeedsTypes = new Set(other.inputs.map((i) => i.type as string));
      for (const t of myOutputs) {
        if (otherNeedsTypes.has(t)) {
          count++;
          break;
        }
      }
    }
    feedsCount.set(skill.slug, count);
  }

  // Sort: skills that feed more others come first; ties broken by trust score
  return [...skills].sort((a, b) => {
    const aFeeds = feedsCount.get(a.slug) ?? 0;
    const bFeeds = feedsCount.get(b.slug) ?? 0;
    if (bFeeds !== aFeeds) return bFeeds - aFeeds;
    return b.trust_score - a.trust_score;
  });
}