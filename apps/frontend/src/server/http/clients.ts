import {
  AUTH_SERVICE_URL,
  CHAT_SERVICE_URL,
  POSTS_SERVICE_URL,
  PROFILE_SERVICE_URL,
  WORKSPACE_SERVICE_URL,
} from '../config/server-configs';
import { createServiceClient } from './create-service-client';

// Each client points to a microservice via Nginx

export const authClient = createServiceClient(AUTH_SERVICE_URL, 'auth');

export const postsClient = createServiceClient(POSTS_SERVICE_URL, 'posts');

export const chatClient = createServiceClient(CHAT_SERVICE_URL, 'chat');

export const workspaceClient = createServiceClient(
  WORKSPACE_SERVICE_URL,
  'workspace'
);

export const profileClient = createServiceClient(
  PROFILE_SERVICE_URL,
  'profile'
);
