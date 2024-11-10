import { useAppStore } from "@/store";
import { useEffect } from "react";
import { Card } from "../ui/card";
import { EmptyState } from "../shared/EmptyState";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";
import { InfiniteScroll } from "../shared/InfiniteScroll";
import { format } from "date-fns";

export default function MeetingsTab() {
  const { meetings, getRoomMeetingsData, tab_loading, reached_end } = useAppStore();

  useEffect(() => {
    getRoomMeetingsData({ reset: true });
  }, []);

  return (
    <div className="max-w-[600px] mx-auto w-full">
      {meetings.length === 0 && !tab_loading ? (
        <EmptyState message="No meetings scheduled" />
      ) : (
        <InfiniteScroll loading={tab_loading} hasMore={!reached_end} onLoadMore={() => getRoomMeetingsData({ reset: false })}>
          <div className="space-y-4 p-4">
            {meetings.map((meeting) => (
              <Card className="p-4" key={meeting.id}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <VideoCameraIcon className="w-5 h-5 text-blue-500" />
                      <h3 className="font-medium">{meeting.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{meeting.description}</p>
                    <p className="text-sm text-gray-400">{format(new Date(meeting.scheduled_at), "PPp")}</p>
                  </div>
                  <Button variant="secondary" onClick={() => window.open(`/meeting/${meeting.id}`, "_blank")}>
                    Join
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
