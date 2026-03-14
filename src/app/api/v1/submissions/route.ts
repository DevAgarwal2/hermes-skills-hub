import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { skillsDb } from '@/lib/db';
import type { APIResponse, SkillSubmission, Skill, SkillIO } from '@/lib/types';

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

/**
 * POST /api/v1/submissions
 * Actions: approve, reject, update
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, submission_id } = body;

    if (!action || !submission_id) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'action and submission_id are required',
        hint: 'Actions: approve, reject',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    const submission = await prisma.skillSubmission.findUnique({
      where: { id: submission_id },
    });

    if (!submission) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'Submission not found',
      };
      return NextResponse.json(resp, { status: 404, headers: corsHeaders() });
    }

    let updatedSubmission;

    switch (action) {
      case 'approve':
        updatedSubmission = await prisma.skillSubmission.update({
          where: { id: submission_id },
          data: { status: 'approved', updated_at: new Date() },
        });
        
        // Sync approved skill to main catalog
        try {
          const files = updatedSubmission.files as any[] || [];
          const skillMd = updatedSubmission.skill_content || '';
          
          // Parse inputs/outputs from SKILL.md
          const inputs: SkillIO[] = [];
          const outputs: SkillIO[] = [];
          
          if (skillMd.toLowerCase().includes('## input') || skillMd.toLowerCase().includes('## parameter')) {
            inputs.push({ name: 'input', type: 'text', description: 'User input', required: true });
          }
          if (skillMd.toLowerCase().includes('## output') || skillMd.toLowerCase().includes('## return')) {
            outputs.push({ name: 'output', type: 'text', description: 'Skill output', required: true });
          }
          
          const newSkill: Skill = {
            id: `submitted_${updatedSubmission.id}`,
            name: updatedSubmission.skill_name,
            slug: updatedSubmission.skill_slug,
            description: updatedSubmission.description,
            long_description: updatedSubmission.long_description || skillMd.slice(0, 500),
            version: updatedSubmission.version,
            author: updatedSubmission.author,
            category: (updatedSubmission.category as any) || 'productivity',
            tags: updatedSubmission.tags,
            required_tools: updatedSubmission.required_tools,
            inputs,
            outputs,
            trust_score: updatedSubmission.ai_review_score || 70,
            total_runs: 0,
            successful_runs: 0,
            failed_runs: 0,
            completion_rate: 0,
            retention_rate: 50,
            composition_rate: 50,
            complexity: 'intermediate',
            install_count: 0,
            created_at: updatedSubmission.created_at.toISOString(),
            updated_at: updatedSubmission.updated_at.toISOString(),
            skill_content: skillMd,
            compatible_with: [],
          };
          
          skillsDb.insert(newSkill);
          console.log(`Synced approved skill to catalog: ${newSkill.slug}`);
        } catch (syncError) {
          console.error('Failed to sync to catalog:', syncError);
          // Don't fail the approval if sync fails
        }
        break;

      case 'reject':
        updatedSubmission = await prisma.skillSubmission.update({
          where: { id: submission_id },
          data: { status: 'rejected', updated_at: new Date() },
        });
        break;

      case 'delete':
        // Also remove from skills catalog if it was approved
        try {
          const slug = submission.skill_slug;
          skillsDb.delete(slug);
        } catch (e) {
          // Skill might not be in catalog
        }
        await prisma.skillSubmission.delete({
          where: { id: submission_id },
        });
        return NextResponse.json({ success: true }, { headers: corsHeaders() });

      default:
        return NextResponse.json({ 
          success: false, 
          error: `Unknown action: ${action}`,
          hint: 'Valid actions: approve, reject, delete' 
        }, { status: 400, headers: corsHeaders() });
    }

    const resp: APIResponse<typeof updatedSubmission> = {
      success: true,
      data: updatedSubmission,
    };

    return NextResponse.json(resp, { headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Submissions action error:', error);
    const resp: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
  }
}

/**
 * GET /api/v1/submissions
 * Get submissions with reviews
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (id) {
      const submission = await prisma.skillSubmission.findUnique({
        where: { id },
        include: { reviews: true },
      });

      if (!submission) {
        const resp: APIResponse<never> = {
          success: false,
          error: 'Submission not found',
        };
        return NextResponse.json(resp, { status: 404, headers: corsHeaders() });
      }

      const resp: APIResponse<typeof submission> = {
        success: true,
        data: submission,
      };
      return NextResponse.json(resp, { headers: corsHeaders() });
    }

    const where = status ? { status } : {};

    const [submissions, total] = await Promise.all([
      prisma.skillSubmission.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          reviews: {
            orderBy: { reviewed_at: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.skillSubmission.count({ where }),
    ]);

    const resp: APIResponse<typeof submissions> = {
      success: true,
      data: submissions,
      meta: {
        total,
        limit,
        offset,
      },
    };

    return NextResponse.json(resp, { headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Get submissions error:', error);
    const resp: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
  }
}
