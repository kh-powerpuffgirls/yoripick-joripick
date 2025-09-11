import style from './main.module.css'

export const AdminDashboard = () => {
    return (
        <>
            <div>
                <h3>회원관리 🔐</h3>
                <hr />
                <div>
                    <div>
                        <span>ID 19</span>
                        <span>사기 / 기만 행위</span>
                        <span>2025 / 08 / 27</span>
                    </div>
                    <div>
                        <span>USER 17</span>
                        <span>직거래 마켓에 등록된 핸드폰 번호가 존재하지 않는 번호라고 나와요...</span>
                    </div>
                    <div>
                        <button>새 탭에서 열기</button>
                        <button>기각</button>
                        <button>정지</button>
                    </div>
                </div>
            </div>

            <div>
                <h3>레시피 관리 🍳</h3>
                <hr />
                <div>
                    <div>
                        <span>ID 19</span>
                        <span>오류 수정 요청</span>
                        <span>2025 / 08 / 27</span>
                    </div>
                    <div>
                        <span>USER 17</span>
                        <span>레시피에 오타 있어요 '고구미' 수정부탁드립니다...</span>
                    </div>
                    <div>
                        <button>새 탭에서 열기</button>
                        <button>완료</button>
                        <button>기각</button>
                    </div>
                </div>
            </div>

            <div>
                <h3>커뮤니티 관리 🎮</h3>
                <hr />
                <div>
                    <div>
                        <span>ID 19</span>
                        <span>새 챌린지 요청</span>
                        <span>2025 / 08 / 27</span>
                    </div>
                    <div>
                        <span>USER 17</span>
                        <span>마라탕후루 챌린지 끝나면 용암먹방 해주세요...</span>
                    </div>
                    <div>
                        <button>새 탭에서 열기</button>
                        <button>확인</button>
                        <button>기각</button>
                    </div>
                </div>
            </div>

            <div>
                <h3>고객문의 💌</h3>
                <hr />
                <div>
                    <div>
                        <span>ID 19</span>
                        <span>Goofy</span>
                        <span>2025 / 08 / 27</span>
                    </div>
                    <div>
                        <span>USER 17</span>
                        <span>제 식비티아이 마음에 안들어요 바꿔주세요...</span>
                    </div>
                    <div>
                        <button>채팅방 열기</button>
                        <button>확인</button>
                        <button>기각</button>
                    </div>
                </div>
            </div>
        </>
    )
}