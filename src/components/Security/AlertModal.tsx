import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import style from "./alertModal.module.css"

export const AlertModal = () => {
  const { htmlComponent, visible } = useSelector((state: RootState) => state.alert);

  if (!visible) return null;

  return (
    <div className={style.modalBackdrop} onClick={(e) => e.stopPropagation()}>
      <div className={style.modal}>
        {htmlComponent}
      </div>
    </div>
  )
}