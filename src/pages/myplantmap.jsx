import React from "react";
import Myplantmap from "../components/map/myPlantMap";
import Nav from "../components/landing/nav";

export default function Myplantmappage() {
  return (
    <>
    <div className="min-h-screen bg-forest-base px-6  max-w-7xl mx-auto">
        <div className="rounded-xl overflow-hidden">
          <Myplantmap />
        </div>
    </div>
    </>
  );
}