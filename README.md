# Realtime

A small, ticket-authenticated WebSocket client for React hosts and micro-frontends.
It manages a single reconnecting connection and lets any component subscribe to messages —
designed to be shared as a Module Federation singleton.

[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![NPM Version](https://img.shields.io/npm/v/@espresso-lab/realtime.svg?style=flat)](https://www.npmjs.com/package/@espresso-lab/realtime)

## Installation

```bash
npm i @espresso-lab/realtime
```

Peer dependencies: `react` and `react-dom`.

## How it works

The provider fetches a short-lived ticket from `ticketUrl` (POST, with your auth headers),
then opens `wsUrl?ticket=…`. The connection reconnects automatically and survives token refreshes.

## Usage

Wrap your app in `RealtimeProvider`:

```tsx
import { RealtimeProvider } from "@espresso-lab/realtime";

export function Root() {
  return (
    <RealtimeProvider
      config={{
        ticketUrl: "https://api.example.com/realtime/ticket",
        wsUrl: "wss://realtime.example.com",
        getHeaders: async () => ({ Authorization: await getToken() }),
      }}
    >
      <App />
    </RealtimeProvider>
  );
}
```

Subscribe to messages from anywhere inside the provider:

```tsx
import { useRealtimeMessage, useRealtimeOpen } from "@espresso-lab/realtime";

export function TaskBadge() {
  useRealtimeOpen(() => console.log("connected"));

  useRealtimeMessage((message) => {
    // handle each parsed JSON message
  });

  return null;
}
```

Trigger a manual reconnect by changing `reconnectSignal`:

```tsx
<RealtimeProvider config={config} reconnectSignal={reconnectCount}>
  {children}
</RealtimeProvider>
```

## API

| Export | Description |
| --- | --- |
| `RealtimeProvider` | Holds the connection. Props: `config`, optional `reconnectSignal`. |
| `useRealtimeMessage(handler)` | Subscribe to parsed JSON messages. |
| `useRealtimeOpen(handler)` | Run a callback whenever the socket (re)opens. |
| `createRealtimeUrlProvider(config)` | Standalone ticket-to-URL resolver, if you need it outside React. |

## License

MIT
