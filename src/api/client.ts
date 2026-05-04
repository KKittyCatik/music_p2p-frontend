// Base URL: strip trailing slash from env var, then append /api/v1
const _rawBase = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
const BASE_URL = _rawBase.replace(/\/+$/, '') + '/api/v1';

// ---------------------------------------------------------------------------
// Response envelope (discriminated union for type-safe access)
// ---------------------------------------------------------------------------

/** Generic response envelope from the backend (`internal_api.Response`). */
export type ApiResponse<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string };

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

export interface StatusResponse {
  PeerID: string;
  Addrs: string[];
  PeerCount: number;
  UptimeSecs: number;
}

export interface TrackInfo {
  CID: string;
  ChunkCount: number;
}

export interface Variant {
  CID: string;
  Bitrate?: number;
  Format?: string;
}

export interface TrackMetadata {
  CID: string;
  Title?: string;
  Artist?: string;
  /** Duration in seconds (time.Duration serialised as nanoseconds → treated as number). */
  Duration?: number;
  Variants?: Variant[];
}

/** Request body for POST /metadata */
export interface MetadataRequest {
  CID: string;
  Title?: string;
  Artist?: string;
  Duration?: number;
}

export interface PeerInfo {
  ID: string;
  Addrs: string[];
}

/** Request body for POST /peers/connect */
export interface ConnectRequest {
  multiaddr: string;
}

export interface PlaybackStatus {
  CID?: string;
  ChunkIndex: number;
  Playing: boolean;
}

/** Request body for POST /playback/play */
export interface PlayRequest {
  cid: string;
}

/** Request body for POST /playback/seek */
export interface SeekRequest {
  chunkIndex: number;
}

export interface QueueItemRequest {
  CID: string;
}

export interface QueueItemResponse {
  CID: string;
  Position: number;
}

export interface QueueState {
  Items: QueueItemResponse[];
}

export interface EngineStatus {
  Running: boolean;
  Mode?: string;
}

// ---------------------------------------------------------------------------
// Shared request helper
// ---------------------------------------------------------------------------

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, init);
  } catch (networkErr) {
    return { success: false, error: `Network error: ${String(networkErr)}` };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    return { success: false, error: `HTTP ${res.status}: ${text}` };
  }

  // 204 No Content or empty body — return null cast to T
  const contentType = res.headers.get('content-type') ?? '';
  if (res.status === 204 || !contentType.includes('application/json')) {
    return { success: true, data: null as unknown as T };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { success: false, error: 'Invalid JSON response from server' };
  }

  return json as ApiResponse<T>;
}

/** Convenience wrapper for JSON POST/PUT/PATCH bodies. */
function jsonRequest<T>(path: string, method: string, body: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// 1. Node
// ---------------------------------------------------------------------------

/** GET /status — node status (peer ID, addresses, peer count, uptime) */
export function getStatus(): Promise<ApiResponse<StatusResponse>> {
  return request<StatusResponse>('/status');
}

// ---------------------------------------------------------------------------
// 2. Tracks
// ---------------------------------------------------------------------------

/** GET /tracks — list of all shared tracks */
export function getTracks(): Promise<ApiResponse<TrackInfo[]>> {
  return request<TrackInfo[]>('/tracks');
}

/**
 * POST /tracks/share — upload a track via multipart/form-data.
 * @param file     Audio file to share.
 * @param announce Whether to announce the track to peers (default true).
 */
export function shareTrack(file: File, announce = true): Promise<ApiResponse<TrackInfo>> {
  const form = new FormData();
  form.append('file', file);
  form.append('announce', String(announce));
  return request<TrackInfo>('/tracks/share', { method: 'POST', body: form });
}

/** DELETE /tracks/{cid} — remove a shared track by CID */
export function deleteTrack(cid: string): Promise<ApiResponse<null>> {
  return request<null>(`/tracks/${encodeURIComponent(cid)}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// 3. Metadata
// ---------------------------------------------------------------------------

/** GET /metadata — metadata for all known tracks */
export function getMetadata(): Promise<ApiResponse<TrackMetadata[]>> {
  return request<TrackMetadata[]>('/metadata');
}

/** POST /metadata — publish/update metadata for a track */
export function publishMetadata(payload: MetadataRequest): Promise<ApiResponse<TrackMetadata>> {
  return jsonRequest<TrackMetadata>('/metadata', 'POST', payload);
}

/** GET /metadata/search?q=… — full-text metadata search */
export function searchMetadata(q: string): Promise<ApiResponse<TrackMetadata[]>> {
  return request<TrackMetadata[]>(`/metadata/search?q=${encodeURIComponent(q)}`);
}

/** GET /metadata/{cid} — metadata for a single track by CID */
export function getMetadataByCid(cid: string): Promise<ApiResponse<TrackMetadata>> {
  return request<TrackMetadata>(`/metadata/${encodeURIComponent(cid)}`);
}

// ---------------------------------------------------------------------------
// 4. Peers
// ---------------------------------------------------------------------------

/** GET /peers — list connected peers */
export function getPeers(): Promise<ApiResponse<PeerInfo[]>> {
  return request<PeerInfo[]>('/peers');
}

/** POST /peers/connect — dial a peer by multiaddr */
export function connectPeer(multiaddr: string): Promise<ApiResponse<null>> {
  return jsonRequest<null>('/peers/connect', 'POST', { multiaddr } satisfies ConnectRequest);
}

/** GET /peers/{peerID}/score — trust/scoring info for a specific peer */
export function getPeerScore(peerID: string): Promise<ApiResponse<number>> {
  return request<number>(`/peers/${encodeURIComponent(peerID)}/score`);
}

// ---------------------------------------------------------------------------
// 5. Playback
// ---------------------------------------------------------------------------

/** POST /playback/play — start playback of a track by CID */
export function playTrack(cid: string): Promise<ApiResponse<null>> {
  return jsonRequest<null>('/playback/play', 'POST', { cid } satisfies PlayRequest);
}

/** POST /playback/seek — seek to a specific chunk index */
export function seek(chunkIndex: number): Promise<ApiResponse<null>> {
  return jsonRequest<null>('/playback/seek', 'POST', { chunkIndex } satisfies SeekRequest);
}

/** GET /playback/status — current playback state */
export function getPlaybackStatus(): Promise<ApiResponse<PlaybackStatus>> {
  return request<PlaybackStatus>('/playback/status');
}

/** POST /playback/stop — stop playback */
export function stopPlayback(): Promise<ApiResponse<null>> {
  return request<null>('/playback/stop', { method: 'POST' });
}

// ---------------------------------------------------------------------------
// 6. Queue
// ---------------------------------------------------------------------------

/** GET /queue — current queue state */
export function getQueue(): Promise<ApiResponse<QueueState>> {
  return request<QueueState>('/queue');
}

/** POST /queue — append a track to the end of the queue */
export function enqueue(item: QueueItemRequest): Promise<ApiResponse<QueueItemResponse>> {
  return jsonRequest<QueueItemResponse>('/queue', 'POST', item);
}

/** DELETE /queue — clear the entire queue */
export function clearQueue(): Promise<ApiResponse<null>> {
  return request<null>('/queue', { method: 'DELETE' });
}

/** POST /queue/insert — insert a track at a specific queue position */
export function insertQueueItem(item: QueueItemRequest): Promise<ApiResponse<QueueItemResponse>> {
  return jsonRequest<QueueItemResponse>('/queue/insert', 'POST', item);
}

/** GET /queue/history — playback history */
export function getQueueHistory(): Promise<ApiResponse<QueueItemResponse[]>> {
  return request<QueueItemResponse[]>('/queue/history');
}

// ---------------------------------------------------------------------------
// 7. DHT
// ---------------------------------------------------------------------------

/** POST /dht/provide/{cid} — announce that this node has the given CID */
export function dhtProvide(cid: string): Promise<ApiResponse<null>> {
  return request<null>(`/dht/provide/${encodeURIComponent(cid)}`, { method: 'POST' });
}

/** GET /dht/providers/{cid} — find peers that provide the given CID */
export function dhtProviders(cid: string): Promise<ApiResponse<PeerInfo[]>> {
  return request<PeerInfo[]>(`/dht/providers/${encodeURIComponent(cid)}`);
}

// ---------------------------------------------------------------------------
// 8. Engine
// ---------------------------------------------------------------------------

/** GET /engine/status — streaming engine status */
export function getEngineStatus(): Promise<ApiResponse<EngineStatus>> {
  return request<EngineStatus>('/engine/status');
}
