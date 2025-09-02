import { lodingImg } from "../../assets/images";
import Pagination from "../../components/Pagination";
import ingStyle from "./Ingpedia.module.css"
import cx from "classnames";

export default function Ingpedia(){

    return (
        <>
            <div className={ingStyle.container}>

             <section className={ingStyle["recipe-category"]}>
                <div className={ingStyle[`title-area`]}>
                    <h2>재료 관리</h2>
                </div>
                <hr/>
                <ul className={cx(ingStyle["category-list"], ingStyle["content-area"])}>
                    <li><span className={ingStyle.circle}></span><p>굽기</p></li>
                    <li><span className={ingStyle.circle}></span><p>부침</p></li>
                    <li><span className={ingStyle.circle}></span><p>찜</p></li>
                    <li><span className={ingStyle.circle}></span><p>볶음</p></li>
                    <li><span className={ingStyle.circle}></span><p>무침</p></li>
                    <li><span className={ingStyle.circle}></span><p>끓이기</p></li>
                    <li><span className={ingStyle.circle}></span><p>반찬</p></li>
                    <li><span className={ingStyle.circle}></span><p>밥/죽/떡</p></li>
                    <li><span className={ingStyle.circle}></span><p>국/탕</p></li>
                    <li><span className={ingStyle.circle}></span><p>양념</p></li>
                    <li><span className={ingStyle.circle}></span><p>빵</p></li>
                    <li><span className={ingStyle.circle}></span><p>장류</p></li>
                </ul>
                </section>

                {/* <!-- 오늘의 PICK --> */}
                <section className={ingStyle[`today-pick`]}>
                    <div className={ingStyle[`title-area`]}>
                        <h2>오늘의 PICK!</h2>
                        <a href="#" className={ingStyle[`more-link`]}>레시피 바로가기</a>
                    </div>
                <div className={cx(ingStyle["pick-list"], ingStyle["content-area"])}>
                    <article className={ingStyle[`pick-item`]}>
                        <div className="flex-row width-100">
                            <img className={ingStyle[`rank-icon`]} src={lodingImg.crown1}/>
                            <p className={ingStyle[`pick-title`]}>(1줄 이상 ...처리) 팽이버섯 무밥 말이 15분 완성!</p>
                        </div>
                        <div className={ingStyle[`thumbnail`]}></div>
                    </article>
                    <article className={ingStyle[`pick-item`]}>
                        <div className="flex-row">
                            <img className={ingStyle[`rank-icon`]} src={lodingImg.crown2}/>
                            <p className={ingStyle[`pick-title`]}>새송이 버섯 버터 크림소스 볶음</p>
                        </div>
                        <div className={ingStyle[`thumbnail`]}></div>
                    </article>
                    <article className={ingStyle[`pick-item`]}>
                        <div className="flex-row">
                            <img className={ingStyle[`rank-icon`]}src={lodingImg.crown3}/>
                            <p className={ingStyle[`pick-title`]}>앞다리살 감자 조림</p>
                        </div>
                        <div className={ingStyle[`thumbnail`]}></div>
                    </article>
                </div>
                </section>

                {/* <!-- 재료 관리 Tip --> */}
                <section className={ingStyle[`ingredient-tip`]}>
                     <div className={ingStyle[`title-area`]}>
                        <h2>재료 관리 Tip!</h2>
                     </div>
                <div className={cx("flex-row", "gap-20", ingStyle["content-area"])}>
                        <img src={lodingImg.logo} className={ingStyle[`tip-image`]}/>
                    <div className={ingStyle[`tip-content`]}>
                        <div className={ingStyle[`tip-text`]}>
                            <h3>신선하고 맛있는 브로콜리 보관 방법</h3>
                            <p>
                                (3줄 이상 줄임 처리) ‘꽃양배추’라고도 불리는 ‘브로콜리’는 저자 과에 속하는 녹색 채소로 샐러드, 
                                스프 등 외국음식 조리에 많이 사용되는 재료 중 하나며 다량의 항산화 물질과 
                                칼슘이 함유되어 있어aaaaa aaaa aaaa aaaaaaaaa aaaaa aaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaa
                            </p>
                        </div>
                        <a href="#" className={ingStyle[`more-link`]}>더 많은 재료 관리 Tip 보기</a>
                        <div className={ingStyle[`carousel-thumbs`]}>
                            <img className={ingStyle[`arrow-icon`]} src={lodingImg.arrowLeft}/>
                            <span className={ingStyle[`thumb`]}></span>
                            <span className={ingStyle[`thumb`]}></span>
                            <span className={ingStyle[`thumb`]}></span>
                            <span className={ingStyle[`thumb`]}></span>
                            <img className={ingStyle[`arrow-icon`]}src={lodingImg.arrowRight}/>
                        </div>
                    </div>
                </div>
                </section>

                {/* <!-- 식BTI 검사하기 --> */}
                <section className={ingStyle[`food-bti`]}>
                    <div className={ingStyle[`title-area`]}>
                        <h2>식BTI 검사하기</h2>
                        <a href="#" className={ingStyle[`more-link`]}>내 식BTI 검사하기</a>
                    </div>
                <div className={ingStyle[`bti-banner`]}>
                    <img className={ingStyle[`content-area`]}src={lodingImg.EatBTI} alt="식BTI 검사하기"/>
                </div>
                </section>

                <Pagination/>
            </div>

        </>
    )
}