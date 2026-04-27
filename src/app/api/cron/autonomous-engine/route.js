import { runAutonomousTrainingEngine } from '@/lib/trainingRuntimeStore';

function isAuthorized(request) {
  const { searchParams } = new URL(request.url);
  return request.headers.get('x-cron-secret') === 'internal' || searchParams.get('force') === '1';
}

export function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ status: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  return Response.json(runAutonomousTrainingEngine({ force: searchParams.get('force') === '1' }));
}
