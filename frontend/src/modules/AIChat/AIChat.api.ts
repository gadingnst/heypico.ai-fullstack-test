import { BACKEND_BEARER, BACKEND_URL } from "../../configs/envs";
import BaseHttp from "../../libs/BaseHttp";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
}

const Http = new BaseHttp({
  baseURL: BACKEND_URL,
  headers: {
    'Authorization': `Bearer ${BACKEND_BEARER}`,
    'Content-Type': 'application/json'
  }
})

export async function chat(_userMsg: ChatMessage, _history: ChatMessage[]) {
  const response = await Http.post(`/v1/chat`, {
    body: JSON.stringify({
      message: _userMsg.content,
      chat_history: _history
    })
  })
  const result: ChatResponse = await response.json()
  return result
}
