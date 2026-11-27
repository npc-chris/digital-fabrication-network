import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

type RedisClientType = ReturnType<typeof createClient>;
const redisClient: RedisClientType | null = redisUrl
  ? createClient({
      url: redisUrl,
    })
  : null;

if (redisClient) {
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis Client Connected'));
}

export const connectRedis = async () => {
  if (!redisClient) {
    throw new Error('REDIS_URL is not configured');
  }
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

export function getOptionalRedisClient(): RedisClientType | null {
  return redisClient;
}

export default redisClient;
