# Ripple — music_p2p-frontend

A dark-glass React/Vite frontend for the **music_p2p** P2P audio streaming node.

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

The API client automatically appends `/api/v1` to `VITE_API_URL`, so set the variable to just the host:port:

```
VITE_API_URL=http://192.168.1.10:8080
```

### Docker

```bash
docker build --build-arg VITE_API_URL=http://<YOUR_SERVER>:8080 -t ripple-frontend .
docker run -p 80:80 ripple-frontend
```

---

## API coverage

All Swagger 2.0 endpoints under `basePath: /api/v1` are implemented in `src/api/client.ts`.

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

---

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

