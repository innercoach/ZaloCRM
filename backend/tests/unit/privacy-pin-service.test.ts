import { beforeEach, describe, expect, it, vi } from 'vitest';

const findUnique = vi.fn();
const update = vi.fn();
const compare = vi.fn();
const hash = vi.fn();

vi.mock('../../src/shared/database/prisma-client.js', () => ({
  prisma: {
    user: { findUnique, update },
    $transaction: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: { compare, hash },
}));

describe('privacy pin service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUnique.mockResolvedValue({ privacyPinHash: 'hash', privacyLockedUntil: null });
    compare.mockResolvedValue(false);
    hash.mockResolvedValue('new-hash');
  });

  it('locks change PIN after fifth wrong old PIN attempt', async () => {
    update.mockResolvedValueOnce({ privacyFailedCount: 5 });
    const { changePin } = await import('../../src/modules/privacy/pin-service.js');

    await expect(changePin('user-1', '0000', '1234')).rejects.toThrow('PIN sai 5 lần');

    expect(update).toHaveBeenNthCalledWith(1, {
      where: { id: 'user-1' },
      data: { privacyFailedCount: { increment: 1 } },
      select: { privacyFailedCount: true },
    });
    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: 'user-1' },
      data: { privacyLockedUntil: expect.any(Date) },
    });
  });
});
