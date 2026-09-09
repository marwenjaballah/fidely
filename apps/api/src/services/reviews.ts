import type { PrismaClient } from "@repo/database";
import type { CreateReviewBody } from "../schema/v1/reviews.schema.js";
import type { AbstractServiceOptions } from "../types/services.js";

function toApiReview(row: {
  id: string;
  name: string;
  company: string | null;
  title: string | null;
  message: string | null;
  rating: number;
  createdAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    title: row.title,
    message: row.message,
    rating: row.rating,
    createdAt: row.createdAt.toISOString(),
  };
}

export class ReviewsService {
  private prisma: PrismaClient;

  constructor(options: AbstractServiceOptions) {
    this.prisma = options.prisma;
  }

  async listReviews(limit: number) {
    const take = Math.min(Math.max(limit, 1), 50);

    const [items, aggregates] = await Promise.all([
      this.prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        take,
        select: {
          id: true,
          name: true,
          company: true,
          title: true,
          message: true,
          rating: true,
          createdAt: true,
        },
      }),
      this.prisma.review.aggregate({
        _count: { _all: true },
        _avg: { rating: true },
      }),
    ]);

    const total = aggregates._count._all;
    const averageRating = aggregates._avg.rating ?? 0;

    return {
      items: items.map(toApiReview),
      total,
      averageRating: Number(averageRating.toFixed(2)),
    };
  }

  async createReview(input: CreateReviewBody) {
    const row = await this.prisma.review.create({
      data: {
        name: input.name.trim(),
        company: input.company?.trim() ? input.company.trim() : null,
        rating: input.rating,
        title: input.title?.trim() ? input.title.trim() : null,
        message: input.message?.trim() ? input.message.trim() : null,
      },
      select: {
        id: true,
        name: true,
        company: true,
        title: true,
        message: true,
        rating: true,
        createdAt: true,
      },
    });

    return toApiReview(row);
  }
}
