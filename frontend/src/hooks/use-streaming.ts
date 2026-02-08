import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { useChatStore } from '@/stores/chat-store';
import { MessageRole } from '@shared/index';

interface UseStreamingReturn {
  isConnected: boolean;
  isStreaming: boolean;
  sendStreamMessage: (conversationId: string, message: string) => void;
  disconnect: () => void;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

// WebSocket 이벤트 상수
const EVENT_SEND_MESSAGE = 'sendMessage';
const EVENT_MESSAGE_SAVED = 'messageSaved';
const EVENT_STREAM_CHUNK = 'streamChunk';
const EVENT_STREAM_END = 'streamEnd';
const EVENT_STREAM_ERROR = 'streamError';

/**
 * WebSocket 스트리밍 훅
 * - Socket.IO 클라이언트 연결 관리
 * - 스트리밍 메시지 전송/수신
 * - 청크 수신 및 실시간 UI 업데이트
 * - 연결 상태 관리 (연결/해제/재연결)
 */
export const useStreaming = (): UseStreamingReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.token);

  const {
    isStreaming,
    setStreaming,
    addMessage,
    appendStreamingContent,
    resetStreamingContent,
    finalizeStreamingMessage,
  } = useChatStore();

  const currentConversationId = useChatStore(
    (state) => state.currentConversation?.id,
  );

  // Socket.IO 연결 관리
  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // 사용자 메시지 저장 확인
    socket.on(
      EVENT_MESSAGE_SAVED,
      (data: { role: string; message: { id: string; content: string; createdAt: string } }) => {
        if (data.role === 'user' && currentConversationId) {
          addMessage({
            id: data.message.id,
            conversationId: currentConversationId,
            role: MessageRole.USER,
            content: data.message.content,
            createdAt: new Date(data.message.createdAt),
          });
        }
      },
    );

    // 스트리밍 청크 수신
    socket.on(EVENT_STREAM_CHUNK, (data: { chunk: string }) => {
      appendStreamingContent(data.chunk);
    });

    // 스트리밍 완료
    socket.on(
      EVENT_STREAM_END,
      (data: { message: { id: string; content: string; createdAt: string } }) => {
        if (currentConversationId) {
          finalizeStreamingMessage({
            id: data.message.id,
            conversationId: currentConversationId,
            role: MessageRole.ASSISTANT,
            content: data.message.content,
            createdAt: new Date(data.message.createdAt),
          });
        }
      },
    );

    // 스트리밍 에러
    socket.on(EVENT_STREAM_ERROR, (_data: { message: string }) => {
      setStreaming(false);
      resetStreamingContent();
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // 스트리밍 메시지 전송
  const sendStreamMessage = useCallback(
    (conversationId: string, message: string) => {
      if (!socketRef.current?.connected) {
        return;
      }

      setStreaming(true);
      resetStreamingContent();

      socketRef.current.emit(EVENT_SEND_MESSAGE, {
        conversationId,
        message,
      });
    },
    [setStreaming, resetStreamingContent],
  );

  // 연결 해제
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    isStreaming,
    sendStreamMessage,
    disconnect,
  };
};
