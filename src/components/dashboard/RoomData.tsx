import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image"; // Import Image component for avatar
import { BookOpen, MessageCircle, ThumbsUpIcon, MessageSquareIcon, EyeIcon, LinkIcon, FolderIcon, FileTextIcon, FileIcon, FileSpreadsheetIcon, ImageIcon } from "lucide-react";

// Define the type for file extensions
type FileExtension = 'folder' | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'link';

// Define the type for file types
type FileType = 'subject' | 'chat_media' | 'feed_media' | 'DOCUMENT'; // Ensure these match the string literals used

// Ensure the file object uses this type
interface File {
  id: string;
  file_name: string;
  file_extension: FileExtension;
  file_type: FileType; // Update this line
  // other properties...
}

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
            <Card className="p-4 m-4 max-w-2xl mx-auto" key={item.id}>
              {item.files && item.files.length > 0 && (
                <div className="mb-4">
                  {item.files.map((file) => (
                    <Image
                      key={file.id}
                      src={file.file_url || '/path/to/default/image.jpg'}
                      alt={file.file_name}
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="w-full h-auto rounded-md object-cover"
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center mb-2">
                <Image
                  src={item.author.photo_url!}
                  alt={item.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="ml-2">
                  <h2 className="text-lg font-semibold">{item.author.name}</h2>
                  <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-2">
                {item.message ? item.message.split(' ').map((word, index) => {
                  if (word.startsWith('http://') || word.startsWith('https://')) {
                    return <a key={index} href={word} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{word} </a>;
                  }
                  return word + ' '; // Add this line to return non-URL words
                }) : null}
              </p>
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                <button 
                  className={`flex items-center ${item.user_liked ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500`}
                  onClick={() => useAppStore.getState().addLikeToFeed(item.id)}
                >
                  <ThumbsUpIcon className="w-5 h-5 mr-1" />
                  <span>{item.likes || 0}</span>
                </button>
                <button className="flex items-center">
                  <MessageSquareIcon className="w-5 h-5 mr-1" />
                  <span>{item.comments || 0}</span>
                </button>
                <button className="flex items-center">
                  <EyeIcon className="w-5 h-5 mr-1" />
                  <span>{item.views || 0}</span>
                </button>
                <button className="flex items-center">
                  <LinkIcon className="w-5 h-5 mr-1" />
                  <span>{item.shares || 0}</span>
                </button>
              </div>
            </Card>
          ))}
        {tab === "chat" &&
          messages.map((message) => (
            <Card className="p-4 m-4" key={message.id}>
              <h1>{message.message}</h1>
            </Card>
          ))}
        {tab === "files" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {files.map((file) => (
              <Card
                className="p-6 flex flex-col items-center justify-between h-48 cursor-pointer"
                key={file.id}
                onClick={() => {
                  useAppStore.getState().getRoomFilesData({ parent_folder_id: file.id, reset: true });
                  console.log(`File clicked: ${file.file_name}`);
                }}
              >
                <FolderIcon className="w-16 h-16 mb-4 text-blue-500" />
                <div className="w-full text-center">
                  <h2 className="text-sm font-medium truncate">{file.file_name}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
        {tab === "meetings" &&
          meetings.map((meeting) => (
            <Card className="p-4 m-4" key={meeting.id}>
              <h1>{meeting.name}</h1>
            </Card>
          ))}
        {tab === "payments" &&
          payments.map((payment) => (
            <Card className="p-4 m-4" key={payment.id}>
              <h1>{payment.payment.name}</h1>
            </Card>
          ))}
      </div>
    </div>
  );
}
