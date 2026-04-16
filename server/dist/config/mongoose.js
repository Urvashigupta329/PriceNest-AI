"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectMongo() {
    const uri = env_1.env.MONGODB_URI;
    if (!uri)
        throw new Error("MONGODB_URI is required");
    mongoose_1.default.set("strictQuery", true);
    await mongoose_1.default.connect(uri);
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
}
