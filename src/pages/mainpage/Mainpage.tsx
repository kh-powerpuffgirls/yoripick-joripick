import { lodingImg } from "../../assets/images";
import Pagination from "../../components/Pagination";
import mainStyle from "./Mainpage.module.css"
import cx from "classnames";

export default function Mainpage(){

    return (
        <>
            <div className={mainStyle.container}>

             <section className={mainStyle["recipe-category"]}>
                <div className={mainStyle[`title-area`]}>
                    <h2>레시피 분류</h2>
                    <a href="#" className={mainStyle[`more-link`]}>세부검색 바로가기</a>
                </div>
                <ul className={cx(mainStyle["category-list"], mainStyle["content-area"])}>
                    <li><span className={mainStyle.circle}></span><p>굽기</p></li>
                    <li><span className={mainStyle.circle}></span><p>부침</p></li>
                    <li><span className={mainStyle.circle}></span><p>찜</p></li>
                    <li><span className={mainStyle.circle}></span><p>볶음</p></li>
                    <li><span className={mainStyle.circle}></span><p>무침</p></li>
                    <li><span className={mainStyle.circle}></span><p>끓이기</p></li>
                    <li><span className={mainStyle.circle}></span><p>반찬</p></li>
                    <li><span className={mainStyle.circle}></span><p>밥/죽/떡</p></li>
                    <li><span className={mainStyle.circle}></span><p>국/탕</p></li>
                    <li><span className={mainStyle.circle}></span><p>양념</p></li>
                    <li><span className={mainStyle.circle}></span><p>빵</p></li>
                    <li><span className={mainStyle.circle}></span><p>장류</p></li>
                    <li><span className={mainStyle.circle}></span><p>일상</p></li>
                    <li><span className={mainStyle.circle}></span><p>영양식</p></li>
                    <li><span className={mainStyle.circle}></span><p>손님접대</p></li>
                    <li><span className={mainStyle.circle}></span><p>간식</p></li>
                    <li><span className={mainStyle.circle}></span><p>술안주</p></li>
                    <li><span className={mainStyle.circle}></span><p>다이어트</p></li>
                </ul>
                </section>

                {/* <!-- 오늘의 PICK --> */}
                <section className={mainStyle[`today-pick`]}>
                    <div className={mainStyle[`title-area`]}>
                        <h2>오늘의 PICK!</h2>
                        <a href="#" className={mainStyle[`more-link`]}>레시피 바로가기</a>
                    </div>
                <div className={cx(mainStyle["pick-list"], mainStyle["content-area"])}>
                    <article className={mainStyle[`pick-item`]}>
                        <div className="flex-row width-100">
                            <img className={mainStyle[`rank-icon`]} src={lodingImg.crown1}/>
                            <p className={mainStyle[`pick-title`]}>(1줄 이상 ...처리) 팽이버섯 무밥 말이 15분 완성!</p>
                        </div>
                        <div className={mainStyle[`thumbnail`]}></div>
                    </article>
                    <article className={mainStyle[`pick-item`]}>
                        <div className="flex-row">
                            <img className={mainStyle[`rank-icon`]} src={lodingImg.crown2}/>
                            <p className={mainStyle[`pick-title`]}>새송이 버섯 버터 크림소스 볶음</p>
                        </div>
                        <div className={mainStyle[`thumbnail`]}></div>
                    </article>
                    <article className={mainStyle[`pick-item`]}>
                        <div className="flex-row">
                            <img className={mainStyle[`rank-icon`]}src={lodingImg.crown3}/>
                            <p className={mainStyle[`pick-title`]}>앞다리살 감자 조림</p>
                        </div>
                        <div className={mainStyle[`thumbnail`]}></div>
                    </article>
                </div>
                </section>

                {/* <!-- 재료 관리 Tip --> */}
                <section className={mainStyle[`ingredient-tip`]}>
                     <div className={mainStyle[`title-area`]}>
                        <h2>재료 관리 Tip!</h2>
                     </div>
                <div className={cx("flex-row", "gap-20", mainStyle["content-area"])}>
                        <img src={lodingImg.logo} className={mainStyle[`tip-image`]}/>
                    <div className={mainStyle[`tip-content`]}>
                        <div className={mainStyle[`tip-text`]}>
                            <h3>신선하고 맛있는 브로콜리 보관 방법</h3>
                            <p>
                                (3줄 이상 줄임 처리) ‘꽃양배추’라고도 불리는 ‘브로콜리’는 저자 과에 속하는 녹색 채소로 샐러드, 
                                스프 등 외국음식 조리에 많이 사용되는 재료 중 하나며 다량의 항산화 물질과 
                                칼슘이 함유되어 있어aaaaa aaaa aaaa aaaaaaaaa aaaaa aaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaa
                            </p>
                        </div>
                        <a href="#" className={mainStyle[`more-link`]}>더 많은 재료 관리 Tip 보기</a>
                        <div className={mainStyle[`carousel-thumbs`]}>
                            <img className={mainStyle[`arrow-icon`]} src={lodingImg.arrowLeft}/>
                            <span className={mainStyle[`thumb`]}></span>
                            <span className={mainStyle[`thumb`]}></span>
                            <span className={mainStyle[`thumb`]}></span>
                            <span className={mainStyle[`thumb`]}></span>
                            <img className={mainStyle[`arrow-icon`]}src={lodingImg.arrowRight}/>
                        </div>
                    </div>
                </div>
                </section>

                {/* <!-- 식BTI 검사하기 --> */}
                <section className={mainStyle[`food-bti`]}>
                    <div className={mainStyle[`title-area`]}>
                        <h2>식BTI 검사하기</h2>
                        <a href="#" className={mainStyle[`more-link`]}>내 식BTI 검사하기</a>
                    </div>
                <div className={mainStyle[`bti-banner`]}>
                    <img className={mainStyle[`content-area`]}src={lodingImg.EatBTI} alt="식BTI 검사하기"/>
                </div>
                </section>
            </div>

        </>
    )
}