import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";

export default function RoomData() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { 
    feed, 
    getRoomFeedData, 
    getRoomChatData, 
    getRoomFilesData, 
    getRoomMeetingsData, 
    getRoomPaymentsData, 
    payments, 
    meetings, 
    files, 
    messages 
  } = useAppStore();

  const [tab, setTab] = useState("feed");

  useEffect(() => {
    switch(tab) {
      case "feed":
        getRoomFeedData({ reset: true });
        break;
      case "chat":
        getRoomChatData({ reset: true });
        break;
      case "files":
        getRoomFilesData({ parent_folder_id: null, reset: true });
        break;
      case "meetings":
        getRoomMeetingsData();
        break;
      case "payments":
        getRoomPaymentsData({ reset: true });
        break;
    }
  }, [tab]);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          // Optionally handle routing or other side effects here
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
        {tab === "chat" &&
          messages.map((message) => (
            <Card className="p-4 m-4" key={message.id}>
              <h1>{message.content}</h1>
            </Card>
          ))}
        {tab === "files" &&
          files.map((file) => (
            <Card className="p-4 m-4" key={file.id}>
              <h1>{file.name}</h1>
            </Card>
          ))}
        {tab === "meetings" &&
          meetings.map((meeting) => (
            <Card className="p-4 m-4" key={meeting.id}>
              <h1>{meeting.title}</h1>
            </Card>
          ))}
        {tab === "payments" &&
          payments.map((payment) => (
            <Card className="p-4 m-4" key={payment.id}>
              <h1>{payment.payment_detail}</h1>
            </Card>
          ))}
      </div>
    </div>
  );
}
