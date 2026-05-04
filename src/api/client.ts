const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ---------------------------------------------------------------------------
// Response envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string;
}

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

export interface TrackMetadata {
  CID: string;
  Title?: string;
  Artist?: string;
  Duration?: number;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    return { success: false, data: undefined as unknown as T, error: text };
  }
  const json = (await res.json()) as ApiResponse<T>;
  return json;
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

/** GET /status — node status (peer ID, addresses, peer count, uptime) */
export function getStatus(): Promise<ApiResponse<StatusResponse>> {
  return request<StatusResponse>('/status');
}

/** GET /tracks — list of all shared tracks */
export function getTracks(): Promise<ApiResponse<TrackInfo[]>> {
  return request<TrackInfo[]>('/tracks');
}

/**
 * POST /tracks/share — upload a track via multipart/form-data.
 * @param file     Audio file to share.
 * @param announce Whether to announce the track to peers.
 */
export function shareTrack(file: File, announce: boolean): Promise<ApiResponse<TrackInfo>> {
  const form = new FormData();
  form.append('file', file);
  form.append('announce', String(announce));
  return request<TrackInfo>('/tracks/share', { method: 'POST', body: form });
}

/** DELETE /tracks/:cid — remove a track by CID */
export function deleteTrack(cid: string): Promise<ApiResponse<null>> {
  return request<null>(`/tracks/${encodeURIComponent(cid)}`, { method: 'DELETE' });
}

/** GET /tracks/metadata — metadata for all tracks */
export function getMetadata(): Promise<ApiResponse<TrackMetadata[]>> {
  return request<TrackMetadata[]>('/tracks/metadata');
}

/** POST /tracks/:cid/play — start playback of a track */
export function playTrack(cid: string): Promise<ApiResponse<null>> {
  return request<null>(`/tracks/${encodeURIComponent(cid)}/play`, { method: 'POST' });
}

/** POST /seek — seek to a specific chunk index during playback */
export function seek(chunkIndex: number): Promise<ApiResponse<null>> {
  return request<null>('/seek', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chunkIndex }),
  });
}

/** POST /peers/connect — connect to a peer by multiaddr */
export function connectPeer(multiaddr: string): Promise<ApiResponse<null>> {
  return request<null>('/peers/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ multiaddr }),
  });
}
