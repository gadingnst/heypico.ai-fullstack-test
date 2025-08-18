import { AUTH_TOKEN_KEY } from "@/modules/Auth/hooks/useToken";
import HttpAPI from "@/modules/HttpAPI";
import { parsePersistedValue } from "@/libs/SWRGlobalState/LocalStorage.persistor";

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
  const token = parsePersistedValue<string>(localStorage.getItem(AUTH_TOKEN_KEY)) || '';

  const response = await HttpAPI.post(`/v1/chat`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: _userMsg.content,
      chat_history: _history.map(m => ({ role: m.role, content: m.content }))
    })
  })

  const result: ChatResponse = await response.json()
  return result
}
