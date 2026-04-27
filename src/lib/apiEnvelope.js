export function apiEnvelope(data) {
  return Response.json({
    meta: {
      request_id: `train_${Date.now()}`,
      server_time: new Date().toISOString(),
    },
    data,
    error: null,
  });
}

export function acceptedEnvelope(data) {
  return Response.json(
    {
      meta: {
        request_id: `train_${Date.now()}`,
        server_time: new Date().toISOString(),
      },
      data,
      error: null,
    },
    { status: 202 },
  );
}
