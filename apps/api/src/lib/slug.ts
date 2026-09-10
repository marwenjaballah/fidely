import type { PrismaClient } from '@repo/database';

/**
 * Normalizes any text into a URL-friendly slug.
 * Removes accents, special characters, and trims dashes.
 */
export function slugify(text: string): string {
  if (!text) return 'store';

  const normalized = text
    .toString()
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '') // trim leading and trailing hyphens
    .replace(/-{2,}/g, '-'); // replace multiple consecutive hyphens with a single hyphen

  return normalized || 'store';
}

/**
 * Generates a guaranteed unique slug for a store.
 * If base slug already exists for another store, automatically appends sequential suffixes:
 * e.g. "artisan-cafe", "artisan-cafe-1", "artisan-cafe-2", etc.
 */
export async function generateUniqueSlug(
  prisma: PrismaClient,
  candidateText: string,
  excludeStoreId?: string
): Promise<string> {
  const baseSlug = slugify(candidateText);

  // If the store is being updated and already owns this base slug, keep it
  if (excludeStoreId) {
    const currentStore = await prisma.store.findUnique({
      where: { id: excludeStoreId },
      select: { slug: true },
    });

    if (currentStore && currentStore.slug === baseSlug) {
      return baseSlug;
    }
  }

  // Find all existing stores that have a slug matching the base slug or starting with baseSlug-
  const existingStores = await prisma.store.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      ...(excludeStoreId
        ? {
            id: {
              not: excludeStoreId,
            },
          }
        : {}),
    },
    select: {
      slug: true,
    },
  });

  if (existingStores.length === 0) {
    return baseSlug;
  }

  const existingSlugSet = new Set(existingStores.map((s) => s.slug));

  // If exact baseSlug is free, use it
  if (!existingSlugSet.has(baseSlug)) {
    return baseSlug;
  }

  // Find highest numerical suffix (e.g. artisan-cafe-1, artisan-cafe-2)
  let highestSuffix = 0;
  const suffixRegex = new RegExp(`^${baseSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)$`);

  for (const item of existingStores) {
    const match = item.slug.match(suffixRegex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highestSuffix) {
        highestSuffix = num;
      }
    }
  }

  // Start checking from 1 or highestSuffix + 1
  let nextSuffix = highestSuffix + 1;
  while (existingSlugSet.has(`${baseSlug}-${nextSuffix}`)) {
    nextSuffix++;
  }

  return `${baseSlug}-${nextSuffix}`;
}
