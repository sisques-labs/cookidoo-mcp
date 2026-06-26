import { HealthController } from './health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  it('reports status "ok" with an ISO timestamp', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBe(new Date(result.timestamp).toISOString());
  });
});
