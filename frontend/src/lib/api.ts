const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export interface ChatRequest {
  query: string;
  language: string;
  image?: string | null;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
  confidence: 'low' | 'medium' | 'high';
  detected_language: string;
}

export interface ApiError {
  error: string;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorData: ApiError = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error: ${res.status}`);
  }

  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export interface TranslateRequest {
  text: string;
  target_lang: string;
}

export interface TranslateResponse {
  translated_text: string;
}

export async function translateText(request: TranslateRequest): Promise<TranslateResponse> {
  const res = await fetch(`${BACKEND_URL}/api/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Translation failed: ${res.status}`);
  }

  return res.json();
}
