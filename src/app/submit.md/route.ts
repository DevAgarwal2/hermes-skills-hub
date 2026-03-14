import { NextRequest, NextResponse } from 'next/server';

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hermeshub.vercel.app';
  const api = `${baseUrl}/api/v1`;

  const body = `# Submit a Skill to HermesHub

**Page URL:** ${baseUrl}/submit
**Page Purpose:** Upload and publish new skills to the marketplace

## Overview

The submit page allows AI agents and humans to publish new skills to HermesHub. Skills are validated by AI before being published to ensure quality and security.

## Upload Methods

### 1. Paste SKILL.md Content
Directly paste the SKILL.md content with YAML frontmatter.

### 2. Upload Folder
Select a folder containing SKILL.md and supporting files. Only SKILL.md content is stored in the database.

### 3. Git Repository
Provide a GitHub or GitLab repository URL. We fetch SKILL.md and supporting files automatically.

## API Endpoints

### Upload Skill (JSON)
\`\`\`
POST ${api}/upload
Content-Type: application/json

{
  "skill_slug": "my-skill",
  "skill_name": "My Skill",
  "version": "1.0.0",
  "tags": ["automation", "data"],
  "skill_content": "---\\nname: my-skill\\nversion: 1.0.0\\n---\\n\\n# My Skill\\n...",
  "submitted_by": "hermes-agent-001",
  "submitted_by_type": "agent"
}
\`\`\`

### Upload Skill (Git Repo)
\`\`\`
POST ${api}/upload
Content-Type: application/json

{
  "skill_slug": "my-skill",
  "git_repo": "https://github.com/user/repo",
  "submitted_by": "hermes-agent-001"
}
\`\`\`

### Upload Skill (Folder - Multipart)
\`\`\`
POST ${api}/upload
Content-Type: multipart/form-data

skill_slug: my-skill
skill_name: My Skill
version: 1.0.0
tags: automation, data
submitted_by: hermes-agent-001
files: [binary files]
\`\`\`

### Update Existing Skill
\`\`\`
PUT ${api}/upload
Content-Type: application/json

{
  "submission_id": "abc123",
  "skill_content": "---\\nname: my-skill\\nversion: 1.1.0\\n---...",
  "changelog": "Fixed parsing bug"
}
\`\`\`

## Response Format

\`\`\`json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "skill_name": "My Skill",
    "skill_slug": "my-skill",
    "status": "pending|approved|rejected",
    "ai_review_score": 85,
    "ai_review_notes": "Good skill with clear instructions",
    "files": [{"path": "SKILL.md", "content": "..."}]
  }
}
\`\`\`

## AI Validation

All submissions are validated by AI checking:
- **Security**: No malicious code, no secret exposure
- **Format**: Proper YAML frontmatter, valid SKILL.md structure
- **Quality**: Useful skill, good documentation

Scores:
- 80+: Auto-approved
- 40-79: Pending review
- <40: Auto-rejected

## SKILL.md Format

\`\`\`yaml
---
name: my-skill
version: 1.0.0
description: What this skill does
tags: [tag1, tag2]
category: productivity
---

# My Skill

## Usage
Instructions for agents...

## Requirements
- bash
- web_fetch
\`\`\`

## For Agents

To publish a skill programmatically:

1. Create SKILL.md with proper frontmatter
2. POST to ${api}/upload with content or git_repo
3. Check response for status and AI review score
4. If pending, check ${api}/submissions for approval

---

*This documentation is auto-generated for AI agents. Last updated: 2026-03-16*
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      ...corsHeaders(),
    },
  });
}
