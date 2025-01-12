import React from "react";
import { AppBar } from "../components/AppBar";
import { LeftInfo } from "../components/LeftInfo";
import { RightInfo } from "../components/RightInfo";

export const Map = () => {
  return (
    <div>
      <div className="flex flex-col">
        <AppBar />

          {/* Title Section */}
          <div className="p-4 border-b">
            <h1 className="text-2xl font-semibold text-gray-800">
              Off-roading and swimming in Wadis Daiqah and Arbeieen
            </h1>
            <p className="text-sm text-gray-500 mt-1">Offroad · Quriyat</p>
          </div>

          {/* Content Section */}
          <div className="flex flex-col lg:flex-row flex-grow">
            {/* Left Section */}
            <div className="lg:w-2/3 p-4 overflow-y-auto flex-grow h-screen scroll-hidden">
              <LeftInfo />
            </div>

            {/* Right Section */}
            <div className="lg:w-1/3 p-4 flex-grow overflow-y-auto h-screen scroll-hidden">
              <RightInfo />
            </div>
          </div>
        </div>
      </div>
  );
};
