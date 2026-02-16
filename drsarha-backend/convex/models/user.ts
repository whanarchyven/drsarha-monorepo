import { v } from "convex/values";
import { defineTable } from "convex/server";

export const userPaymentEntry = v.object({
  _id: v.optional(v.string()),
  mongoId: v.optional(v.string()),
  payment: v.object({
    amount: v.object({ currency: v.string(), value: v.string() }),
    confirmation: v.object({ confirmation_url: v.string(), type: v.string() }),
    created_at: v.string(),
    description: v.string(),
    id: v.string(),
    metadata: v.object({}),
    paid: v.boolean(),
    recipient: v.object({ account_id: v.string(), gateway_id: v.string() }),
    refundable: v.boolean(),
    status: v.string(),
    test: v.boolean(),
  }),
  plan: v.string(),
  status: v.string(),
  tariff: v.string(),
  user: v.object({ _id: v.optional(v.string()), email: v.optional(v.string()), fullName: v.optional(v.string()), phone: v.optional(v.string()), mongoId: v.optional(v.string()) }),
});

export const userFields = {
  address_pool: v.optional(v.array(v.string())),
  avatar: v.optional(v.union(v.null(), v.string())),
  bio: v.optional(v.string()),
  birthDate: v.optional(v.string()),
  city: v.optional(v.string()),
  diploma: v.optional(v.string()),
  educationPassed: v.optional(v.boolean()),
  email: v.string(),
  exp: v.optional(v.float64()),
  fullName: v.optional(v.string()),
  gender: v.optional(v.string()),
  isApproved: v.boolean(),
  isPediatric: v.optional(v.boolean()),
  isScientific: v.optional(v.boolean()),
  is_banned: v.optional(v.boolean()),
  level: v.optional(v.float64()),
  lootboxes: v.optional(
    v.array(
      v.object({
        lootboxId: v.string(),
        obtainedAt: v.string(),
      })
    )
  ),
  mongoId: v.optional(v.string()),
  name: v.optional(v.string()),
  password: v.string(),
  payments: v.optional(v.array(userPaymentEntry)),
  phone: v.string(),
  plan: v.optional(v.string()),
  position: v.optional(v.string()),
  privateClinic: v.optional(v.boolean()),
  referalCount: v.optional(v.float64()),
  refererId: v.optional(v.string()),
  resetCode: v.optional(v.string()),
  resetCodeExpires: v.optional(v.string()),
  // Поля из миграции MongoDB
  created_at: v.optional(v.string()),
  isCorrect: v.optional(v.boolean()),
  metadata: v.optional(
    v.object({
      description: v.string(),
      image: v.string(),
      title: v.string(),
    })
  ),
  pinId: v.optional(v.string()),
  userId: v.optional(v.string()),
  saved: v.optional(
    v.array(
      v.object({
        articleUrl: v.string(),
        category: v.optional(v.string()),
        publishedDate: v.string(),
        title_translation_human: v.string(),
      })
    )
  ),
  specialization: v.optional(v.string()),
  stars: v.optional(v.float64()),
  subscribeTill: v.string(),
  tariff: v.string(),
  telegram: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
  viewed: v.optional(
    v.array(
      v.object({
        articleUrl: v.string(),
        publishedDate: v.string(),
        title_translation_human: v.string(),
      })
    )
  ),
  workplace: v.optional(v.string()),
  trackingPermission: v.optional(v.boolean()),
};

export const usersTable = defineTable(userFields)
  .index("by_mongo_id", ["mongoId"]) 
  .index("by_email", ["email"]) 
  .index("by_isApproved", ["isApproved"]) 
  .index("by_tariff", ["tariff"]);

export const userDoc = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  ...userFields,
});


