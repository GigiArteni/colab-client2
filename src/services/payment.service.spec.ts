import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();

vi.mock('src/boot/axios', () => ({
  api: {
    get: (url: string, opts?: unknown) => get(url, opts),
    post: (url: string, body?: unknown) => post(url, body),
  },
}));

import { paymentService } from './payment.service';

const E = 'e1';
const INV = 'inv1';
const REC = 'rec1';

describe('paymentService', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('getPaymentConfig returns config data', async () => {
    const config = { publishable_key: 'pk_test_123', currency: 'eur' };
    get.mockResolvedValueOnce({ data: { data: config } });

    const result = await paymentService.getPaymentConfig(E);

    expect(get.mock.calls[0]![0]).toBe(`/entities/${E}/payment-config`);
    expect(result).toEqual(config);
  });

  it('createPaymentIntent posts to correct endpoint', async () => {
    const intent = { client_secret: 'pi_xxx_secret_yyy', amount: 1500 };
    post.mockResolvedValueOnce({ data: { data: intent } });

    const result = await paymentService.createPaymentIntent(E, INV);

    expect(post.mock.calls[0]![0]).toBe(`/entities/${E}/invoices/${INV}/payment-intent`);
    expect(result).toEqual(intent);
  });

  it('getCheckoutStatus calls status endpoint', async () => {
    const status = { status: 'succeeded', receipt_id: REC };
    get.mockResolvedValueOnce({ data: { data: status } });

    const result = await paymentService.getCheckoutStatus(E, INV, REC);

    expect(get.mock.calls[0]![0]).toBe(
      `/entities/${E}/invoices/${INV}/checkout/${REC}/status`
    );
    expect(result).toEqual(status);
  });
});
