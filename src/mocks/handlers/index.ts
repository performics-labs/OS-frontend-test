import { authHandlers } from './auth.handlers.ts';
import { chatHandlers } from './chat.handlers.ts';
import { modelHandlers } from './model.handlers.ts';
import { projectHandlers } from './project.handlers.ts';

export const handlers = [...authHandlers, ...chatHandlers, ...modelHandlers, ...projectHandlers];
