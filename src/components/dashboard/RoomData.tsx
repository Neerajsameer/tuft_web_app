import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";

export default function RoomData() {
  const pathname = usePathname();
  const router = useRouter();
  // const tab = pathname.split("/")[3];

  const { feed, getRoomFeedData, getRoomChatData } = useAppStore();

  const [tab, setTab] = useState("feed");

  useEffect(() => {
    if (tab === "feed") getRoomFeedData({ reset: true });
    // if (tab === "chat") getRoomChatData({ reset: true });
  }, [tab]);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          // router.push(pathname.replace(tab, value));
          setTab(value);
        }}
      >
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="h-full overflow-y-scroll mt-4">
        {tab === "feed" &&
          feed.map((item) => (
            <Card className="p-4 m-4" key={item.id}>
              <h1>{item.message}</h1>
            </Card>
          ))}
      </div>
    </div>
  );
}
