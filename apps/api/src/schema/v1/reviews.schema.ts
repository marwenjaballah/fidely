import { createRoute, z } from "@hono/zod-openapi";

const reviewResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  company: z.string().nullable(),
  title: z.string().nullable(),
  message: z.string().nullable(),
  rating: z.number().int().min(1).max(5),
  createdAt: z.string().datetime(),
});

const reviewErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
});

export const listReviewsSchema = createRoute({
  method: "get",
  path: "/",
  tags: ["Reviews"],
  summary: "List public reviews",
  description:
    "Returns recent landing-page reviews with total count and average rating for the reviews section.",
  request: {
    query: z.object({
      limit: z.coerce.number().int().min(1).max(50).optional().default(12),
    }),
  },
  responses: {
    200: {
      description: "Reviews list",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              items: z.array(reviewResponseSchema),
              total: z.number().int().min(0),
              averageRating: z.number().min(0).max(5),
            }),
          }),
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: reviewErrorSchema,
        },
      },
    },
  },
});

/** POST /api/v1/reviews JSON body (same shape passed to ReviewsService after route validation). */
export const createReviewBodySchema = z.object({
  name: z.string().min(2).max(120),
  company: z.string().min(1).max(120).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(120).optional(),
  message: z.string().min(1).max(2000).optional(),
});

export type CreateReviewBody = z.infer<typeof createReviewBodySchema>;

export const createReviewSchema = createRoute({
  method: "post",
  path: "/",
  tags: ["Reviews"],
  summary: "Submit a public review",
  description: "Creates a review shown on the marketing landing page.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createReviewBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Review created",
      content: {
        "application/json": {
          schema: z.object({
            data: reviewResponseSchema,
          }),
        },
      },
    },
    400: {
      description: "Validation or business error",
      content: {
        "application/json": {
          schema: reviewErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: reviewErrorSchema,
        },
      },
    },
  },
});
