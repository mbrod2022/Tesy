export type ApiTopic = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  track: string;
};

export type ApiConversation = {
  id: string;
  title: string;
  mode: "CHAT" | "QUIZ" | "EXERCISE" | "REVIEW";
  topicId: string | null;
  topic: ApiTopic | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  role: "SYSTEM" | "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
};

export type ApiConversationDetail = ApiConversation & {
  messages: ApiMessage[];
};
