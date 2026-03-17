/**
 * Place the Service's path in the Service Paths section.
 * And Craft the Service URL in the Service URLs section, From the BASE URL And Service name.
 * Format: `${BASE_URL}/${SERVICE_NAME}`
 */

/**
 * Do not change the BASE_URL
 * It is set in the .env file
 */
const BASE_URL = process.env.BASE_SERVICE_URL!;

/**
 * Service Paths
 */
const AUTH_SERVICE_PATH = 'auth';
const POSTS_SERVICE_PATH = 'posts';
const CHAT_SERVICE_PATH = 'chat';
const WORKSPACE_SERVICE_PATH = 'workspace';
const PROFILE_SERVICE_PATH = 'profile';

/**
 * Service URLs
 */
const AUTH_SERVICE_URL = `${BASE_URL}/${AUTH_SERVICE_PATH}`;
const POSTS_SERVICE_URL = `${BASE_URL}/${POSTS_SERVICE_PATH}`;
const CHAT_SERVICE_URL = `${BASE_URL}/${CHAT_SERVICE_PATH}`;
const WORKSPACE_SERVICE_URL = `${BASE_URL}/${WORKSPACE_SERVICE_PATH}`;
const PROFILE_SERVICE_URL = `${BASE_URL}/${PROFILE_SERVICE_PATH}`;

export {
  BASE_URL,
  AUTH_SERVICE_URL,
  POSTS_SERVICE_URL,
  CHAT_SERVICE_URL,
  WORKSPACE_SERVICE_URL,
  PROFILE_SERVICE_URL,
};
