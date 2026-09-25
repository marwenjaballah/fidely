import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionsService } from '../transactions.service.js';
import { HTTPException } from 'hono/http-exception';

describe('TransactionsService Security & Loyalty Engine', () => {
  let mockPrisma: any;
  let service: TransactionsService;

  const mockStore = {
    id: 'store-1',
    name: 'Coffee Central',
    slug: 'coffee-central',
    primaryColor: '#8B4513',
    pointsPerTnd: 10,
    welcomePoints: 20,
    active: true,
    ownerId: 'owner-1',
    cashiers: [{ id: 'cashier-1' }],
  };

  const mockCustomer = {
    id: 'customer-1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+21620123456',
  };

  beforeEach(() => {
    mockPrisma = {
      store: {
        findUnique: vi.fn().mockResolvedValue(mockStore),
        findFirst: vi.fn().mockResolvedValue(mockStore),
        findMany: vi.fn().mockResolvedValue([mockStore]),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue(mockCustomer),
        findFirst: vi.fn().mockResolvedValue(mockCustomer),
        findMany: vi.fn().mockResolvedValue([mockCustomer]),
      },
      customerMembership: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
      },
      transaction: {
        create: vi.fn().mockResolvedValue({ id: 'tx-1' }),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    service = new TransactionsService(mockPrisma);
  });

  describe('Dynamic QR Pass Nonce Validation', () => {
    it('successfully accepts exact matching qrCodeToken', async () => {
      const activeToken = 'customer-1:store-1:nonce123';
      const mockMem = {
        id: 'mem-1',
        customerId: 'customer-1',
        storeId: 'store-1',
        pointsBalance: 50,
        qrCodeToken: activeToken,
      };

      mockPrisma.customerMembership.findUnique
        .mockResolvedValueOnce(mockMem) // resolution by qrCodeToken
        .mockResolvedValueOnce(mockMem); // inside $transaction by customerStoreIdx

      mockPrisma.customerMembership.update.mockResolvedValueOnce({
        id: 'mem-1',
        pointsBalance: 75,
      });

      const result = await service.issuePoints('cashier-1', 'CASHIER', activeToken, 2.5, 'store-1');
      expect(result.pointsIssued).toBe(25); // 2.5 * 10 = 25
      expect(result.newBalance).toBe(75);
    });

    it('rejects stale/reused QR token if customer regenerated their pass', async () => {
      // First lookup by qrToken finds nothing (because token was regenerated to new nonce)
      mockPrisma.customerMembership.findUnique
        .mockResolvedValueOnce(null) // by qrCodeToken
        .mockResolvedValueOnce({ // by customerStoreIdx
          id: 'mem-1',
          customerId: 'customer-1',
          storeId: 'store-1',
          pointsBalance: 50,
          qrCodeToken: 'customer-1:store-1:freshNonce999', // New active token in DB
        });

      // Customer presents old stale token
      const oldToken = 'customer-1:store-1:oldNonce111';

      await expect(
        service.issuePoints('cashier-1', 'CASHIER', oldToken, 5, 'store-1')
      ).rejects.toThrow(HTTPException);
    });
  });

  describe('Cross-Store Pass Protection', () => {
    it('blocks issuing points when pass belongs to a different store', async () => {
      // Token belongs to store-2
      const crossStoreToken = 'customer-1:store-2:nonce456';
      mockPrisma.customerMembership.findUnique.mockResolvedValueOnce({
        id: 'mem-2',
        customerId: 'customer-1',
        storeId: 'store-2',
        pointsBalance: 100,
        qrCodeToken: crossStoreToken,
      });

      mockPrisma.store.findUnique
        .mockResolvedValueOnce(mockStore) // cashier store resolution (store-1)
        .mockResolvedValueOnce({ name: 'Bakery Express' }); // other store lookup (store-2)

      await expect(
        service.issuePoints('cashier-1', 'CASHIER', crossStoreToken, 10, 'store-1')
      ).rejects.toThrow(/Cross-store card mismatch/);
    });
  });

  describe('Phone Lookup Safeguards', () => {
    it('rejects phone numbers with fewer than 8 digits to prevent prefix collisions', async () => {
      // Trying to look up with just 3 digits "216"
      mockPrisma.customerMembership.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.issuePoints('cashier-1', 'CASHIER', '216', 5, 'store-1')
      ).rejects.toThrow(/enter at least 8 digits/);
    });
  });

  describe('Concurrency & Balance Control on Redemption', () => {
    it('fails redemption if updateMany count is 0 (concurrent race condition or insufficient points)', async () => {
      mockPrisma.customerMembership.findUnique
        .mockResolvedValueOnce({ // resolution lookup
          id: 'mem-1',
          customerId: 'customer-1',
          storeId: 'store-1',
          pointsBalance: 100,
          qrCodeToken: 'customer-1:store-1:token',
        })
        .mockResolvedValueOnce({ // balance check inside transaction
          id: 'mem-1',
          customerId: 'customer-1',
          storeId: 'store-1',
          pointsBalance: 100,
          qrCodeToken: 'customer-1:store-1:token',
        });

      // Simulate concurrent deduction where points balance dropped below required 50
      mockPrisma.customerMembership.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(
        service.redeemReward('cashier-1', 'CASHIER', 'customer-1:store-1:token', '50', 'store-1')
      ).rejects.toThrow(/Insufficient points or concurrent transaction/);
    });
  });
});
