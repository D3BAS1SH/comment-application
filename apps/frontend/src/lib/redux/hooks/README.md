# Redux Hooks

This directory contains utility hooks for accessing Redux state outside of React components, organized by domain.

## Directory Structure

- `user.hooks.ts` - Hooks for accessing user and authentication state
- Future files:
  - `post.hooks.ts` - Hooks for accessing post-related state
  - `comment.hooks.ts` - Hooks for accessing comment-related state
  - `canvas.hooks.ts` - Hooks for accessing canvas-related state
  - `chat.hooks.ts` - Hooks for accessing chat-related state

## Usage

You can import hooks directly from their domain file:

```typescript
import { getUserId, isAuthenticated } from '@/lib/redux/hooks/user.hooks';
```

Or use the index file to import any hook:

```typescript
import { getUserId, isAuthenticated } from '@/lib/redux/hooks';
```

## Pattern

Each domain file should contain hooks related to that specific domain's state. This helps with:

1. Organization - Easy to find hooks by domain
2. Maintenance - Changes to one domain don't affect others
3. Scalability - New domains can be added easily
4. Testing - Domain hooks can be tested in isolation