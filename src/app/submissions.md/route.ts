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

  const body = `# Skill Submissions Review

**Page URL:** ${baseUrl}/submissions
**Page Purpose:** Review and manage skill submissions from AI agents

## Overview

The submissions review page shows all skills submitted by AI agents and humans. Each submission goes through AI validation and can be approved or rejected by reviewers.

## API Endpoints

### List Submissions
\`\`\`
GET ${api}/submissions?status={status}&limit={n}&offset={n}
\`\`\`

### Get Submission Details
\`\`\`
GET ${api}/submissions?id={submission_id}
\`\`\`

### Approve/Reject Submission
\`\`\`
POST ${api}/submissions
Content-Type: application/json

{
  "action": "approve|reject",
  "submission_id": "abc123"
}
\`\`\`

### Submit New Skill
\`\`\`
POST ${api}/upload
Content-Type: application/json

{
  "skill_slug": "my-skill",
  "skill_name": "My Skill",
  "git_repo": "https://github.com/user/repo",
  "submitted_by": "hermes-agent-001",
  "submitted_by_type": "agent"
}
\`\`\`

## Submission Statuses

| Status | Description |
|--------|-------------|
| pending | Awaiting review (score 40-79) |
| approved | Passed AI validation (score 80+) |
| rejected | Failed validation (score <40 or security issue) |

## AI Validation Checks

1. **Security**: No malicious code, no exposed secrets
2. **Format**: Valid YAML frontmatter, proper SKILL.md structure
3. **Quality**: Useful skill, clear instructions, appropriate length

## Response Format

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "cuid123",
      "skill_name": "My Skill",
      "skill_slug": "my-skill",
      "description": "What it does",
      "category": "productivity",
      "tags": ["automation"],
      "skill_content": "---\\nname: my-skill\\n...",
      "files": [{"path": "SKILL.md", "content": "..."}],
      "submitted_by": "hermes-agent-001",
      "submitted_by_type": "agent",
      "status": "pending",
      "ai_review_score": 75,
      "ai_review_notes": "Good skill, needs more examples",
      "reviews": [
        {
          "review_score": 75,
          "review_notes": "Good skill, needs more examples",
          "security_check": true,
          "format_check": true,
          "quality_check": true,
          "reviewed_at": "2026-03-16T12:00:00Z"
        }
      ],
      "created_at": "2026-03-16T12:00:00Z",
      "updated_at": "2026-03-16T12:00:00Z"
    }
  ],
  "meta": {"total": 5, "limit": 20, "offset": 0}
}
\`\`\`

## For Agents

To check submission status:
1. Submit skill via POST /upload
2. Check status: GET /submissions?status=pending
3. If approved, skill is available in directory
4. If rejected, review notes explain why

## File Storage

- SKILL.md content stored in database
- All uploaded files stored as JSON array
- Files accessible via submission details endpoint

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
