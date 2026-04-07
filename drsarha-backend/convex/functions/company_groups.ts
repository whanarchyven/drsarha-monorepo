import {
  httpAction,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { v } from "convex/values";
import { companyGroupDoc, companyGroupFields } from "../models/companyGroup";
import { internal } from "../_generated/api";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function cleanup(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

const publicCompanyInGroupValidator = v.object({
  title: v.string(),
  slug: v.string(),
});

const publicGroupInfoValidator = v.object({
  name: v.string(),
  slug: v.string(),
  logo: v.string(),
  companies: v.array(publicCompanyInGroupValidator),
});

async function verifyGroupPasswordDb(
  db: any,
  slug: string,
  password: string,
): Promise<boolean> {
  const trimmed = cleanup(slug);
  if (!trimmed || !password) {
    return false;
  }
  const one = await db
    .query("company_groups")
    .withIndex("by_slug", (q: any) => q.eq("slug", trimmed))
    .first();
  if (!one) {
    return false;
  }
  const stored = (one as { password?: string }).password;
  return typeof stored === "string" && stored.trim() === password.trim();
}

async function getPublicInfoByGroupSlugDb(db: any, slug: string) {
  const trimmed = cleanup(slug);
  if (!trimmed) {
    return null;
  }
  const group = await db
    .query("company_groups")
    .withIndex("by_slug", (q: any) => q.eq("slug", trimmed))
    .first();
  if (!group) {
    return null;
  }
  const companies = await db
    .query("companies")
    .withIndex("by_group", (q: any) => q.eq("group_id", group._id))
    .collect();
  const sorted = [...companies].sort(
    (
      a: { slug: string; group_sort_order?: number },
      b: { slug: string; group_sort_order?: number },
    ) => {
      const ao = a.group_sort_order ?? 1_000_000;
      const bo = b.group_sort_order ?? 1_000_000;
      if (ao !== bo) {
        return ao - bo;
      }
      return a.slug.localeCompare(b.slug, "ru");
    },
  );
  const companiesOut = sorted.map(
    (c: {
      slug: string;
      name: string;
      group_member_title?: string;
    }) => {
      const custom = cleanup(c.group_member_title);
      return {
        title: custom || c.name,
        slug: c.slug,
      };
    },
  );
  return {
    name: group.name,
    slug: group.slug,
    logo: group.logo,
    companies: companiesOut,
  };
}

export const list = query({
  args: {
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(companyGroupDoc),
    total: v.number(),
    page: v.number(),
    totalPages: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async ({ db }, { search, page = 1, limit = 30 }) => {
    let items = await db.query("company_groups").collect();
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(
        (g: { name: string; slug: string }) =>
          g.name.toLowerCase().includes(s) || g.slug.toLowerCase().includes(s),
      );
    }
    items.sort((a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name, "ru"),
    );
    const total = items.length;
    const from = (page - 1) * limit;
    const paged = items.slice(from, from + limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      items: paged as any,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  },
});

export const getById = query({
  args: { id: v.id("company_groups") },
  returns: v.union(companyGroupDoc, v.null()),
  handler: async ({ db }, { id }) => {
    return (await db.get(id)) as any;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(companyGroupDoc, v.null()),
  handler: async ({ db }, { slug }) => {
    const trimmed = cleanup(slug);
    if (!trimmed) {
      return null;
    }
    return (await db
      .query("company_groups")
      .withIndex("by_slug", (q: any) => q.eq("slug", trimmed))
      .first()) as any;
  },
});

/** Публично: проверка пароля группы по slug (для клиента Convex). */
export const verifyGroupPassword = query({
  args: {
    slug: v.string(),
    password: v.string(),
  },
  returns: v.boolean(),
  handler: async ({ db }, { slug, password }) => {
    return verifyGroupPasswordDb(db, slug, password);
  },
});

/** Публично: метаданные группы без пароля + компании { title, slug }. */
export const getPublicInfoByGroupSlug = query({
  args: { slug: v.string() },
  returns: v.union(publicGroupInfoValidator, v.null()),
  handler: async ({ db }, { slug }) => {
    return await getPublicInfoByGroupSlugDb(db, slug);
  },
});

export const getPublicInfoByGroupSlugInternal = internalQuery({
  args: { slug: v.string() },
  returns: v.union(publicGroupInfoValidator, v.null()),
  handler: async ({ db }, { slug }) => {
    return await getPublicInfoByGroupSlugDb(db, slug);
  },
});

/** Компании группы (для админки), по возрастанию group_sort_order. */
export const listCompaniesInGroup = query({
  args: { group_id: v.id("company_groups") },
  returns: v.array(
    v.object({
      _id: v.id("companies"),
      slug: v.string(),
      name: v.string(),
      group_sort_order: v.optional(v.number()),
      member_title: v.optional(v.string()),
    }),
  ),
  handler: async ({ db }, { group_id }) => {
    const rows = await db
      .query("companies")
      .withIndex("by_group", (q: any) => q.eq("group_id", group_id))
      .collect();
    const sorted = [...rows].sort(
      (
        a: { group_sort_order?: number; slug: string },
        b: { group_sort_order?: number; slug: string },
      ) => {
        const ao = a.group_sort_order ?? 1_000_000;
        const bo = b.group_sort_order ?? 1_000_000;
        if (ao !== bo) {
          return ao - bo;
        }
        return a.slug.localeCompare(b.slug, "ru");
      },
    );
    return sorted.map(
      (c: {
        _id: any;
        slug: string;
        name: string;
        group_sort_order?: number;
        group_member_title?: string;
      }) => ({
        _id: c._id,
        slug: c.slug,
        name: c.name,
        group_sort_order: c.group_sort_order,
        member_title: c.group_member_title,
      }),
    );
  },
});

export const insert = mutation({
  args: v.object(companyGroupFields),
  returns: companyGroupDoc,
  handler: async ({ db }, data) => {
    const slug = cleanup(data.slug);
    const name = cleanup(data.name);
    if (!slug || !name) {
      throw new Error("name и slug обязательны");
    }
    const existing = await db
      .query("company_groups")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    if (existing) {
      throw new Error(`Группа со slug «${slug}» уже существует`);
    }
    const now = new Date().toISOString();
    const id = await db.insert("company_groups", {
      name,
      slug,
      logo: cleanup(data.logo) || "",
      password: typeof data.password === "string" ? data.password : "",
      created_at: data.created_at ?? now,
      updated_at: data.updated_at ?? now,
    });
    return (await db.get(id))! as any;
  },
});

export const update = mutation({
  args: {
    id: v.id("company_groups"),
    data: v.object({
      name: v.optional(companyGroupFields.name),
      slug: v.optional(companyGroupFields.slug),
      logo: v.optional(companyGroupFields.logo),
      password: v.optional(companyGroupFields.password),
      created_at: v.optional(companyGroupFields.created_at),
      updated_at: v.optional(companyGroupFields.updated_at),
    }),
  },
  returns: companyGroupDoc,
  handler: async ({ db }, { id, data }) => {
    const current = await db.get(id);
    if (!current) {
      throw new Error("Группа не найдена");
    }
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) {
      patch.name = cleanup(data.name);
    }
    if (data.slug !== undefined) {
      const newSlug = cleanup(data.slug);
      if (!newSlug) {
        throw new Error("slug не может быть пустым");
      }
      if (newSlug !== (current as { slug: string }).slug) {
        const taken = await db
          .query("company_groups")
          .withIndex("by_slug", (q: any) => q.eq("slug", newSlug))
          .first();
        if (taken) {
          throw new Error(`Slug «${newSlug}» уже занят`);
        }
      }
      patch.slug = newSlug;
    }
    if (data.logo !== undefined) {
      patch.logo = cleanup(data.logo);
    }
    if (data.password !== undefined) {
      patch.password = data.password;
    }
    if (data.created_at !== undefined) {
      patch.created_at = data.created_at;
    }
    await db.patch(id, patch as any);
    return (await db.get(id))! as any;
  },
});

export const remove = mutation({
  args: { id: v.id("company_groups") },
  returns: v.boolean(),
  handler: async ({ db }, { id }) => {
    const linked = await db
      .query("companies")
      .withIndex("by_group", (q: any) => q.eq("group_id", id))
      .collect();
    for (const c of linked) {
      await db.patch(c._id, {
        group_id: undefined,
        group_sort_order: undefined,
        group_member_title: undefined,
      } as any);
    }
    await db.delete(id);
    return true;
  },
});

const groupMemberInput = v.object({
  company_id: v.id("companies"),
  /** Пустая строка / отсутствие — в API подставится name компании. */
  title: v.optional(v.string()),
});

/**
 * Состав и порядок группы + подписи участников (group_member_title).
 */
export const setGroupMembers = mutation({
  args: {
    group_id: v.id("company_groups"),
    members: v.array(groupMemberInput),
  },
  returns: v.null(),
  handler: async ({ db }, { group_id, members }) => {
    const group = await db.get(group_id);
    if (!group) {
      throw new Error("Группа не найдена");
    }
    const desired = new Set(members.map((m) => String(m.company_id)));

    const previously = await db
      .query("companies")
      .withIndex("by_group", (q: any) => q.eq("group_id", group_id))
      .collect();

    for (const c of previously) {
      if (!desired.has(String(c._id))) {
        await db.patch(c._id, {
          group_id: undefined,
          group_sort_order: undefined,
          group_member_title: undefined,
        } as any);
      }
    }

    for (let index = 0; index < members.length; index++) {
      const row = members[index];
      const titleRaw = cleanup(row.title);
      await db.patch(row.company_id, {
        group_id,
        group_sort_order: index,
        group_member_title: titleRaw === "" ? undefined : titleRaw,
      } as any);
    }

    return null;
  },
});

export const verifyGroupPasswordInternal = internalQuery({
  args: { slug: v.string(), password: v.string() },
  returns: v.boolean(),
  handler: async ({ db }, { slug, password }) => {
    return verifyGroupPasswordDb(db, slug, password);
  },
});

export const verifyGroupPasswordHttp = httpAction(async (ctx, req) => {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const slug = cleanup(body?.group_slug ?? body?.slug);
    const pwd = typeof body?.password === "string" ? body.password : "";
    if (!slug || pwd === "") {
      return json(
        {
          error:
            "В теле JSON укажите password и slug группы (или group_slug)",
        },
        400,
      );
    }
    const ok = await ctx.runQuery(
      internal.functions.company_groups.verifyGroupPasswordInternal,
      { slug, password: pwd },
    );
    return json(ok);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to verify group password";
    return json({ error: message }, 500);
  }
});

export const getCompanySlugsByGroupSlugHttp = httpAction(async (ctx, req) => {
  try {
    const url = new URL(req.url);
    const slug = cleanup(url.searchParams.get("group_slug"));
    if (!slug) {
      return json({ error: "group_slug query parameter is required" }, 400);
    }
    const info = await ctx.runQuery(
      internal.functions.company_groups.getPublicInfoByGroupSlugInternal,
      { slug },
    );
    if (!info) {
      return json({ error: "Группа не найдена" }, 404);
    }
    return json(info);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to load group company slugs";
    return json({ error: message }, 500);
  }
});
