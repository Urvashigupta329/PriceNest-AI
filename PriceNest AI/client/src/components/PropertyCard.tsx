import React from "react";
import { Link } from "react-router-dom";
import { type Property } from "../api/endpoints";

function formatINR(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  }
}

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to={`/properties/${property._id}`}
      className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-soft transition-shadow"
    >
      {property.imageUrl ? (
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-40 w-full object-cover group-hover:scale-[1.02] transition-transform"
        />
      ) : (
        <div className="h-40 w-full bg-slate-100" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900 line-clamp-1">
              {property.title}
            </div>
            <div className="text-sm text-slate-600">{property.location}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-slate-900">
              {formatINR(property.price)}
            </div>
            <div className="text-xs text-slate-500">{property.area} sqft</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
          <span className="bg-slate-100 px-2 py-1 rounded-full">
            {property.bedrooms} BHK
          </span>
          <span className="bg-slate-100 px-2 py-1 rounded-full">
            {property.bathrooms} Baths
          </span>
        </div>
      </div>
    </Link>
  );
}

