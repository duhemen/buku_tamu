import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
maxRetriesPerRequest: null,
});

new Worker('receipts', async (job) => {
console.log('Processing job', job.id, job.name);
// TODO: generate PDF, kirim ke storage, update DB
}, { connection });

console.log('Worker aktif...');
