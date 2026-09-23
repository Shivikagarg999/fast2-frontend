"use client";
import Image from "next/image";
import notServiceableImg from "@/assets/images/not-servicable.png";

// Shown wherever products aren't available at the customer's saved location.
// "Change location" reopens the site-wide location picker.
const NotServiceable = ({
  title = "We're not available at your location yet",
  message = "We couldn't find any shops delivering here right now. Try a different location, or check back soon.",
  showChangeLocation = true,
}) => (
  <div className="flex flex-col items-center text-center py-10 px-4">
    <Image
      src={notServiceableImg}
      alt="Not serviceable at your location"
      className="w-64 sm:w-80 h-auto"
    />
    <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-500 max-w-md">{message}</p>
    {showChangeLocation && (
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("openLocationPrompt"))}
        className="mt-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
      >
        Change location
      </button>
    )}
  </div>
);

export default NotServiceable;
