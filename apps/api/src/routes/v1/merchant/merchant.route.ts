import { createRoute, z } from '@hono/zod-openapi';

export const getStoresRoute = createRoute({
  method: 'get',
  path: '/stores',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of stores owned by merchant',
      content: {
        'application/json': {
          schema: z.array(z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            primaryColor: z.string(),
            pointsPerTnd: z.number(),
          })),
        },
      },
    },
  },
});

export const createStoreRoute = createRoute({
  method: 'post',
  path: '/stores',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            slug: z.string(),
            primaryColor: z.string().optional().default('#000000'),
            pointsPerTnd: z.number().positive().optional().default(10),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Store created',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            primaryColor: z.string(),
            pointsPerTnd: z.number(),
          }),
        },
      },
    },
    400: {
      description: 'Bad request or slug already exists',
    },
  },
});

export const updateStoreRoute = createRoute({
  method: 'put',
  path: '/stores/{id}',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional(),
            primaryColor: z.string().optional(),
            pointsPerTnd: z.number().positive().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Store updated',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            name: z.string(),
            primaryColor: z.string(),
            pointsPerTnd: z.number(),
          }),
        },
      },
    },
  },
});

export const getStoreCustomersRoute = createRoute({
  method: 'get',
  path: '/stores/{id}/customers',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'List of customers for the store',
      content: {
        'application/json': {
          schema: z.array(z.object({
            customerId: z.string(),
            fullName: z.string().nullable(),
            email: z.string(),
            pointsBalance: z.number(),
            joinedAt: z.string(),
          })),
        },
      },
    },
  },
});

export const getStoreStaffRoute = createRoute({
  method: 'get',
  path: '/stores/{id}/staff',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'List of cashiers for the store',
      content: {
        'application/json': {
          schema: z.array(z.object({
            id: z.string(),
            fullName: z.string().nullable(),
            email: z.string(),
            createdAt: z.string(),
          })),
        },
      },
    },
  },
});

export const createStoreStaffRoute = createRoute({
  method: 'post',
  path: '/stores/{id}/staff',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            fullName: z.string().min(1),
            email: z.string().email(),
            password: z.string().min(6).optional(),
            phone: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Cashier created',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            fullName: z.string().nullable(),
            email: z.string(),
            phone: z.string().nullable().optional(),
            createdAt: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Bad request or email already exists',
    },
  },
});

export const updateStoreStaffRoute = createRoute({
  method: 'put',
  path: '/stores/{id}/staff/{staffId}',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
      staffId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            fullName: z.string().min(1).optional(),
            phone: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Cashier updated',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            fullName: z.string().nullable(),
            email: z.string(),
            phone: z.string().nullable().optional(),
            createdAt: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Bad request or cashier not found',
    },
  },
});

export const changeStoreStaffPasswordRoute = createRoute({
  method: 'put',
  path: '/stores/{id}/staff/{staffId}/password',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
      staffId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            password: z.string().min(6, 'Password must be at least 6 characters'),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password changed successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Bad request or error updating password',
    },
  },
});

export const deleteStoreStaffRoute = createRoute({
  method: 'delete',
  path: '/stores/{id}/staff/{staffId}',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
      staffId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Cashier removed successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Bad request or cashier not found',
    },
  },
});

export const getStoreAnalyticsRoute = createRoute({
  method: 'get',
  path: '/stores/{id}/analytics',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Store analytics',
      content: {
        'application/json': {
          schema: z.object({
            totalMembers: z.number(),
            totalPointsIssued: z.number(),
            totalPointsRedeemed: z.number(),
            recentTransactions: z.array(z.object({
              date: z.string(),
              issued: z.number(),
              redeemed: z.number(),
            })),
          }),
        },
      },
    },
  },
});
