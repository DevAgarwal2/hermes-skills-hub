import type { Skill, Workflow, ExecutionLog } from './types';

// In-memory stores
const skills: Map<string, Skill> = new Map();
const workflows: Map<string, Workflow> = new Map();
const executionLogs: ExecutionLog[] = [];

// Export for seeding
export { skills, workflows, executionLogs };

// Skills CRUD
export const skillsDb = {
  getAll(): Skill[] {
    return Array.from(skills.values()).sort((a, b) => b.trust_score - a.trust_score);
  },

  getBySlug(slug: string): Skill | undefined {
    return skills.get(slug);
  },

  insert(skill: Skill): void {
    skills.set(skill.slug, skill);
  },

  updateInstallCount(slug: string): number {
    const skill = skills.get(slug);
    if (skill) {
      skill.install_count += 1;
      skill.updated_at = new Date().toISOString();
      return skill.install_count;
    }
    return 0;
  },

  updateTrustScore(slug: string, success: boolean): Skill | undefined {
    const skill = skills.get(slug);
    if (!skill) return undefined;

    skill.total_runs += 1;
    if (success) {
      skill.successful_runs += 1;
    } else {
      skill.failed_runs += 1;
    }

    skill.completion_rate = skill.total_runs > 0
      ? parseFloat(((skill.successful_runs / skill.total_runs) * 100).toFixed(1))
      : 0;

    skill.trust_score = parseFloat(
      (
        0.5 * skill.completion_rate +
        0.3 * skill.retention_rate +
        0.2 * skill.composition_rate
      ).toFixed(1)
    );

    skill.updated_at = new Date().toISOString();
    return skill;
  },

  search(query?: string, category?: string, tags?: string[]): Skill[] {
    let results = this.getAll();

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.long_description.toLowerCase().includes(q)
      );
    }

    if (category) {
      results = results.filter(s => s.category === category);
    }

    if (tags && tags.length > 0) {
      const lowerTags = tags.map(t => t.toLowerCase());
      results = results.filter(s => 
        lowerTags.some(tag => s.tags.map(t => t.toLowerCase()).includes(tag))
      );
    }

    return results;
  },

  clearAll(): void {
    skills.clear();
  },
};

// Workflows CRUD
export const workflowsDb = {
  getAll(): Workflow[] {
    return Array.from(workflows.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getById(id: string): Workflow | undefined {
    return workflows.get(id);
  },

  insert(workflow: Workflow): void {
    workflows.set(workflow.id, workflow);
  },

  updateStats(id: string, success: boolean): void {
    const workflow = workflows.get(id);
    if (!workflow) return;

    workflow.total_runs += 1;
    const workflowLogs = executionLogs.filter(l => l.workflow_id === id);
    const successes = workflowLogs.filter(l => l.status === 'success').length + (success ? 1 : 0);
    workflow.success_rate = workflowLogs.length + 1 > 0
      ? parseFloat(((successes / (workflowLogs.length + 1)) * 100).toFixed(1))
      : 0;
  },

  clearAll(): void {
    workflows.clear();
  },
};

// Execution logs CRUD
export const logsDb = {
  insert(log: ExecutionLog): void {
    executionLogs.push(log);
  },

  getBySkillId(skillId: string): ExecutionLog[] {
    return executionLogs
      .filter(l => l.skill_id === skillId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },

  getByWorkflowId(id: string): ExecutionLog[] {
    return executionLogs
      .filter(l => l.workflow_id === id)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },

  getAll(): ExecutionLog[] {
    return executionLogs.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },

  clearAll(): void {
    executionLogs.length = 0;
  },
};

export default { skills, workflows, executionLogs };
