export type Message = {
  text: string;
  sender: "me" | "other";
  button?: {
    url: string;
  };
};

export type ChatRoom = {
  classNo: string;
  className: string;
  type: "chat" | "cservice" | null;
  messages: Message[];
};

export type ChatRoomCreate = Pick<ChatRoom, 'type'>;

type ChatState = {
  isOpen: boolean;
  rooms: ChatRoom[];
  currentRoomId?: string;
};

export const initialState: ChatState = {
  isOpen: false,
  rooms: [],
  currentRoomId: undefined,
};
