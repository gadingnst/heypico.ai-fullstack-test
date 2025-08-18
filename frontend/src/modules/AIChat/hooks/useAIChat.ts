import { useState } from "react";
import { useStore } from "swr-global-state";
import { chat, type ChatMessage } from "@/modules/AIChat/AIChat.api";
import LocalStoragePersistor from "@/libs/SWRGlobalState/LocalStorage.persistor";

function useAIChat() {
  const [messages, setMessages] = useStore<ChatMessage[]>({
    key: '@heypico.ai-chat-messages',
    initial: [],
    persistor: LocalStoragePersistor
  })

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearMessages = () => {
    setMessages([]);
  }

  /**
   * Send message to chat API
   */
  const sendMessage = async() => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const _result = await chat(userMessage, messages);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: _result.response,
        places: _result.places
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: unknown) {
      console.error('Error sending message:', error);

      let errorContent = 'Sorry, an error occurred. Please try again.';

      // Handle HTTP errors with specific messages from backend
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response: Response };
        try {
          const errorData = await httpError.response.json();
          if (errorData?.detail) {
            errorContent = errorData.detail;
          }
        } catch {
          // If JSON parsing fails, use default message
        }
      }

      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    inputMessage,
    isLoading,
    setInputMessage,
    sendMessage,
    clearMessages
  }
}

export default useAIChat;
