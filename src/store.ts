import { API_URLS } from "@/constants/api_urls";
import makeApiCall from "@/lib/api_wrapper";
import { feed, FileExtension, files, meetings, messages, payment_splits, payments, rooms, users } from "@prisma/client";
import { create } from "zustand";

type AppState = {
  tab_loading: boolean;
  page_loading: boolean;
  feed: (feed & {
    author: users;
    files: files[];
    user_liked: boolean;
    payment_splits: payment_splits & { payment: payments };
  })[];
  user_rooms: rooms[];
  files: files[];
  payments: (payment_splits & { payment: payments })[];
  reached_end: boolean;
  meetings: meetings[];
  members: (users & { user: users })[];
  selectedRoom?: rooms;
  user: users;
  show_room_preview: number | null;
  messages: (messages & { user: users; files: files[] })[];
};

type AppActions = {
  setPageLoading: (loading: boolean) => void;
  resetState: () => void;
  setSelectedRoomId: (roomId: number) => void;
  setFeed: (feed: AppState["feed"]) => void;
  setPayments: (payments: AppState["payments"]) => void;
  setMessages: (messages: AppState["messages"]) => void;
  setUserRooms: (rooms: rooms[]) => void;
  setFiles: (files: files[]) => void;
  setMembers: (members: AppState["members"]) => void;
  setMeetings: (meetings: meetings[]) => void;
  setUserData: (user: users | null) => void;
  setReachedEnd: (reachedEnd: boolean) => void;
  setIncFeedLikes: (feedId: number) => void;
  setShowRoomPreview: (roomId: number | null) => void;
  loadRoomData: (roomId: number) => Promise<void>;
  getUserData: () => Promise<void>;
  getRoomFeedData: (options: { reset?: boolean }) => Promise<void>;
  getRoomPaymentsData: (options: { reset?: boolean }) => Promise<void>;
  getRoomChatData: (options: { feed_id?: number; reset?: boolean }) => Promise<void>;
  sendRoomMessage: (message: string, feed_id?: number) => Promise<void>;
  getRoomFilesData: (options: { parent_folder_id: string | null; reset?: boolean; search_text?: string }) => Promise<void>;
  getRoomMembersData: (options: { reset?: boolean }) => Promise<void>;
  getRoomMeetingsData: () => Promise<void>;
  createFolder: (parent_folder_id: string | null, folder_name: string) => Promise<void>;
  getUserRoomsData: () => Promise<void>;
  addLikeToFeed: (feed_id: number) => Promise<void>;
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  tab_loading: false,
  page_loading: true,
  feed: [],
  payments: [],
  selectedRoom: undefined,
  user_rooms: [],
  files: [],
  members: [],
  meetings: [],
  user: null as any as users,
  messages: [],
  reached_end: false,
  show_room_preview: null,
  setPageLoading: (loading) => set({ page_loading: loading }),
  resetState: () => set((state) => ({ ...state })),
  setSelectedRoomId: (roomId) =>
    set((state) => ({
      selectedRoom: state.user_rooms.find((room) => room.id === roomId),
      feed: [],
      payments: [],
      files: [],
      members: [],
      meetings: [],
      messages: [],
      reached_end: false,
    })),
  setFeed: (feed) => set({ feed }),
  setPayments: (payments) => set({ payments }),
  setMessages: (messages) => set({ messages }),
  setUserRooms: (user_rooms) => set({ user_rooms }),
  setFiles: (files) => set({ files }),
  setMembers: (members) => set({ members }),
  setMeetings: (meetings) => set({ meetings }),
  setUserData: (user) => set({ user: user as any }),
  setReachedEnd: (reached_end) => set({ reached_end }),
  setIncFeedLikes: (feedId) =>
    set((state) => {
      const index = state.feed.findIndex((feed) => feed.id === feedId);
      if (index === -1) return state;
      const newFeed = [...state.feed];
      newFeed[index] = {
        ...newFeed[index],
        user_liked: !newFeed[index].user_liked,
        likes: newFeed[index].likes + (newFeed[index].user_liked ? -1 : 1),
      };
      return { feed: newFeed };
    }),
  setShowRoomPreview: (roomId) => set({ show_room_preview: roomId }),
  getUserData: async () => {
    set({ page_loading: true });
    const [data, roomData] = await Promise.all([makeApiCall({ url: API_URLS.USER_DATA, method: "GET" }), makeApiCall({ url: API_URLS.USER_ROOMS, method: "GET" })]);

    set({ page_loading: false, user_rooms: roomData, user: data });
  },
  loadRoomData: async (roomId) => {
    const { setSelectedRoomId, setShowRoomPreview, user_rooms, page_loading } = get();
    setSelectedRoomId(roomId);
    const isRoomThere = user_rooms.find((room) => room.id === roomId);
    if (!isRoomThere && !page_loading) setShowRoomPreview(roomId);
  },

  getRoomFeedData: async ({ reset }) => {
    const { setFeed, setReachedEnd, selectedRoom, feed, tab_loading, reached_end } = get();
    if (tab_loading || reached_end) return;
    if (reset) setFeed([]);
    set({ tab_loading: true });
    const data = await makeApiCall({ url: API_URLS.ROOM_FEED, method: "GET", params: { room_id: 43, take: 10 } });
    console.log({ feed: data });
    setFeed([...feed, ...data]);
    set({ tab_loading: false });
    setReachedEnd(data.length === 0);
  },

  getRoomPaymentsData: async ({ reset }) => {
    const { setPayments, setReachedEnd, selectedRoom, payments, tab_loading, reached_end } = get();
    if (tab_loading || reached_end || !reset) return;
    if (reset) setPayments([]);
    set({ tab_loading: true });
    const data = await makeApiCall({
      url: API_URLS.ROOM_PAYMENTS,
      method: "GET",
      params: { room_id: selectedRoom!.id, cursor: reset ? undefined : payments.at(-1)?.id, take: 10 },
    });
    setPayments([...payments, ...data.data]);
    set({ tab_loading: false });
    setReachedEnd(data.data.length === 0);
  },

  getRoomChatData: async ({ feed_id, reset }) => {
    const { setMessages, setReachedEnd, selectedRoom, messages, tab_loading } = get();
    if (tab_loading) return;
    if (reset) {
      setMessages([]);
      setReachedEnd(false);
    }
    set({ tab_loading: true });
    const data = await makeApiCall({
      url: API_URLS.ROOM_CHAT,
      method: "GET",
      params: { room_id: selectedRoom?.id, feed_id, cursor: messages.at(0)?.id, take: 20 },
    });
    setMessages([...data.data.reverse(), ...messages]);
    set({ tab_loading: false });
    setReachedEnd(data.data.length === 0);
  },

  sendRoomMessage: async (message, feed_id) => {
    const { setMessages, selectedRoom, messages } = get();
    const messageResponse = await makeApiCall({
      url: API_URLS.ROOM_CHAT,
      method: "POST",
      body: { message },
      params: { room_id: selectedRoom?.id, feed_id },
    });
    setMessages([...messages, messageResponse.data]);
  },

  getRoomFilesData: async ({ parent_folder_id, reset, search_text }) => {
    const { setFiles, selectedRoom, files, tab_loading } = get();
    if (tab_loading) return;
    if (reset) setFiles([]);
    set({ tab_loading: true });
    const data = await makeApiCall({
      url: API_URLS.ROOM_FILES,
      method: "GET",
      params: {
        room_id: selectedRoom!.id,
        parent_id: parent_folder_id,
        skip: files.length,
        take: 50,
        search_file_name: search_text,
      },
    });
    setFiles([...files, ...data.data]);
    set({ tab_loading: false });
  },

  getRoomMembersData: async ({ reset }) => {
    const { setMembers, setReachedEnd, selectedRoom, members, tab_loading, reached_end } = get();
    if (tab_loading || reached_end) return;
    if (reset) setMembers([]);
    set({ tab_loading: true });
    const data = await makeApiCall({ url: API_URLS.ROOM_MEMBERS, method: "GET", params: { room_id: selectedRoom!.id, cursor: members.at(-1)?.id, take: 30 } });
    setMembers([...members, ...data.data]);
    set({ tab_loading: false });
    setReachedEnd(data.data.length === 0);
  },

  getRoomMeetingsData: async () => {
    const { setMeetings, selectedRoom } = get();
    setMeetings([]);
    set({ tab_loading: true });
    const data = await makeApiCall({ url: API_URLS.ROOM_MEETINGS, method: "GET", params: { room_id: selectedRoom!.id } });
    setMeetings(data.data);
    set({ tab_loading: false });
  },

  createFolder: async (parent_folder_id, folder_name) => {
    const { getRoomFilesData, selectedRoom } = get();
    set({ tab_loading: true });
    await makeApiCall({
      url: API_URLS.ROOM_FILES,
      method: "POST",
      body: {
        file_name: folder_name,
        file_extension: FileExtension.folder,
        file_type: "FOLDER",
        room_id: selectedRoom!.id,
        parent_id: parent_folder_id,
      },
    });
    await getRoomFilesData({ parent_folder_id });
    set({ tab_loading: false });
  },

  getUserRoomsData: async () => {
    set({ page_loading: true });
    const data = await makeApiCall({ url: API_URLS.USER_ROOMS, method: "GET" });
    console.log({ data });
    set({ page_loading: false, user_rooms: data });
  },

  addLikeToFeed: async (feed_id) => {
    const { setIncFeedLikes } = get();
    await makeApiCall({
      url: API_URLS.LIKE_FEED,
      method: "PUT",
      params: { feed_id: feed_id },
    });
    setIncFeedLikes(feed_id);
  },
}));
