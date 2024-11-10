import { useAppStore } from "@/store";
import { useEffect } from "react";
import { Card } from "../ui/card";
import { InfiniteScroll } from "../shared/InfiniteScroll";
import { EmptyState } from "../shared/EmptyState";
import { UserAvatar } from "../shared/UserAvatar";
import { ChatBubbleBottomCenterTextIcon, HandThumbUpIcon, EyeIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as SolidHandThumbUpIcon } from "@heroicons/react/24/solid";
import { FormattedMessage } from "../shared/FormatedMessage";

export default function FeedTab() {
  const { feed, getRoomFeedData, tab_loading, reached_end, selectedRoom } = useAppStore((state) => ({
    feed: state.feed,
    getRoomFeedData: state.getRoomFeedData,
    tab_loading: state.tab_loading,
    reached_end: state.reached_end,
    selectedRoom: state.selectedRoom,
  }));

  useEffect(() => {
    getRoomFeedData({ reset: true });
  }, [selectedRoom?.id]);

  return (
    <div className="max-w-[600px] mx-auto w-full">
      {feed.length === 0 && !tab_loading ? (
        <EmptyState message="No posts yet" />
      ) : (
        <InfiniteScroll loading={tab_loading} hasMore={!reached_end} onLoadMore={() => getRoomFeedData({ reset: false })}>
          {feed.map((item) => (
            <Card className="p-4 m-4" key={item.id}>
              <UserAvatar photoUrl={item.author.photo_url} name={item.author.name} timestamp={item.created_at} />
              <p className="text-sm mt-2">
                <FormattedMessage text={item.message} />
              </p>
              <div className="flex items-center gap-8 mt-4">
                <button onClick={() => useAppStore.getState().addLikeToFeed(item.id)} className={`flex items-center gap-1 text-sm ${item.user_liked ? "text-blue-500" : "text-gray-500"}`}>
                  {item.user_liked ? <SolidHandThumbUpIcon className="w-4 h-4" /> : <HandThumbUpIcon className="w-4 h-4" />}
                  {item.likes}
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500">
                  <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                  {item.comments}
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500">
                  <EyeIcon className="w-4 h-4" />
                  {item.views}
                </button>
              </div>
            </Card>
          ))}

          {reached_end && feed.length > 0 && <p className="text-center text-sm text-gray-500 my-4">No more posts to load</p>}
        </InfiniteScroll>
      )}
    </div>
  );
}
