export interface ChatResponse {
    response: string;
  }
  
  export async fn chat(message: string, language: string = 'en'): Promise<ChatResponse> {
    const res = await fetch('/api/chat', { // Assuming backend is proxied or CORS set up
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, language }),
    });
  
    if (!res.ok) {
        throw new Error('Failed to fetch response');
    }
  
    return res.json();
  }
