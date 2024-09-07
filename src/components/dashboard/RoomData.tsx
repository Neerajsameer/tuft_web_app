import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function RoomData() {
  const [selectedTab, setSelectedTab] = useState("feed");

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <Tabs
        value={selectedTab}
        onValueChange={(value) => {
          setSelectedTab(value);
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
      <div className="h-full overflow-y-scroll mt-4">Load the {selectedTab} here</div>
    </div>
  );
}
