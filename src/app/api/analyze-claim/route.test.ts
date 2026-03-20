import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: async () => ({
          text: JSON.stringify({
            idv: 1450000,
            zeroDepActive: true,
            consumablesActive: false,
            estimatedDamageCost: 32000,
            justification: 'mocked',
            searchSources: ['mock']
          })
        })
      };
    },
    HarmCategory: { HARM_CATEGORY_DANGEROUS_CONTENT: 'mock', HARM_CATEGORY_HARASSMENT: 'mock', HARM_CATEGORY_HATE_SPEECH: 'mock' },
    HarmBlockThreshold: { BLOCK_LOW_AND_ABOVE: 'mock' }
  };
});

vi.mock('@/shared/config/secrets', () => ({
  getSecret: async () => 'mock-api-key'
}));

describe('Analyze Claim HTTP Logic Handler', () => {
  it('successfully processes complete payloads and delegates to AI mock cleanly', async () => {
    const req = new Request('http://localhost:3000/api/analyze-claim', {
      method: 'POST',
      body: JSON.stringify({
        vehicleImageBase64: 'data:image/jpeg;base64,aaa',
        policyPdfBase64: 'data:application/pdf;base64,aaa',
        carModel: 'Tata',
        city: 'Indore'
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.idv).toBe(1450000);
  });
  
  it('gracefully rejects payloads missing required validations', async () => {
    const req = new Request('http://localhost:3000/api/analyze-claim', {
      method: 'POST',
      body: JSON.stringify({ carModel: 'Incomplete' }),
      headers: { 'Content-Type': 'application/json' }
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});
