import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase.js', () => ({
  getSupabaseServiceClient: vi.fn(),
}));

import { MerchantService } from '../merchant.service.js';
import { CustomerService } from '../customer.service.js';

describe('Store Menu Sharing & Customer Order Notification Services', () => {
  let mockPrisma: any;
  let merchantService: MerchantService;
  let customerService: CustomerService;

  const mockStore = {
    id: 'store-1',
    ownerId: 'owner-1',
    name: 'Artisan Coffee',
    slug: 'artisan-coffee',
    primaryColor: '#D97706',
    currency: 'TND',
    pointsPerTnd: 10,
    welcomePoints: 20,
    selfServiceEnabled: true,
    logoUrl: null,
    active: true,
    createdAt: new Date('2026-11-01T10:00:00Z'),
  };

  beforeEach(() => {
    mockPrisma = {
      store: {
        findFirst: vi.fn().mockResolvedValue(mockStore),
        findUnique: vi.fn().mockResolvedValue(mockStore),
        findMany: vi.fn().mockResolvedValue([mockStore]),
      },
      menuItem: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      serviceOrder: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      customerMembership: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'customer-1', referredByStoreId: null }),
      },
    };

    merchantService = new MerchantService(mockPrisma);
    customerService = new CustomerService(mockPrisma);
  });

  describe('Merchant Menu CRUD', () => {
    it('creates a store menu item with price and category', async () => {
      const now = new Date('2026-11-09T12:00:00Z');
      mockPrisma.menuItem.create.mockResolvedValueOnce({
        id: 'menu-1',
        storeId: 'store-1',
        name: 'Iced Spanish Latte',
        description: 'Rich espresso with sweetened condensed milk over ice',
        category: 'Iced Coffee',
        price: 7.5,
        imageUrl: null,
        available: true,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      });

      const item = await merchantService.createStoreMenuItem('store-1', 'owner-1', {
        name: 'Iced Spanish Latte',
        description: 'Rich espresso with sweetened condensed milk over ice',
        category: 'Iced Coffee',
        price: 7.5,
      });

      expect(item.name).toBe('Iced Spanish Latte');
      expect(item.price).toBe(7.5);
      expect(item.category).toBe('Iced Coffee');
      expect(item.available).toBe(true);
    });

    it('rejects creating menu item if store does not belong to merchant', async () => {
      mockPrisma.store.findFirst.mockResolvedValueOnce(null);

      await expect(
        merchantService.createStoreMenuItem('store-1', 'wrong-owner', {
          name: 'Espresso',
          price: 3.5,
        })
      ).rejects.toThrow(/Store not found or unauthorized/);
    });

    it('updates a menu item availability and price', async () => {
      const now = new Date();
      mockPrisma.menuItem.findFirst.mockResolvedValueOnce({
        id: 'menu-1',
        storeId: 'store-1',
      });
      mockPrisma.menuItem.update.mockResolvedValueOnce({
        id: 'menu-1',
        storeId: 'store-1',
        name: 'Iced Spanish Latte',
        description: null,
        category: 'Iced Coffee',
        price: 8.0,
        imageUrl: null,
        available: false,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      });

      const updated = await merchantService.updateStoreMenuItem('store-1', 'owner-1', 'menu-1', {
        price: 8.0,
        available: false,
      });

      expect(updated.price).toBe(8.0);
      expect(updated.available).toBe(false);
    });
  });

  describe('Customer Public Store Menu & Active Orders', () => {
    it('returns store public profile with active menuItems and currency', async () => {
      mockPrisma.store.findFirst.mockResolvedValueOnce({
        ...mockStore,
        rewards: [
          { id: 'r-1', name: 'Free Espresso', description: null, pointsCost: 50, active: true },
        ],
        menuItems: [
          {
            id: 'm-1',
            name: 'Cappuccino',
            description: 'Double shot with steamed silky foam',
            category: 'Hot Coffee',
            price: 5.5,
            imageUrl: null,
            available: true,
          },
        ],
      });

      const publicStore = await customerService.getStoreBySlug('artisan-coffee');
      expect(publicStore.currency).toBe('TND');
      expect(publicStore.menuItems).toHaveLength(1);
      expect(publicStore.menuItems[0]?.name).toBe('Cappuccino');
      expect(publicStore.menuItems[0]?.price).toBe(5.5);
    });

    it('acknowledges a READY order and transitions it to COMPLETED', async () => {
      mockPrisma.serviceOrder.findFirst.mockResolvedValueOnce({
        id: 'order-104',
        storeId: 'store-1',
        status: 'READY',
      });

      const now = new Date();
      mockPrisma.serviceOrder.update.mockResolvedValueOnce({
        id: 'order-104',
        status: 'COMPLETED',
        completedAt: now,
      });

      const ack = await customerService.acknowledgeOrder('customer-1', 'order-104');
      expect(ack.status).toBe('COMPLETED');
      expect(ack.completedAt).toBeTruthy();
    });
  });
});
