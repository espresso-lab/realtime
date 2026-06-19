import { createContext, useContext, useEffect, useRef } from "react";

export type RealtimeMessageHandler<T = unknown> = (message: T) => void;
export type RealtimeOpenHandler = () => void;

export interface RealtimeContextValue {
  subscribe: (handler: RealtimeMessageHandler) => () => void;
  subscribeOpen: (handler: RealtimeOpenHandler) => () => void;
}

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);

function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtimeMessage/useRealtimeOpen must be used within a RealtimeProvider");
  }
  return context;
}

export function useRealtimeMessage<T = unknown>(handler: RealtimeMessageHandler<T>) {
  const { subscribe } = useRealtime();
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(
    () => subscribe((message) => handlerRef.current(message as T)),
    [subscribe],
  );
}

export function useRealtimeOpen(handler: RealtimeOpenHandler) {
  const { subscribeOpen } = useRealtime();
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => subscribeOpen(() => handlerRef.current()), [subscribeOpen]);
}
