import { OpenAPIHono } from "@hono/zod-openapi";
import type { AutoLoadRoute } from "hono-autoload/types";
import type { Env } from "../../../types/index.js";
import {
  createReviewSchema,
  listReviewsSchema,
  type CreateReviewBody,
} from "../../../schema/v1/reviews.schema.js";
import { ReviewsService } from "../../../services/reviews.js";
import { logger } from "../../../utils/logger.js";

const handler = new OpenAPIHono<Env>();

handler.openapi(listReviewsSchema, async (c) => {
  const prisma = c.get("prisma");
  const { limit } = c.req.valid("query");
  const service = new ReviewsService({ prisma });

  try {
    const data = await service.listReviews(limit);
    return c.json({ data }, 200);
  } catch (error) {
    logger.error({ error, scope: "reviews.list" }, "Failed to list reviews");
    return c.json(
      {
        error: {
          message: "Could not load reviews",
          code: "REVIEWS_LIST_FAILED",
        },
      },
      500
    );
  }
});

handler.openapi(createReviewSchema, async (c) => {
  const prisma = c.get("prisma");
  const body = c.req.valid("json") as CreateReviewBody;
  const service = new ReviewsService({ prisma });

  try {
    const created = await service.createReview(body);
    return c.json({ data: created }, 201);
  } catch (error) {
    logger.error({ error, scope: "reviews.create" }, "Failed to create review");
    return c.json(
      {
        error: {
          message: "Could not save review",
          code: "REVIEWS_CREATE_FAILED",
        },
      },
      500
    );
  }
});

const routeModule: AutoLoadRoute = {
  path: "/api/v1/reviews",
  handler: handler as unknown as AutoLoadRoute["handler"],
};

export default routeModule;
