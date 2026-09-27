import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { slugify } from "./slug";
import { excerpt } from "./markdown";
import type { BlogPostDoc } from "./types";

export const PAGE_SIZE = 9;

// Real routes under /weblog/*: a post using one of these slugs would be unreachable
// (the static route always wins), so both are rejected in createPost/updatePost.
const RESERVED_SLUGS = new Set(["new", "tag"]);

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug);
}

export class InvalidSlugError extends Error {}
export class SlugTakenError extends Error {}

function isDuplicateKeyError(err: unknown): boolean {
  return !!err && typeof err === "object" && "code" in err && (err as { code?: number }).code === 11000;
}

const globalForBlogIdx = globalThis as unknown as { _blogIdx?: Promise<unknown> };

async function postsCollection() {
  const db = await getDb();
  const col = db.collection<BlogPostDoc>("blog_posts");
  globalForBlogIdx._blogIdx ??= Promise.all([
    col.createIndex({ slug: 1 }, { unique: true }),
    col.createIndex({ published: 1, createdAt: -1 }),
    col.createIndex({ tagSlugs: 1, published: 1, createdAt: -1 }),
  ]).catch(() => undefined);
  await globalForBlogIdx._blogIdx;
  return col;
}

function normalizeTags(input: string[]): { tags: string[]; tagSlugs: string[] } {
  const seen = new Set<string>();
  const tags: string[] = [];
  const tagSlugs: string[] = [];
  for (const raw of input) {
    const tag = raw.trim().slice(0, 40);
    const tagSlug = slugify(tag);
    if (!tag || !tagSlug || seen.has(tagSlug)) continue;
    seen.add(tagSlug);
    tags.push(tag);
    tagSlugs.push(tagSlug);
    if (tags.length >= 10) break;
  }
  return { tags, tagSlugs };
}

export interface PostInput {
  title: string;
  slug?: string;
  bannerUrl: string;
  description: string;
  footer: string | null;
  tags: string[];
  metaDescription: string | null;
  authorName: string;
  published: boolean;
}

function toDoc(input: PostInput) {
  const { tags, tagSlugs } = normalizeTags(input.tags);
  const description = input.description.slice(0, 20_000);
  // Never leave the SEO description blank: fall back to an auto-generated excerpt,
  // so listing cards and search snippets always have real content to show.
  const metaDescription = input.metaDescription?.trim()
    ? input.metaDescription.trim().slice(0, 300)
    : excerpt(description);

  return {
    title: input.title.trim().slice(0, 200),
    bannerUrl: input.bannerUrl,
    description,
    footer: input.footer?.trim() ? input.footer.trim().slice(0, 4_000) : null,
    tags,
    tagSlugs,
    metaDescription,
    authorName: input.authorName.trim().slice(0, 80) || "Amxinz",
    published: input.published,
  };
}

export async function createPost(input: PostInput): Promise<BlogPostDoc> {
  const slug = slugify(input.slug || input.title);
  if (!slug) throw new InvalidSlugError("Could not build a URL slug from the title.");
  if (isReservedSlug(slug)) throw new InvalidSlugError(`"${slug}" is a reserved URL and can't be used as a slug.`);

  const col = await postsCollection();
  const now = new Date();
  const doc: BlogPostDoc = { _id: new ObjectId(), slug, ...toDoc(input), createdAt: now, updatedAt: now };

  try {
    await col.insertOne(doc);
    return doc;
  } catch (err) {
    if (isDuplicateKeyError(err)) throw new SlugTakenError(`The URL "/weblog/${slug}" is already used by another post.`);
    throw err;
  }
}

export async function updatePost(id: string, input: PostInput): Promise<BlogPostDoc | null> {
  if (!ObjectId.isValid(id)) return null;

  const slug = slugify(input.slug || input.title);
  if (!slug) throw new InvalidSlugError("Could not build a URL slug from the title.");
  if (isReservedSlug(slug)) throw new InvalidSlugError(`"${slug}" is a reserved URL and can't be used as a slug.`);

  const col = await postsCollection();
  try {
    return await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { slug, ...toDoc(input), updatedAt: new Date() } },
      { returnDocument: "after" },
    );
  } catch (err) {
    if (isDuplicateKeyError(err)) throw new SlugTakenError(`The URL "/weblog/${slug}" is already used by another post.`);
    throw err;
  }
}

export async function deletePost(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await postsCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function getPostBySlug(
  slug: string,
  { includeUnpublished = false }: { includeUnpublished?: boolean } = {},
): Promise<BlogPostDoc | null> {
  const col = await postsCollection();
  const query: Record<string, unknown> = { slug };
  if (!includeUnpublished) query.published = true;
  return col.findOne(query);
}

export async function getPostById(id: string): Promise<BlogPostDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await postsCollection();
  return col.findOne({ _id: new ObjectId(id) });
}

interface PostListResult {
  posts: Omit<BlogPostDoc, "description">[];
  total: number;
  pages: number;
  page: number;
}

async function listPublished(query: Record<string, unknown>, page: number): Promise<PostListResult> {
  const col = await postsCollection();
  const total = await col.countDocuments(query);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);

  const posts = await col
    .find(query, { projection: { description: 0 } }) // listing cards use metaDescription, not the full body
    .sort({ createdAt: -1 })
    .skip((current - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();

  return { posts, total, pages, page: current };
}

export function listPosts(page = 1): Promise<PostListResult> {
  return listPublished({ published: true }, page);
}

export function listPostsByTag(tagSlug: string, page = 1): Promise<PostListResult> {
  return listPublished({ published: true, tagSlugs: tagSlug }, page);
}

export interface TagCount {
  tag: string;
  slug: string;
  count: number;
}

/** Every tag currently in use on a published post, for the tag cloud / archive index. */
export async function listAllTags(): Promise<TagCount[]> {
  const col = await postsCollection();
  const rows = await col
    .aggregate<{ _id: string; tag: string; count: number }>([
      { $match: { published: true } },
      { $unwind: { path: "$tags", includeArrayIndex: "i" } },
      { $addFields: { tagSlug: { $arrayElemAt: ["$tagSlugs", "$i"] } } },
      { $group: { _id: "$tagSlug", tag: { $first: "$tags" }, count: { $sum: 1 } } },
      { $sort: { count: -1, tag: 1 } },
    ])
    .toArray();
  return rows.map((r) => ({ tag: r.tag, slug: r._id, count: r.count }));
}

/** Published posts' slugs and freshest dates, for the sitemap. Never throws (the caller still falls back). */
export async function listPostsForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
  const col = await postsCollection();
  return col
    .find({ published: true }, { projection: { slug: 1, updatedAt: 1 } })
    .sort({ createdAt: -1 })
    .toArray();
}
