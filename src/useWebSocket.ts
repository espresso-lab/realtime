import { useEffect, useRef } from "react";

type UrlProvider = () => Promise<string | null>;

interface UseWebSocketOptions {
  onMessage?: (event: MessageEvent) => void;
  onOpen?: () => void;
  shouldReconnect?: () => boolean;
  heartbeatInterval?: number;
  reconnectKey?: number;
}

export function useWebSocket(
  getUrl: UrlProvider | null,
  options: UseWebSocketOptions = {},
) {
  const {
    onMessage,
    onOpen,
    shouldReconnect = () => true,
    heartbeatInterval = 30000,
    reconnectKey = 0,
  } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const getUrlRef = useRef(getUrl);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const shouldReconnectRef = useRef(shouldReconnect);

  useEffect(() => {
    getUrlRef.current = getUrl;
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    shouldReconnectRef.current = shouldReconnect;
  });

  const enabled = getUrl !== null;

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    function scheduleReconnect() {
      if (!disposed && shouldReconnectRef.current()) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    }

    async function connect() {
      if (disposed) return;

      try {
        const url = await getUrlRef.current?.();
        if (disposed || !url) {
          scheduleReconnect();
          return;
        }

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.addEventListener("open", () => {
          onOpenRef.current?.();
          heartbeatTimer.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send("ping");
            }
          }, heartbeatInterval);
        });

        ws.addEventListener("message", (event) => {
          onMessageRef.current?.(event);
        });

        ws.addEventListener("close", () => {
          clearInterval(heartbeatTimer.current);
          scheduleReconnect();
        });

        ws.addEventListener("error", () => {
          ws.close();
        });
      } catch {
        scheduleReconnect();
      }
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer.current);
      clearInterval(heartbeatTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, heartbeatInterval, reconnectKey]);
}
