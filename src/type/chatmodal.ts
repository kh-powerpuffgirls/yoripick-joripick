export type Message = {
  text: string;
  sender: "me" | "other";
};

type ChatRoom = {
  id: string;
  name: string;
  messages: Message[];
};

type ChatState = {
  isOpen: boolean;
  rooms: ChatRoom[];
  currentRoomId: string | null;
};

export const initialState: ChatState = {
  isOpen: false,
  rooms: [
    { id: "1", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "2", name: "FAQ BOT, 요픽", messages: [] },
    { id: "3", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "4", name: "FAQ BOT, 요픽", messages: [] },
    { id: "5", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "6", name: "FAQ BOT, 요픽", messages: [] },
    { id: "7", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "8", name: "FAQ BOT, 요픽", messages: [] },
    { id: "9", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "10", name: "FAQ BOT, 요픽", messages: [] },
    { id: "11", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "12", name: "FAQ BOT, 요픽", messages: [] },
    { id: "13", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "14", name: "FAQ BOT, 요픽", messages: [] },
    { id: "15", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "16", name: "FAQ BOT, 요픽", messages: [] },
    { id: "17", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "18", name: "FAQ BOT, 요픽", messages: [] },
    { id: "19", name: "왕초보 식구들의 조림핑 따라잡기", messages: [] },
    { id: "20", name: "FAQ BOT, 요픽", messages: [] }
  ],
  currentRoomId: "1",
};