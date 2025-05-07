
export type ChatMessage = {
  id: string;
  message: string;
  response: string | null;
  isUser: boolean;
  createdAt: string;
};
