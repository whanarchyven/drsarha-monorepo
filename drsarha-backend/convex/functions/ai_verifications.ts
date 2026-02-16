import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { aiVerificationDoc, aiVerificationFields } from "../models/aiVerification";
import { api } from "../_generated/api";

export const getAiVerification = query({
  args: {},
  returns: v.object({
    images: v.array(v.object({ _id: v.string(), image: v.string() })),
    title: v.string(),
    description: v.string(),
  }),
  handler: async ({ db }) => {
    // Get all pins
    const allPins = await (db as any).query("pins").collect();
    
    if (allPins.length === 0) {
      return { images: [], title: '', description: '' };
    }
    
    // Select 4 random pins
    const shuffled = allPins.sort(() => 0.5 - Math.random());
    const pins = shuffled.slice(0, Math.min(4, shuffled.length));
    
    // Select one random pin for title/description
    const idx = Math.floor(Math.random() * pins.length);
    const chosen = pins[idx];
    
    const images = pins.map((p: any) => ({ 
      _id: String(p._id), 
      image: p.image || '' 
    }));
    
    return {
      images,
      title: chosen.title || '',
      description: chosen.description || ''
    };
  },
});

export const createAiVerificationResponse = mutation({
  args: {
    userId: v.union(v.id("users"), v.string()),
    pinId: v.union(v.id("pins"), v.string()),
    userAnswer: v.object({
      title: v.string(),
      description: v.string(),
    }),
  },
  returns: v.object({
    _id: v.id("ai_verifications"),
    isCorrect: v.boolean(),
  }),
  handler: async ({ db }, { userId, pinId, userAnswer }) => {
    // Get pin
    const pin = await db.get(pinId as any);
    if (!pin) {
      throw new Error('Pin not found');
    }
    
    const isCorrect = (pin as any).title === userAnswer.title && 
                     (pin as any).description === userAnswer.description;
    
    const now = new Date().toISOString();
    const id = await db.insert("ai_verifications", {
      userId: userId as any,
      pinId: pinId as any,
      isCorrect,
      metadata: {
        image: (pin as any).image || '',
        title: userAnswer.title,
        description: userAnswer.description,
      },
      created_at: now,
    } as any);
    
    return { _id: id, isCorrect };
  },
});


