// Security client for TMovie
// Handles fingerprinting, session management, and secure API calls

import { secureStorage } from './crypto';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface SessionData {
  sessionToken: string;
  routeTokens: Record<string, string>;
  expiresAt: number;
  trustScore?: number;
}

interface FingerprintData {
  screen: { width: number; height: number; colorDepth: number };
  timezone: string;
  languages: string[];
  plugins: number;
  platform: string;
  canvas?: string;
  webgl?: string;
  audio?: string;
  touchSupport: boolean;
  webdriver: boolean;
  mouseMovements: number;
  scrollEvents: number;
  keyEvents: number;
}

// Behavioral tracking
let mouseMovements = 0;
let scrollEvents = 0;
let keyEvents = 0;

// Track user interactions
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', () => { mouseMovements++; }, { passive: true });
  window.addEventListener('scroll', () => { scrollEvents++; }, { passive: true });
  window.addEventListener('keydown', () => { keyEvents++; }, { passive: true });
}

// Generate canvas fingerprint
async function getCanvasFingerprint(): Promise<string | undefined> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    
    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = '#069';
    ctx.fillText('TMovie Security', 10, 10);
    ctx.strokeStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.strokeText('TMovie Security', 12, 12);
    
    return canvas.toDataURL().slice(-50);
  } catch {
    return undefined;
  }
}

// Generate WebGL fingerprint
function getWebGLFingerprint(): string | undefined {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return undefined;
    
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return undefined;
    
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return renderer?.substring(0, 50);
  } catch {
    return undefined;
  }
}

// Generate audio fingerprint
async function getAudioFingerprint(): Promise<string | undefined> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    
    oscillator.connect(analyser);
    analyser.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.start(0);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    oscillator.stop();
    audioContext.close();
    
    return dataArray.slice(0, 10).join('');
  } catch {
    return undefined;
  }
}

// Generate fingerprint
async function generateFingerprint(): Promise<FingerprintData> {
  const canvas = await getCanvasFingerprint();
  const webgl = getWebGLFingerprint();
  const audio = await getAudioFingerprint();
  
  return {
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: Array.from(navigator.languages || []),
    plugins: navigator.plugins?.length || 0,
    platform: navigator.platform,
    canvas,
    webgl,
    audio,
    touchSupport: 'ontouchstart' in window,
    webdriver: !!(navigator as any).webdriver,
    mouseMovements,
    scrollEvents,
    keyEvents,
  };
}

// Session management
class SecurityClient {
  private session: SessionData | null = null;
  private initPromise: Promise<void> | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    // Try to restore session
    const stored = secureStorage.get<SessionData>('_session', null as any);
    if (stored && stored.expiresAt > Date.now()) {
      this.session = stored;
      this.startTokenRefresh();
      return;
    }

    // Create new session
    await this.createSession();
  }

  private async createSession(): Promise<void> {
    try {
      const fingerprint = await generateFingerprint();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/session-init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fingerprint,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      
      this.session = {
        sessionToken: data.sessionToken,
        routeTokens: data.routeTokens,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      };

      secureStorage.set('_session', this.session);
      this.startTokenRefresh();
      
      console.log('[Security] Session initialized');
    } catch (error) {
      console.error('[Security] Session creation failed:', error);
      throw error;
    }
  }

  private startTokenRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refresh route tokens every 4 minutes
    this.refreshInterval = setInterval(() => {
      this.refreshTokens();
    }, 4 * 60 * 1000);
  }

  private async refreshTokens(): Promise<void> {
    if (!this.session) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/refresh-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': this.session.sessionToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.session.routeTokens = data.routeTokens;
        secureStorage.set('_session', this.session);
        console.log('[Security] Tokens refreshed');
      } else if (response.status === 401) {
        // Session expired, create new one
        await this.createSession();
      }
    } catch (error) {
      console.error('[Security] Token refresh failed:', error);
    }
  }

  async request<T>(action: string, params?: Record<string, any>): Promise<T> {
    await this.init();

    if (!this.session) {
      throw new Error('No active session');
    }

    const routeToken = this.session.routeTokens[action] || this.session.routeTokens['movies'];
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/api-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': this.session.sessionToken,
        'X-Route-Token': routeToken,
        'X-Request-Timestamp': String(timestamp),
        'X-Request-Nonce': nonce,
      },
      body: JSON.stringify({ action, params }),
    });

    if (response.status === 401) {
      // Session expired, recreate and retry
      await this.createSession();
      return this.request(action, params);
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds.`);
    }

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return response.json();
  }

  getSessionToken(): string | null {
    return this.session?.sessionToken || null;
  }

  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.session = null;
    secureStorage.remove('_session');
  }
}

export const securityClient = new SecurityClient();
