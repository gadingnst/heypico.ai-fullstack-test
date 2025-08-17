import { BACKEND_URL } from "../../configs/envs";
import BaseHttp from "../../libs/BaseHttp";

export interface Location {
  lat?: number;
  lng?: number;
}

export interface PlaceResult {
  name?: string;
  place_id?: string;
  address?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  location?: Location;
  open_now?: boolean;
  embed_iframe_url?: string;
  directions_url?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  places?: PlaceResult[];
}

export interface ChatResponse {
  response: string;
  places?: PlaceResult[];
}

export async function chat(_userMsg: ChatMessage, _history: ChatMessage[]) {
  const token = localStorage.getItem('token') || ''
  const Http = new BaseHttp({
    baseURL: BACKEND_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  const response = await Http.post(`/v1/chat`, {
    body: JSON.stringify({
      message: _userMsg.content,
      chat_history: _history.map(m => ({ role: m.role, content: m.content }))
    })
  })
  const result: ChatResponse = await response.json()
  return result
}
