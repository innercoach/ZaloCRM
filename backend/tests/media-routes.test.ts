import Fastify from 'fastify';
import { Readable } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getObject = vi.fn();

vi.mock('../src/config/index.js', () => ({
  config: {
    s3Bucket: 'zalocrm-attachments',
  },
}));

vi.mock('../src/shared/storage/minio-client.js', () => ({
  minioClient: { getObject },
}));

describe('media routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function buildApp() {
    const { mediaRoutes } = await import('../src/modules/chat/media-routes.js');
    const app = Fastify({ logger: false });
    await app.register(mediaRoutes);
    return app;
  }

  it('streams attachments through the app media path', async () => {
    getObject.mockResolvedValue(Readable.from(Buffer.from('image-bytes')));
    const app = await buildApp();

    const res = await app.inject({
      method: 'GET',
      url: '/media/zalocrm-attachments/2026-05-28/example.jpg',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('image-bytes');
    expect(res.headers['cache-control']).toBe('public, max-age=31536000');
    expect(getObject).toHaveBeenCalledWith('zalocrm-attachments', '2026-05-28/example.jpg');
  });
});
