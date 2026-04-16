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
      className="group overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-950/80 shadow-soft transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_25px_80px_rgba(14,165,233,0.14)]"
    >
      {property.imageUrl ? (
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="h-56 w-full bg-slate-900" />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-white line-clamp-1">{property.title}</div>
            <div className="text-sm text-slate-400">{property.location}</div>
          </div>
          <div className="text-right text-sm text-slate-300">
            {formatINR(property.price)}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1">{property.bedrooms} BHK</span>
          <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1">{property.bathrooms} Baths</span>
          <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1">{property.area} sqft</span>
        </div>
      </div>
    </Link>
  );
}

