export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { startCronWorker } = await import('@/lib/services/cron-worker');
  startCronWorker();
}
