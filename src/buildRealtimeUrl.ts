export interface RealtimeConfig {
  ticketUrl: string;
  wsUrl: string;
  getHeaders: () => Promise<HeadersInit>;
}

interface RealtimeTicket {
  ticket: string;
  expiresIn: number;
}

export function createRealtimeUrlProvider(
  config: RealtimeConfig,
): () => Promise<string | null> {
  return async () => {
    if (!config.wsUrl || !config.ticketUrl) return null;

    try {
      const response = await fetch(config.ticketUrl, {
        method: "POST",
        headers: await config.getHeaders(),
      });
      if (!response.ok) return null;

      const { ticket } = (await response.json()) as RealtimeTicket;
      return `${config.wsUrl}?ticket=${encodeURIComponent(ticket)}`;
    } catch {
      return null;
    }
  };
}
