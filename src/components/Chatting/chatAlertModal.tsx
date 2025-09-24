import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import style from "./alertModal.module.css"
import { NewChatModal } from "./alertChat";
import { hideAlert } from "../../features/chatalertSlice";

export const ChatAlertModal = () => {
  const { type, visible } = useSelector((state: RootState) => state.chatalert);
  const dispatch = useDispatch();
  if (!visible) return null;
  return (
    <div className={style.modalBackdrop} onClick={(e) => e.stopPropagation()}>
      <div className={style.modal}>
        {type && <NewChatModal type={type} />}
        {!type &&
          <>
            <h3>불러올 채팅 데이터가 없습니다.</h3>
            <button className={style.confirm} onClick={() => dispatch(hideAlert())}>확인</button>
          </>
        }
      </div>
    </div>
  )
}