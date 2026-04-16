"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFavorites = listFavorites;
exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
const mongoose_1 = require("mongoose");
const favorite_model_1 = require("../models/favorite.model");
const apiErrors_1 = require("../utils/apiErrors");
async function listFavorites(userId) {
    if (!mongoose_1.Types.ObjectId.isValid(userId))
        throw new apiErrors_1.ApiError(400, "Invalid user");
    const favorites = await favorite_model_1.FavoriteModel.find({ userId })
        .populate("propertyId")
        .lean();
    return favorites.map((f) => f.propertyId);
}
async function addFavorite(userId, propertyId) {
    if (!mongoose_1.Types.ObjectId.isValid(userId))
        throw new apiErrors_1.ApiError(400, "Invalid user");
    if (!mongoose_1.Types.ObjectId.isValid(propertyId))
        throw new apiErrors_1.ApiError(400, "Invalid property id");
    const created = await favorite_model_1.FavoriteModel.create({ userId, propertyId });
    return { favoriteId: created._id.toString() };
}
async function removeFavorite(userId, propertyId) {
    if (!mongoose_1.Types.ObjectId.isValid(userId))
        throw new apiErrors_1.ApiError(400, "Invalid user");
    if (!mongoose_1.Types.ObjectId.isValid(propertyId))
        throw new apiErrors_1.ApiError(400, "Invalid property id");
    await favorite_model_1.FavoriteModel.deleteOne({ userId, propertyId });
    return { ok: true };
}
