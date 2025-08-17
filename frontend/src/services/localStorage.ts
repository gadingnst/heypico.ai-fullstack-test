import type { ChatMessage, Place } from '../types';

const CHAT_HISTORY_KEY = 'heypico_chat_history';
const LOCATION_RESULTS_KEY = 'heypico_location_results';

/**
 * Service for managing local storage operations
 */
export class LocalStorageService {
  /**
   * Save chat history to local storage
   */
  static saveChatHistory(messages: ChatMessage[]): void {
    try {
      const serializedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.isUser,
        role: msg.role,
        timestamp: msg.timestamp.toISOString(),
        places: msg.places || []
      }));
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(serializedMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  /**
   * Load chat history from local storage
   */
  static loadChatHistory(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((msg: {
        id: string;
        content: string;
        isUser: boolean;
        role: string;
        timestamp: string;
        places?: Place[];
      }) => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.isUser,
        role: msg.role,
        timestamp: new Date(msg.timestamp),
        places: msg.places || []
      }));
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  /**
   * Clear chat history from local storage
   */
  static clearChatHistory(): void {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  /**
   * Save location results to local storage
   */
  static saveLocationResults(places: Place[]): void {
    try {
      localStorage.setItem(LOCATION_RESULTS_KEY, JSON.stringify(places));
    } catch (error) {
      console.error('Error saving location results:', error);
    }
  }

  /**
   * Load location results from local storage
   */
  static loadLocationResults(): Place[] {
    try {
      const stored = localStorage.getItem(LOCATION_RESULTS_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading location results:', error);
      return [];
    }
  }

  /**
   * Clear location results from local storage
   */
  static clearLocationResults(): void {
    try {
      localStorage.removeItem(LOCATION_RESULTS_KEY);
    } catch (error) {
      console.error('Error clearing location results:', error);
    }
  }

  /**
   * Get chat history formatted for API context
   */
  static getChatHistoryForAPI(messages: ChatMessage[]): { role: string; content: string; timestamp?: string }[] {
    return messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString()
    }));
  }

  /**
   * Clear all stored data
   */
  static clearAll(): void {
    this.clearChatHistory();
    this.clearLocationResults();
  }
}