import { createServiceClient } from './create-service-client';
// Each client points to a microservice via Nginx

export const authClient = createServiceClient(
  process.env.AUTH_SERVICE_URL!, // internal URL, not exposed to browser
  'auth'
);

export const postsClient = createServiceClient(
  process.env.POSTS_SERVICE_URL!,
  'posts'
);

export const chatClient = createServiceClient(
  process.env.CHAT_SERVICE_URL!,
  'chat'
);

export const workspaceClient = createServiceClient(
  process.env.WORKSPACE_SERVICE_URL!,
  'workspace'
);

export const profileClient = createServiceClient(
  process.env.PROFILE_SERVICE_URL!,
  'profile'
);
