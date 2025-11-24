import { delay, http, HttpResponse } from 'msw';
import type { Project, ProjectDocument } from '@/types';
import { CreateProjectRequestSchema, UpdateProjectRequestSchema } from '@/schemas/projects.schema';
import {
    MOCK_DOCUMENTS,
    MOCK_PROJECTS,
    getMockProjectsByUserId,
    getMockProjectById,
    getMockDocumentsByProjectId,
    getMockDocumentById,
} from '@/mocks/data/project-responses';

function getUserIdFromRequest(request: Request): string | null {
    const userId = request.headers.get('x-user-id');
    return userId || null;
}

export const projectHandlers = [
    // GET /api/v1/projects - List all projects for authenticated user
    http.get('/api/v1/projects', async ({ request }) => {
        await delay(800);

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let projects = getMockProjectsByUserId(userId);

        const ownedCount = projects.filter((p) => p.owner_user_id === userId).length;
        const sharedCount = projects.filter((p) => p.owner_user_id !== userId).length;

        return HttpResponse.json({
            projects,
            total_count: projects.length,
            owned_count: ownedCount,
            shared_count: sharedCount,
        });
    }),

    // GET /api/v1/projects/:id - Get single project with documents
    http.get('/api/v1/projects/:id', async ({ params, request }) => {
        await delay(600);

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const project = getMockProjectById(id as string);

        if (!project) {
            return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // For mocks, allow access to any project for easier development
        // Keep ownership check in UPDATE/DELETE for testing 403 scenarios

        return HttpResponse.json({ project });
    }),

    // POST /api/v1/projects - Create new project (simulated)
    http.post('/api/v1/projects', async ({ request }) => {
        await delay(1000);

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const parseResult = CreateProjectRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return HttpResponse.json(
                { error: 'Validation failed', details: parseResult.error.issues },
                { status: 400 }
            );
        }

        const validatedData = parseResult.data;

        const newProject: Project = {
            id: crypto.randomUUID(),
            user_id: userId,
            owner_user_id: userId,
            name: validatedData.name,
            description: validatedData.description || null,
            custom_instructions: validatedData.custom_instructions || null,
            metadata: validatedData.metadata || null,
            last_activity_at: null,
            created_at: new Date().toISOString(),
            updated_at: null,
        };

        MOCK_PROJECTS.push(newProject);

        return HttpResponse.json(newProject, { status: 201 });
    }),

    // PUT /api/v1/projects/:id - Update project (simulated)
    http.put('/api/v1/projects/:id', async ({ params, request }) => {
        await delay(800);

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();

        const parseResult = UpdateProjectRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return HttpResponse.json(
                { error: 'Validation failed', details: parseResult.error.issues },
                { status: 400 }
            );
        }

        const validatedData = parseResult.data;

        const project = getMockProjectById(id as string);

        if (!project) {
            return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.owner_user_id !== userId) {
            return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updatedProject: Project = {
            ...project,
            ...(validatedData.name !== undefined && { name: validatedData.name }),
            ...(validatedData.description !== undefined && {
                description: validatedData.description,
            }),
            ...(validatedData.custom_instructions !== undefined && {
                custom_instructions: validatedData.custom_instructions,
            }),
            ...(validatedData.metadata !== undefined && { metadata: validatedData.metadata }),
            updated_at: new Date().toISOString(),
        };

        return HttpResponse.json({ success: true, project: updatedProject });
    }),

    // DELETE /api/v1/projects/:id - Delete project (simulated)
    http.delete('/api/v1/projects/:id', async ({ params, request }) => {
        await delay(800);

        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const project = getMockProjectById(id as string);

        if (!project) {
            return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.owner_user_id !== userId) {
            return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return new HttpResponse(null, { status: 204 });
    }),

    // GET /api/v1/projects/:id/documents - Get all documents for a project
    http.get('/api/v1/projects/:id/documents', async ({ params }) => {
        await delay(600);

        const { id } = params;
        const documents = getMockDocumentsByProjectId(id as string);

        return HttpResponse.json({
            documents,
        });
    }),

    // POST /api/v1/projects/:id/documents - Upload document to project (simulated)
    http.post('/api/v1/projects/:id/documents', async ({ params, request }) => {
        await delay(1500);

        const { id } = params;

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return HttpResponse.json(
                {
                    error: 'No file provided',
                    message: 'A file must be included in the request',
                },
                { status: 400 }
            );
        }

        const fileType = file.type.includes('pdf')
            ? 'pdf'
            : file.type.includes('image')
              ? 'image'
              : file.name.endsWith('.md')
                ? 'md'
                : file.name.endsWith('.txt')
                  ? 'txt'
                  : file.name.endsWith('.docx')
                    ? 'docx'
                    : file.name.endsWith('.csv')
                      ? 'csv'
                      : file.name.endsWith('.json')
                        ? 'json'
                        : 'txt';

        const newDocument: ProjectDocument = {
            id: `doc-${Date.now()}`,
            project_id: id as string,
            name: file.name,
            type: fileType as ProjectDocument['type'],
            size: file.size,
            content: fileType === 'txt' || fileType === 'md' ? await file.text() : undefined,
            uploaded_at: new Date().toISOString(),
        };

        MOCK_DOCUMENTS.push(newDocument);

        return HttpResponse.json(
            {
                document: newDocument,
                message: 'Document uploaded successfully',
            },
            { status: 201 }
        );
    }),

    // DELETE /api/v1/projects/:projectId/documents/:documentId - Delete document (simulated)
    http.delete('/api/v1/projects/:projectId/documents/:documentId', async ({ params }) => {
        await delay(600);

        const { projectId, documentId } = params;
        const document = getMockDocumentById(documentId as string);

        if (!document) {
            return HttpResponse.json(
                {
                    error: 'Document not found',
                    message: `Document with id "${documentId}" does not exist`,
                },
                { status: 404 }
            );
        }

        if (document.project_id !== projectId) {
            return HttpResponse.json(
                {
                    error: 'Document not found in this project',
                    message: `Document with id "${documentId}" does not belong to project "${projectId}"`,
                },
                { status: 404 }
            );
        }

        const index = MOCK_DOCUMENTS.indexOf(document);
        if (index > -1) {
            MOCK_DOCUMENTS.splice(index, 1);
        }

        return new HttpResponse(null, { status: 204 });
    }),
];
