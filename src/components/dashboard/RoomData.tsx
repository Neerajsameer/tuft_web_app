import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image"; // Import Image component for avatar
import { ThumbsUpIcon, MessageSquareIcon, EyeIcon, LinkIcon, FolderIcon, FileTextIcon, FileIcon, FileSpreadsheetIcon, ImageIcon } from "lucide-react";

// Define the type for file extensions
type FileExtension = 'folder' | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'link';

// Ensure the file object uses this type
interface File {
  id: string;
  file_name: string;
  file_extension: FileExtension;
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
          <div className="flex flex-wrap">
            {files.map((file: File) => (
              <Card 
                className="flex flex-col items-center justify-center p-4 m-2 w-48 h-48 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                key={file.id}
                onClick={() => {
                  if (file.file_extension === 'folder') {
                    useAppStore.getState().getRoomFilesData({ parent_folder_id: file.id, reset: true });
                  } else {
                    // Handle file click, e.g., download or preview
                    console.log(`Clicked file: ${file.file_name}`);
                  }
                }}
              >
                {file.file_extension === 'folder' ? (
                  <FolderIcon className="w-12 h-12 mb-3 text-yellow-500" />
                ) : ['jpg', 'jpeg', 'png', 'gif'].includes(file.file_extension) ? (
                  <ImageIcon className="w-12 h-12 mb-3 text-purple-500" />
                ) : (
                  <FileIcon className="w-12 h-12 mb-3 text-gray-500" />
                )}
                <h1 className="text-center truncate w-full">{file.file_name}</h1>
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
