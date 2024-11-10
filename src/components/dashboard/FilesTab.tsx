import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import { EmptyState } from "../shared/EmptyState";
import { InfiniteScroll } from "../shared/InfiniteScroll";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronRight, Folder, Home, FileIcon, FolderIcon } from "lucide-react";

// Define types for folder navigation
interface FolderBreadcrumb {
  id: string | null;
  name: string;
}

export default function FilesTab() {
  const { files, getRoomFilesData, tab_loading, reached_end, selectedRoom } = useAppStore((state) => ({
    files: state.files,
    getRoomFilesData: state.getRoomFilesData,
    tab_loading: state.tab_loading,
    reached_end: state.reached_end,
    selectedRoom: state.selectedRoom,
  }));

  // Local state to track folder navigation
  const [folderPath, setFolderPath] = useState<FolderBreadcrumb[]>([{ id: null, name: "Home" }]);

  useEffect(() => {
    getRoomFilesData({ reset: true, parent_folder_id: null });
    // Reset folder path when room changes
    setFolderPath([{ id: null, name: "Home" }]);
  }, [selectedRoom?.id]);

  const handleFolderClick = (folderId: string, folderName: string) => {
    getRoomFilesData({ reset: true, parent_folder_id: folderId });
    setFolderPath((prev) => [...prev, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    const targetFolder = newPath[newPath.length - 1];
    getRoomFilesData({ reset: true, parent_folder_id: targetFolder.id });
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto whitespace-nowrap">
        {folderPath.map((folder, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-500 mx-1" />}
            <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => handleBreadcrumbClick(index)}>
              {index === 0 ? <Home className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
              {folder.name}
            </Button>
          </div>
        ))}
      </div>

      {files.length === 0 && !tab_loading ? (
        <EmptyState message="No files yet" />
      ) : (
        <InfiniteScroll
          loading={tab_loading}
          hasMore={!reached_end}
          onLoadMore={() => {
            const currentFolderId = folderPath[folderPath.length - 1].id;
            getRoomFilesData({ reset: false, parent_folder_id: currentFolderId });
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {files.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer p-4 flex flex-col justify-center"
                onClick={() => {
                  if (item.file_type === "FOLDER") {
                    handleFolderClick(item.id, item.file_name);
                  } else {
                    window.open(item.file_url!, "_blank");
                  }
                }}
              >
                {item.file_type === "FOLDER" && <FolderIcon className="h-6 w-6" />}
                {item.file_type === "DOCUMENT" && <FileIcon className="h-6 w-6" />}
                {item.file_type === "IMAGE" && item.compressed_file_url && <img src={item.compressed_file_url!} alt={item.file_name} className="w-full h-full object-cover" />}
                <p className="text-sm mt-2 line-clamp-2">{item.file_name}</p>
              </Card>
            ))}
          </div>

          {reached_end && files.length > 0 && <p className="text-center text-sm text-gray-500 my-4">No more files to load</p>}
        </InfiniteScroll>
      )}
    </div>
  );
}