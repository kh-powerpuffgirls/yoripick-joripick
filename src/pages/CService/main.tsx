import { useDispatch, useSelector } from 'react-redux';
import style from './main.module.css'
import { showAlert } from '../../features/alertSlice';
import type { RootState } from '../../store/store';
import { openChat } from '../../features/chatSlice';

export const CServiceMain = () => {
    let { rooms } = useSelector((state: RootState) => state.chat);
    const dispatch = useDispatch();
    const handleFetchChat = (type : string) => {
        const target = rooms.find(room => room.type === type);
        if (target) {
            dispatch(openChat(target));
        } else {
            dispatch(showAlert(null));
        }
    }
    return (
        <>
            <div className={style.body}>
                <h2 style={{ textAlign: "center" }}>🤖 요리 PICK 조리 PICK 고객센터 ☎</h2>
                <div className={style.cardContainer}>
                    <div className={`${style.card} ${style.ai}`}>
                        <h3>AI BOT, 요픽</h3>
                        <img src="src\assets\yopik.png" alt="yopik.png" />
                        <p>궁금한 게 있으면 내게 물어봐!</p>
                        <button onClick={() => handleFetchChat("cservice")}>불러오기</button>
                        <button onClick={() => dispatch(showAlert("cservice"))}>새 대화</button>
                    </div>
                    <div className={`${style.card} ${style.admin}`}>
                        <h3>직접 문의하기</h3>
                        <img src="src\assets\jopik.png" alt="jopik.png" />
                        <p>원하는 답변을 얻지 못하셨나요?</p>
                        <button onClick={() => handleFetchChat("admin")}>불러오기</button>
                        <button onClick={() => dispatch(showAlert("admin"))}>새 대화</button>
                    </div>
                </div>
            </div>
        </>
    )
}