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
            logoUrl: z.string().nullable().optional(),
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
            logoUrl: z.string().nullable().optional(),
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
            logoUrl: z.string().nullable().optional(),
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
            logoUrl: z.string().nullable().optional(),
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
            logoUrl: z.string().nullable().optional(),
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

export const getStoreRewardsRoute = createRoute({
  method: 'get',
  path: '/stores/{id}/rewards',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'List of store rewards',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              storeId: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              pointsCost: z.number(),
              active: z.boolean(),
              createdAt: z.date().or(z.string()),
            })
          ),
        },
      },
    },
  },
});

export const createStoreRewardRoute = createRoute({
  method: 'post',
  path: '/stores/{id}/rewards',
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
            name: z.string().min(1),
            description: z.string().optional(),
            pointsCost: z.number().positive(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Reward created',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            storeId: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            pointsCost: z.number(),
            active: z.boolean(),
          }),
        },
      },
    },
    400: { description: 'Bad request' },
  },
});

export const updateStoreRewardRoute = createRoute({
  method: 'put',
  path: '/stores/{id}/rewards/{rewardId}',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
      rewardId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            pointsCost: z.number().positive().optional(),
            active: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Reward updated',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            storeId: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            pointsCost: z.number(),
            active: z.boolean(),
          }),
        },
      },
    },
    400: { description: 'Bad request' },
  },
});

export const deleteStoreRewardRoute = createRoute({
  method: 'delete',
  path: '/stores/{id}/rewards/{rewardId}',
  tags: ['Merchant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
      rewardId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Reward deleted successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    400: { description: 'Bad request or reward not found' },
  },
});
