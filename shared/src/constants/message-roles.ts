export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

export type MessageRoleType = (typeof MESSAGE_ROLES)[keyof typeof MESSAGE_ROLES];
