import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { adminHandlers } from './admin-handlers';

export const worker = setupWorker(...adminHandlers, ...handlers);
