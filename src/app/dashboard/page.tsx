"use client";

import RoomData from "@/components/dashboard/RoomData";
import RoomsList from "@/components/dashboard/RoomsList";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store";

export default function Home() {
  const { setUserData, user, user_rooms } = useAppStore();
  return (
    <div className="flex h-full overflow-x-scroll">
      <div className="w-[300px] h-full p-4 shrink-0">
        <RoomsList />
      </div>
      <Separator orientation="vertical" />
      <div className="flex flex-col grow p-4 min-w-[400px]">
        <RoomData />
      </div>
    </div>
  );
}
