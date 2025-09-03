import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import style from "./alertModal.module.css"
import { NewChatModal } from "./AlertContents";

export const AlertModal = () => {
  const { type, visible } = useSelector((state: RootState) => state.alert);

  if (!visible) return null;

  return (
    <div className={style.modalBackdrop} onClick={(e) => e.stopPropagation()}>
      <div className={style.modal}>
        <NewChatModal type={type} />
      </div>
    </div>
  )
}