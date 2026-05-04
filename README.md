# Ripple — music_p2p-frontend

A dark-glass React/Vite frontend for the **music_p2p** P2P audio streaming node.

## What is this?

Ripple is a browser UI for a decentralised, peer-to-peer music streaming node built on libp2p/IPFS primitives. It lets you:

- Browse and play tracks stored in the local node's DHT-backed library.
- Upload audio files and share them with the P2P network.
- Inspect peer connections, playback state, and queue in real time.
- Access every Swagger-documented endpoint through a type-safe API client (`src/api/client.ts`).

## Quick start

```bash
# Install dependencies
npm install

# Start the dev server (pointing at a local backend)
VITE_API_URL=http://localhost:8080 npm run dev

# Production build
npm run build
```

## Configuration

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend node (no trailing slash) | `""` (same origin) |

The API client automatically appends `/api/v1` to `VITE_API_URL`, so set the variable to just the host and port:

```
VITE_API_URL=http://192.168.1.10:8080
```

Copy `.env.example` to `.env.local` and edit as needed:

```bash
cp .env.example .env.local
```

## Docker

```bash
docker build --build-arg VITE_API_URL=http://<YOUR_SERVER>:8080 -t ripple-frontend .
docker run -p 80:80 ripple-frontend
```

The built image serves the static bundle via nginx on port 80.

---

## Smoke check

A lightweight Node.js smoke-check script verifies that the key API endpoints are reachable and return a successful response.

```bash
# Run against the default backend (http://localhost:8080)
npm run smoke

# Run against a different backend
VITE_API_URL=http://192.168.1.10:8080 npm run smoke
```

The script hits `/status`, `/metadata`, and `/tracks` and prints `OK` or `FAIL` for each. It exits with code 1 if any check fails.

---

## API coverage

All Swagger 2.0 endpoints under `basePath: /api/v1` are implemented in `src/api/client.ts`. All request/response types use **snake_case** field names to match the Swagger spec.

| Group | Method | Path | Function |
|---|---|---|---|
| **Node** | GET | `/status` | `getStatus()` |
| **Tracks** | GET | `/tracks` | `getTracks()` |
| | POST | `/tracks/share` | `shareTrack(file, announce?)` |
| | DELETE | `/tracks/{cid}` | `deleteTrack(cid)` |
| **Metadata** | GET | `/metadata` | `getMetadata()` |
| | POST | `/metadata` | `publishMetadata(payload)` |
| | GET | `/metadata/search?q=` | `searchMetadata(q)` |
| | GET | `/metadata/{cid}` | `getMetadataByCid(cid)` |
| **Peers** | GET | `/peers` | `getPeers()` |
| | POST | `/peers/connect` | `connectPeer(multiaddr)` |
| | GET | `/peers/{peerID}/score` | `getPeerScore(peerID)` |
| **Playback** | POST | `/playback/play` | `playTrack(cid)` |
| | POST | `/playback/seek` | `seek(chunkIndex)` |
| | GET | `/playback/status` | `getPlaybackStatus()` |
| | POST | `/playback/stop` | `stopPlayback()` |
| **Queue** | GET | `/queue` | `getQueue()` |
| | POST | `/queue` | `enqueue(item)` |
| | DELETE | `/queue` | `clearQueue()` |
| | POST | `/queue/insert` | `insertQueueItem(item)` |
| | GET | `/queue/history` | `getQueueHistory()` |
| **DHT** | POST | `/dht/provide/{cid}` | `dhtProvide(cid)` |
| | GET | `/dht/providers/{cid}` | `dhtProviders(cid)` |
| **Engine** | GET | `/engine/status` | `getEngineStatus()` |

All functions return `Promise<ApiResponse<T>>` where `ApiResponse<T>` is a discriminated union:

```ts
type ApiResponse<T> =
  | { success: true;  data: T }
  | { success: false; error: string };
```

### Developer utilities panel

A collapsible **Dev Tools** section at the bottom of the sidebar lets you fire representative API calls and inspect the raw JSON response — useful during local development without a separate API client.

