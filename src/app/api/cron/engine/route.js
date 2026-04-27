import { runExecutionEngine } from '@/lib/trainingRuntimeStore';

function isAuthorized(request) {
  const { searchParams } = new URL(request.url);
  return request.headers.get('x-cron-secret') === 'internal' || searchParams.get('force') === '1';
}

export function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ status: 'forbidden' }, { status: 403 });
  }

  return Response.json(runExecutionEngine());
}
