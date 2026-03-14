import type { Skill, SearchParams } from './types';
import { skillsDb } from './db';
import { skillsDatabase } from './skills-seed';
export { skillsDatabase };

// Initialize with seed data
function initializeSkills(): void {
  const existing = skillsDb.getAll();
  if (existing.length === 0) {
    console.log('Seeding with initial skills...');
    for (const skill of skillsDatabase) {
      skillsDb.insert(skill);
    }
    console.log(`Seeded ${skillsDatabase.length} skills`);
  }
}

/**
 * Find a skill by its URL-friendly slug.
 */
export function getSkillBySlug(slug: string): Skill | undefined {
  return skillsDb.getBySlug(slug);
}

/**
 * Search and filter skills with optional user-profile boosting.
 */
export function searchSkills(params: SearchParams): { skills: Skill[]; total: number } {
  const {
    query,
    category,
    tags,
    min_trust_score,
    complexity,
    required_tools,
    user_profile,
    limit = 20,
    offset = 0,
  } = params;

  let results = skillsDb.search(query || undefined, category || undefined, tags || undefined);

  if (min_trust_score !== undefined) {
    results = results.filter((s) => s.trust_score >= min_trust_score);
  }

  if (complexity) {
    results = results.filter((s) => s.complexity === complexity);
  }

  if (required_tools && required_tools.length > 0) {
    const lowerTools = required_tools.map((t) => t.toLowerCase());
    results = results.filter((s) =>
      lowerTools.every((t) => s.required_tools.map((rt) => rt.toLowerCase()).includes(t)),
    );
  }

  interface ScoredSkill {
    skill: Skill;
    score: number;
  }

  const scored: ScoredSkill[] = results.map((skill) => {
    let score = skill.trust_score;

    if (user_profile) {
      if (user_profile.tools_available && user_profile.tools_available.length > 0) {
        const userToolsLower = user_profile.tools_available.map((t) => t.toLowerCase());
        const matchedTools = skill.required_tools.filter((t) =>
          userToolsLower.includes(t.toLowerCase()),
        );
        const toolCoverage = skill.required_tools.length > 0
          ? matchedTools.length / skill.required_tools.length
          : 1;
        score += toolCoverage * 10;
      }

      if (user_profile.preferences && user_profile.preferences.length > 0) {
        const prefsLower = user_profile.preferences.map((p) => p.toLowerCase());
        const matchedPrefs = skill.tags.filter((t) => prefsLower.includes(t.toLowerCase()));
        score += Math.min(matchedPrefs.length * 2, 8);
      }

      // Boost installed skills slightly (no longer tracked)
    }

    return { skill, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.skill.install_count - a.skill.install_count;
  });

  const total = scored.length;
  const paged = scored.slice(offset, offset + limit).map((s) => s.skill);

  return { skills: paged, total };
}

/**
 * Record a run outcome and recalculate trust metrics.
 */
export function updateSkillScore(slug: string, success: boolean): Skill | undefined {
  return skillsDb.updateTrustScore(slug, success);
}

/**
 * Increment install count for a skill.
 */
export function incrementInstallCount(slug: string): number {
  return skillsDb.updateInstallCount(slug);
}

// Initialize on module load
initializeSkills();
