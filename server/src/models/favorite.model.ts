import mongoose, { Schema, type InferSchemaType } from "mongoose";

const favoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true
    }
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export type Favorite = InferSchemaType<typeof favoriteSchema>;
export const FavoriteModel = mongoose.model("Favorite", favoriteSchema);

