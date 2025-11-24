import type { Project, ProjectDocument, ProjectWithDocuments } from '@/types';
import { generateHash } from '@/mocks/utils/user-generator';

// Default user for most projects (matches login placeholder)
const DEFAULT_USER_ID = String(generateHash('user@publicisgroupe.com'));
// Specific user for testing authorization (403 errors)
const TEST_USER_ID = String(generateHash('test@publicisgroupe.com'));

export const MOCK_DOCUMENTS: ProjectDocument[] = [
    {
        id: 'doc-1',
        project_id: 'project-1',
        name: 'product-requirements.pdf',
        type: 'pdf',
        size: 2456789,
        content: `# Product Requirements Document

## Overview
This document outlines the requirements for the new customer portal feature.

## Key Features
- User authentication with SSO
- Dashboard with analytics
- Document management
- Team collaboration tools

## Technical Requirements
- React 19 frontend
- TypeScript strict mode
- TailwindCSS for styling
- RESTful API integration`,
        uploaded_at: '2024-01-15T10:30:00Z',
    },
    {
        id: 'doc-2',
        project_id: 'project-1',
        name: 'architecture-diagram.png',
        type: 'image',
        size: 1234567,
        uploaded_at: '2024-01-16T14:20:00Z',
    },
    {
        id: 'doc-3',
        project_id: 'project-1',
        name: 'meeting-notes.md',
        type: 'md',
        size: 45678,
        content: `# Team Meeting Notes - Jan 15, 2024

## Attendees
- Alice (PM)
- Bob (Engineer)
- Carol (Designer)

## Discussion Points
- Reviewed current progress on customer portal
- Discussed UX feedback from stakeholder demo
- Planned sprint goals for next two weeks

## Action Items
- [ ] Bob: Implement SSO integration by Jan 22
- [ ] Carol: Finalize dashboard mockups by Jan 18
- [ ] Alice: Schedule follow-up with stakeholders`,
        uploaded_at: '2024-01-15T16:45:00Z',
    },
    {
        id: 'doc-4',
        project_id: 'project-1',
        name: 'api-spec.json',
        type: 'json',
        size: 89012,
        content: `{
  "openapi": "3.0.0",
  "info": {
    "title": "Customer Portal API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/users": {
      "get": {
        "summary": "Get all users",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  }
}`,
        uploaded_at: '2024-01-17T09:15:00Z',
    },
    {
        id: 'doc-5',
        project_id: 'project-2',
        name: 'market-research.pdf',
        type: 'pdf',
        size: 3456789,
        content: `# Market Research Report - Q1 2024

## Executive Summary
Analysis of market trends and competitive landscape for the new product launch.

## Key Findings
- Market growth rate: 15% YoY
- Target demographic: 25-45 age group
- Primary competitors: 3 major players
- Market opportunity: $50M addressable market

## Recommendations
- Focus on differentiation through AI features
- Competitive pricing strategy
- Partnership opportunities with industry leaders`,
        uploaded_at: '2024-02-01T11:00:00Z',
    },
    {
        id: 'doc-6',
        project_id: 'project-2',
        name: 'budget-spreadsheet.csv',
        type: 'csv',
        size: 123456,
        content: `Category,Q1,Q2,Q3,Q4,Total
Development,50000,55000,60000,65000,230000
Marketing,30000,35000,40000,45000,150000
Operations,20000,20000,20000,20000,80000
Research,15000,15000,15000,15000,60000
Total,115000,125000,135000,145000,520000`,
        uploaded_at: '2024-02-02T13:30:00Z',
    },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'project-1',
        user_id: DEFAULT_USER_ID,
        owner_user_id: DEFAULT_USER_ID,
        name: 'Customer Portal Redesign',
        description:
            'Complete redesign of the customer-facing portal with improved UX, new features, and modern tech stack. Focus on self-service capabilities and analytics dashboard.',
        custom_instructions:
            'Focus on user experience and accessibility. Ensure all components meet WCAG 2.1 AA standards.',
        metadata: null,
        last_activity_at: '2024-01-17T09:15:00Z',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-17T09:15:00Z',
    },
    {
        id: 'project-2',
        user_id: DEFAULT_USER_ID,
        owner_user_id: DEFAULT_USER_ID,
        name: 'Q1 Product Launch',
        description:
            'Planning and execution for the Q1 product launch. Includes market research, competitive analysis, go-to-market strategy, and budget planning.',
        custom_instructions:
            'Keep all stakeholders informed. Focus on data-driven decision making and ROI metrics.',
        metadata: { priority: 'high', budget: 520000 },
        last_activity_at: '2024-02-02T13:30:00Z',
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-02-02T13:30:00Z',
    },
    {
        id: 'project-3',
        user_id: TEST_USER_ID,
        owner_user_id: TEST_USER_ID,
        name: 'Mobile App Development',
        description:
            'Native mobile application for iOS and Android platforms. Phase 1 focuses on core features.',
        custom_instructions:
            'Follow mobile-first design principles and native platform guidelines.',
        metadata: null,
        last_activity_at: '2024-01-20T08:00:00Z',
        created_at: '2024-01-20T08:00:00Z',
        updated_at: null,
    },
];

export const MOCK_PROJECTS_WITH_DOCUMENTS: ProjectWithDocuments[] = [
    {
        ...MOCK_PROJECTS[0],
        documents: MOCK_DOCUMENTS.filter((doc) => doc.project_id === 'project-1'),
    },
    {
        ...MOCK_PROJECTS[1],
        documents: MOCK_DOCUMENTS.filter((doc) => doc.project_id === 'project-2'),
    },
    {
        ...MOCK_PROJECTS[2],
        documents: [],
    },
];

export function getMockProjectById(id: string): ProjectWithDocuments | null {
    return MOCK_PROJECTS_WITH_DOCUMENTS.find((project) => project.id === id) || null;
}

export function getMockDocumentsByProjectId(projectId: string): ProjectDocument[] {
    return MOCK_DOCUMENTS.filter((doc) => doc.project_id === projectId);
}

export function getMockDocumentById(documentId: string): ProjectDocument | null {
    return MOCK_DOCUMENTS.find((doc) => doc.id === documentId) || null;
}

export function getMockProjectsByUserId(userId: string): Project[] {
    console.info('fetching projects for user:', userId);
    return MOCK_PROJECTS;
}
