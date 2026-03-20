import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('VAHAN Mock API Route', () => {
  it('rejects invalid or short license plates', async () => {
    const req = new Request('http://localhost:3000/api/vahan', {
      method: 'POST',
      body: JSON.stringify({ licensePlate: '123' }), // Too short
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('accepts valid license plates and returns mocked structured data', async () => {
    const req = new Request('http://localhost:3000/api/vahan', {
      method: 'POST',
      body: JSON.stringify({ licensePlate: 'MH01AB1234' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.licensePlate).toBe('MH01AB1234');
    expect(json.data.ownerName).toBe('Rahul Sharma');
    expect(json.data.insuranceStatus).toBe('ACTIVE');
  });
});
