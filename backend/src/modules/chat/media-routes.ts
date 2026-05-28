import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../../config/index.js';
import { minioClient } from '../../shared/storage/minio-client.js';

function contentTypeForKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}

export async function mediaRoutes(app: FastifyInstance) {
  app.get('/media/:bucket/*', async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { bucket: string; '*': string };
    const key = params['*'];
    if (params.bucket !== config.s3Bucket || !key || key.includes('..')) {
      return reply.status(404).send({ error: 'not_found' });
    }

    try {
      const stream = await minioClient.getObject(config.s3Bucket, key);
      reply.header('Cache-Control', 'public, max-age=31536000');
      reply.type(contentTypeForKey(key));
      return reply.send(stream);
    } catch {
      return reply.status(404).send({ error: 'not_found' });
    }
  });
}
