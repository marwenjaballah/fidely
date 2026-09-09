import { ApiError } from "@/lib/api-client"

function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "")
}

export type Review = {
  id: string
  name: string
  company: string | null
  title: string | null
  message: string | null
  rating: number
  createdAt: string
}

export type ListReviewsResult = {
  items: Review[]
  total: number
  averageRating: number
}

function throwIfNotOk(res: Response, body: unknown): void {
  if (res.ok) return
  let message = res.statusText || "Request failed"
  if (body && typeof body === "object") {
    const err = (body as { error?: { message?: string } }).error
    if (typeof err?.message === "string") message = err.message
  }
  throw new ApiError(message, res.status, body)
}

export async function listReviews(params?: { limit?: number }): Promise<ListReviewsResult> {
  const limit = params?.limit ?? 12
  const url = new URL(`${apiBaseUrl()}/api/v1/reviews`)
  url.searchParams.set("limit", String(limit))

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  const body = await res.json().catch(() => null)
  throwIfNotOk(res, body)

  const data = (body as { data?: ListReviewsResult }).data
  if (!data || !Array.isArray(data.items)) {
    throw new ApiError("Invalid reviews response", res.status, body)
  }

  return data
}

export type CreateReviewPayload = {
  name: string
  company?: string
  rating: number
  title?: string
  message?: string
}

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const res = await fetch(`${apiBaseUrl()}/api/v1/reviews`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const body = await res.json().catch(() => null)
  throwIfNotOk(res, body)

  const data = (body as { data?: Review }).data
  if (!data?.id) {
    throw new ApiError("Invalid create review response", res.status, body)
  }

  return data
}
