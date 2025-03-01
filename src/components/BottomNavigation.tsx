import { useLocation } from "wouter";

import { ClockIcon } from "#/icons/ClockIcon";
import { HomeIcon } from "#/icons/HomeIcon";
import { SettingIcon } from "#/icons/SettingIcon";

export const BottomNavigation = () => {
  const [location, setLocation] = useLocation();

  return (
    <div className="dock">
      <button
        onClick={() => setLocation("/settings")}
        className={location === "/settings" ? "dock-active" : ""}
      >
        <SettingIcon />
        <span className="dock-label">Settings</span>
      </button>
      <button
        onClick={() => setLocation("/")}
        className={location === "/" ? "dock-active" : ""}
      >
        <HomeIcon />
        <span className="dock-label">Home</span>
      </button>
      <button disabled>
        <ClockIcon />
        <span className="dock-label">Nothing here yet</span>
      </button>
    </div>
  );
};
