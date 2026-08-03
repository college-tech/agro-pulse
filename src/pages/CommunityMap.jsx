import React from "react";
import CommunityMap from "../components/map/CommunityMap";
import Nav from "../components/landing/nav";

export default function CommunityMapPage() {
  return (
    <>
    <div className="min-h-screen bg-forest-base px-6  max-w-7xl mx-auto">
        <div className="rounded-xl overflow-hidden">
          <CommunityMap />
        </div>
    </div>
    </>
  );
}