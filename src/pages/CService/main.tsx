import { useDispatch } from 'react-redux';
import style from './main.module.css'
import { hideAlert, showAlert } from '../../features/alertSlice';

export const CServiceMain = () => {
    const dispatch = useDispatch();

    return (
        <>
            <div className={style.body}>
                <h2 style={{ textAlign: "center" }}>🤖 요리 PICK 조리 PICK 고객센터 ☎</h2>
                <div className={style.cardContainer}>
                    <div className={`${style.card} ${style.ai}`}>
                        <h3>AI BOT, 요픽</h3>
                        <img src="src\assets\yopik.png" alt="yopik.png" />
                        <p>궁금한 게 있으면 내게 물어봐!</p>
                        <button>불러오기</button>
                        <button onClick={() => dispatch(showAlert({
                            htmlComponent:
                                <>
                                    <h3>새 대화를 시작하시겠습니까?</h3>
                                    <p>이전 대화기록은 삭제됩니다.</p>
                                    <button className={style.confirm}>확인</button>
                                    <button className={style.cancel} onClick={() => dispatch(hideAlert())}>취소</button>
                                </>,
                            visible: true
                        }))}>새 대화</button>
                    </div>
                    <div className={`${style.card} ${style.admin}`}>
                        <h3>직접 문의하기</h3>
                        <img src="src\assets\jopik.png" alt="jopik.png" />
                        <p>원하는 답변을 얻지 못하셨나요?</p>
                        <button>불러오기</button>
                        <button onClick={() => dispatch(showAlert({
                            htmlComponent:
                                <>
                                    <h3>새 대화를 시작하시겠습니까?</h3>
                                    <p>이전 대화기록은 삭제됩니다.</p>
                                    <button className={style.confirm}>확인</button>
                                    <button className={style.cancel} onClick={() => dispatch(hideAlert())}>취소</button>
                                </>,
                            visible: true
                        }))}>새 대화</button>
                    </div>
                </div>
            </div>
        </>
    )
}