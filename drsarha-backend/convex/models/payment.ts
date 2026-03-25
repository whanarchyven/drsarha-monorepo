import { defineTable } from "convex/server";
import { v } from "convex/values";

export const providerPaymentFields = v.object({
  amount: v.optional(
    v.object({
      currency: v.optional(v.string()),
      value: v.optional(v.string()),
    })
  ),
  confirmation: v.optional(
    v.object({
      confirmation_url: v.optional(v.string()),
      type: v.optional(v.string()),
    })
  ),
  created_at: v.optional(v.string()),
  description: v.optional(v.string()),
  id: v.optional(v.string()),
  metadata: v.optional(v.any()),
  payment_amount: v.optional(v.number()),
  paid: v.optional(v.boolean()),
  recipient: v.optional(
    v.object({
      account_id: v.optional(v.string()),
      gateway_id: v.optional(v.string()),
    })
  ),
  refundable: v.optional(v.boolean()),
  status: v.optional(v.string()),
  test: v.optional(v.boolean()),
});

export const paymentFields = {
  amount: v.optional(
    v.object({
      currency: v.optional(v.string()),
      value: v.optional(v.string()),
    })
  ),
  authorization_details: v.optional(
    v.object({
      auth_code: v.optional(v.string()),
      rrn: v.optional(v.string()),
      three_d_secure: v.optional(
        v.object({
          applied: v.optional(v.boolean()),
          authentication_value: v.optional(v.string()),
          challenge_completed: v.optional(v.boolean()),
          ds_transaction_id: v.optional(v.string()),
          eci: v.optional(v.string()),
          method_completed: v.optional(v.boolean()),
          protocol: v.optional(v.string()),
          three_d_secure_server_transaction_id: v.optional(v.string()),
          xid: v.optional(v.string()),
        })
      ),
    })
  ),
  captured_at: v.optional(v.string()),
  confirmation: v.optional(
    v.object({
      confirmation_url: v.optional(v.string()),
      type: v.optional(v.string()),
    })
  ),
  created_at: v.optional(v.string()),
  description: v.optional(v.string()),
  id: v.optional(v.string()),
  income_amount: v.optional(
    v.object({
      currency: v.optional(v.string()),
      value: v.optional(v.string()),
    })
  ),
  metadata: v.optional(v.any()),
  mongoId: v.optional(v.string()),
  payment_amount: v.optional(v.number()),
  paid: v.optional(v.boolean()),
  payment: v.optional(v.any()),
  payment_method: v.optional(
    v.object({
      account_number: v.optional(v.string()),
      card: v.optional(
        v.object({
          card_product: v.optional(
            v.object({
              code: v.optional(v.string()),
              name: v.optional(v.string()),
            })
          ),
          card_type: v.optional(v.string()),
          expiry_month: v.optional(v.string()),
          expiry_year: v.optional(v.string()),
          first6: v.optional(v.string()),
          issuer_country: v.optional(v.string()),
          issuer_name: v.optional(v.string()),
          last4: v.optional(v.string()),
        })
      ),
      id: v.optional(v.string()),
      saved: v.optional(v.boolean()),
      status: v.optional(v.string()),
      title: v.optional(v.string()),
      type: v.optional(v.string()),
    })
  ),
  plan: v.optional(v.string()),
  recipient: v.optional(
    v.object({
      account_id: v.optional(v.string()),
      gateway_id: v.optional(v.string()),
    })
  ),
  refundable: v.optional(v.boolean()),
  refunded_amount: v.optional(
    v.object({
      currency: v.optional(v.string()),
      value: v.optional(v.string()),
    })
  ),
  status: v.optional(v.string()),
  tariff: v.optional(v.string()),
  test: v.optional(v.boolean()),
  user: v.optional(
    v.object({
      email: v.optional(v.string()),
      fullName: v.optional(v.string()),
      mongoId: v.optional(v.string()),
      phone: v.optional(v.string()),
    })
  ),
  // Поля из миграции MongoDB
  event: v.optional(v.string()),
  object: v.optional(v.any()),
  type: v.optional(v.string()),
};

export const paymentsTable = defineTable(paymentFields)
  .index("by_mongo_id", ["mongoId"])
  .index("by_payment_id", ["id"]);

export const paymentDoc = v.object({
  _id: v.id("payments"),
  _creationTime: v.number(),
  ...paymentFields,
});


