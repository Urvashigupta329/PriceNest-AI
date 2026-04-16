"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const historySchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 }
}, { _id: false });
const propertySchema = new mongoose_1.Schema({
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
}, { timestamps: true });
propertySchema.index({ location: 1, bedrooms: 1 });
propertySchema.index({ location: 1, price: -1 });
propertySchema.index({ area: 1, bedrooms: 1, bathrooms: 1 });
exports.PropertyModel = mongoose_1.default.model("Property", propertySchema);
