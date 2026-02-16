import { defineTable } from "convex/server";
import { v } from "convex/values";

export const providerPaymentFields = v.object({
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
});

export const paymentFields = {
  amount: v.optional(v.object({ currency: v.string(), value: v.string() })),
  authorization_details: v.optional(
    v.object({
      auth_code: v.string(),
      rrn: v.string(),
      three_d_secure: v.object({
        applied: v.boolean(),
        authentication_value: v.optional(v.string()),
        challenge_completed: v.optional(v.boolean()),
        ds_transaction_id: v.optional(v.string()),
        eci: v.optional(v.string()),
        method_completed: v.optional(v.boolean()),
        protocol: v.optional(v.string()),
        three_d_secure_server_transaction_id: v.optional(v.string()),
        xid: v.optional(v.string()),
      }),
    })
  ),
  captured_at: v.optional(v.string()),
  confirmation: v.optional(v.object({ confirmation_url: v.string(), type: v.string() })),
  created_at: v.optional(v.string()),
  description: v.optional(v.string()),
  id: v.optional(v.string()),
  income_amount: v.optional(v.object({ currency: v.string(), value: v.string() })),
  metadata: v.optional(v.object({})),
  mongoId: v.optional(v.string()),
  paid: v.optional(v.boolean()),
  payment: v.optional(providerPaymentFields),
  payment_method: v.optional(
    v.object({
      account_number: v.optional(v.string()),
      card: v.optional(
        v.object({
          card_product: v.optional(v.object({ code: v.string(), name: v.string() })),
          card_type: v.string(),
          expiry_month: v.string(),
          expiry_year: v.string(),
          first6: v.string(),
          issuer_country: v.optional(v.string()),
          issuer_name: v.optional(v.string()),
          last4: v.string(),
        })
      ),
      id: v.string(),
      saved: v.boolean(),
      status: v.optional(v.string()),
      title: v.optional(v.string()),
      type: v.string(),
    })
  ),
  plan: v.optional(v.string()),
  recipient: v.optional(v.object({ account_id: v.string(), gateway_id: v.string() })),
  refundable: v.optional(v.boolean()),
  refunded_amount: v.optional(v.object({ currency: v.string(), value: v.string() })),
  status: v.optional(v.string()),
  tariff: v.optional(v.string()),
  test: v.optional(v.boolean()),
  user: v.optional(
    v.object({ email: v.string(), fullName: v.optional(v.string()), mongoId: v.string(), phone: v.string() })
  ),
  // Поля из миграции MongoDB
  event: v.optional(v.string()),
  object: v.optional(
    v.object({
      amount: v.object({ currency: v.string(), value: v.string() }),
      authorization_details: v.object({
        auth_code: v.string(),
        rrn: v.string(),
        three_d_secure: v.object({
          applied: v.boolean(),
          challenge_completed: v.boolean(),
          method_completed: v.boolean(),
          protocol: v.string(),
        }),
      }),
      captured_at: v.string(),
      created_at: v.string(),
      description: v.string(),
      id: v.string(),
      income_amount: v.object({ currency: v.string(), value: v.string() }),
      metadata: v.object({}),
      paid: v.boolean(),
      payment_method: v.object({
        card: v.object({
          card_product: v.object({ code: v.string(), name: v.string() }),
          card_type: v.string(),
          expiry_month: v.string(),
          expiry_year: v.string(),
          first6: v.string(),
          issuer_country: v.string(),
          issuer_name: v.string(),
          last4: v.string(),
        }),
        id: v.string(),
        saved: v.boolean(),
        status: v.string(),
        title: v.string(),
        type: v.string(),
      }),
      receipt_registration: v.string(),
      recipient: v.object({ account_id: v.string(), gateway_id: v.string() }),
      refundable: v.boolean(),
      refunded_amount: v.object({ currency: v.string(), value: v.string() }),
      status: v.string(),
      test: v.boolean(),
    })
  ),
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


