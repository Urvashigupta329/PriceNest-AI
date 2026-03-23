import { Types } from "mongoose";
import { FavoriteModel } from "../models/favorite.model";
import { ApiError } from "../utils/apiErrors";

export async function listFavorites(userId: string) {
  if (!Types.ObjectId.isValid(userId)) throw new ApiError(400, "Invalid user");
  const favorites = await FavoriteModel.find({ userId })
    .populate("propertyId")
    .lean();
  return favorites.map((f: any) => f.propertyId);
}

export async function addFavorite(userId: string, propertyId: string) {
  if (!Types.ObjectId.isValid(userId)) throw new ApiError(400, "Invalid user");
  if (!Types.ObjectId.isValid(propertyId))
    throw new ApiError(400, "Invalid property id");

  const created = await FavoriteModel.create({ userId, propertyId });
  return { favoriteId: created._id.toString() };
}

export async function removeFavorite(userId: string, propertyId: string) {
  if (!Types.ObjectId.isValid(userId)) throw new ApiError(400, "Invalid user");
  if (!Types.ObjectId.isValid(propertyId))
    throw new ApiError(400, "Invalid property id");

  await FavoriteModel.deleteOne({ userId, propertyId });
  return { ok: true };
}

