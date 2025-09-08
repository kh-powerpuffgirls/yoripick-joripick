import { useSelector, useDispatch } from "react-redux";
import style from "./Notification.module.css";
import type { RootState } from "../../store/store";
import { removeNotification } from "../../features/notiSlice";
import type { Message } from "../../type/chatmodal";
import { openChat } from "../../features/chatSlice";

export const Notification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.noti.list);
  const rooms = useSelector((state: RootState) => state.chat.rooms);

  const handleClose = (message: Message) => {
    dispatch(removeNotification(message));
  };
  const handleClick = (message: Message) => {
    const room = rooms.find(r => r.roomNo == message.roomNo);
    if (room) {
      dispatch(openChat(room));
      dispatch(removeNotification(message));
    }
  };

  return (
    <div className={style.container}>
      {notifications.map((message) => (
        <div className={style.notification} onClick={() => handleClick(message)}>
          <p>
            <strong>{message.username}:</strong> {message.content}
          </p>
          <button onClick={() => handleClose(message)}>X</button>
        </div>
      ))}
    </div>
  );
};
