import mongoose, { Schema, type InferSchemaType } from "mongoose";

const historySchema = new Schema(
  {
    date: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const propertySchema = new Schema(
  {
    // Keep `location` as a string for beginner simplicity (could be a normalized collection).
    location: { type: String, required: true, trim: true, index: true },
    area: { type: Number, required: true, min: 1 }, // sqft
    bedrooms: { type: Number, required: true, min: 0 }, // BHK
    bathrooms: { type: Number, required: true, min: 0 },

    // Current/listing price in INR (so charts/predictions are consistent).
    price: { type: Number, required: true, min: 0 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    address: { type: String, required: false, trim: true, maxlength: 200 },
    imageUrl: { type: String, required: false, trim: true },
    description: { type: String, required: false, trim: true, maxlength: 2000 },

    history: { type: [historySchema], default: [] }
  },
  { timestamps: true }
);

propertySchema.index({ location: 1, bedrooms: 1 });
propertySchema.index({ location: 1, price: -1 });
propertySchema.index({ area: 1, bedrooms: 1, bathrooms: 1 });

export type Property = InferSchemaType<typeof propertySchema>;
export const PropertyModel = mongoose.model("Property", propertySchema);

