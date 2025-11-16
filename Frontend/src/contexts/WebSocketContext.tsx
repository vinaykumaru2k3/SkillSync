'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (destination: string, callback: (message: any) => void) => () => void;
  sendMessage: (destination: string, body: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8087/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [user, token]);

  const subscribe = useCallback(
    (destination: string, callback: (message: any) => void) => {
      if (!client || !isConnected) return () => {};

      const subscription = client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      });

      return () => subscription.unsubscribe();
    },
    [client, isConnected]
  );

  const sendMessage = useCallback(
    (destination: string, body: any) => {
      if (client && isConnected) {
        client.publish({
          destination,
          body: JSON.stringify(body),
        });
      }
    },
    [client, isConnected]
  );

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
