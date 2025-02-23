import { PropsWithChildren } from "react";
import { BottomNavigation } from "../components/BottomNavigation";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="bg-base-300 min-h-screen h-full">
      <div className="max-w-md mx-auto p-6 pb-18">
        {children}
        <BottomNavigation />
      </div>
    </div>
  );
}
