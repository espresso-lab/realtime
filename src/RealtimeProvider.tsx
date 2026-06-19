import type { ReactNode } from "react";
import { useRef } from "react";
import { useWebSocket } from "./useWebSocket";
import { createRealtimeUrlProvider, type RealtimeConfig } from "./buildRealtimeUrl";
import {
  RealtimeContext,
  type RealtimeContextValue,
  type RealtimeMessageHandler,
  type RealtimeOpenHandler,
} from "./RealtimeContext";

interface RealtimeProviderProps {
  config: RealtimeConfig;
  reconnectSignal?: number;
  children: ReactNode;
}

export function RealtimeProvider({
  config,
  reconnectSignal = 0,
  children,
}: RealtimeProviderProps) {
  const messageHandlers = useRef(new Set<RealtimeMessageHandler>());
  const openHandlers = useRef(new Set<RealtimeOpenHandler>());
  const getUrl = useRef(createRealtimeUrlProvider(config));

  useWebSocket(getUrl.current, {
    reconnectKey: reconnectSignal,
    onOpen: () => openHandlers.current.forEach((handler) => handler()),
    onMessage: (event) => {
      let message: unknown;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      messageHandlers.current.forEach((handler) => handler(message));
    },
  });

  const value: RealtimeContextValue = {
    subscribe: (handler) => {
      messageHandlers.current.add(handler);
      return () => messageHandlers.current.delete(handler);
    },
    subscribeOpen: (handler) => {
      openHandlers.current.add(handler);
      return () => openHandlers.current.delete(handler);
    },
  };

  return <RealtimeContext value={value}>{children}</RealtimeContext>;
}
