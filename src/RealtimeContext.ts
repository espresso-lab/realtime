import { createContext, useContext, useEffect, useRef } from "react";

export type RealtimeMessageHandler<T = unknown> = (message: T) => void;
export type RealtimeOpenHandler = () => void;

export interface RealtimeContextValue {
  subscribe: (handler: RealtimeMessageHandler) => () => void;
  subscribeOpen: (handler: RealtimeOpenHandler) => () => void;
}

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtimeMessage<T = unknown>(handler: RealtimeMessageHandler<T>) {
  const context = useContext(RealtimeContext);
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    if (!context) return;
    return context.subscribe((message) => handlerRef.current(message as T));
  }, [context]);
}

export function useRealtimeOpen(handler: RealtimeOpenHandler) {
  const context = useContext(RealtimeContext);
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    if (!context) return;
    return context.subscribeOpen(() => handlerRef.current());
  }, [context]);
}
