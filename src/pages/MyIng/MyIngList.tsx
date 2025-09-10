import { lodingImg } from "../../assets/images";
import Pagination from "../../components/Pagination";
import myingStyle from "./MyIng.module.css"
import ingStyle from "../Ingpedia/Ingpedia.module.css"
import cx from "classnames";

export default function MyIngList(){

    return (
        <>
            <div className={myingStyle.container}>
                <div className={myingStyle[`title-area`]}>
                    {/* <div className={myingStyle["toggle-area"]}>
                        <img src={lodingImg.toggleList} className={cx(myingStyle["toggle-icon"],myingStyle["listIcon"])}></img>
                        <div className={myingStyle["slide"]}/>
                        <img src={lodingImg.toggleGall} className={cx(myingStyle["toggle-icon"],myingStyle["gallery"])}></img>
                    </div> */}

                    <h2>내 식재료 관리</h2>
                    
                    <form action="." method="post" className={ingStyle["search-box"]}>
                        <button type="button" className={cx("semi-round-btn", "olive-b")}>재료 등록</button>
                        
                        <input className={ingStyle["search-txt"]} type="text" placeholder="내 식재료 검색"/>
                        <img src={lodingImg.search} className={ingStyle["search-icon"]}/>
                    </form>
                </div>
                <hr className={myingStyle["margin-10"]}/>
                <div className={myingStyle["sort-group"]}>
                    <button type="button" className={cx("click-basic", "round-btn", "green", "selected")}>소비기한순</button>
                    <button type="button" className={cx("click-basic", "round-btn", "green")}>등록일순</button>
                    <button type="button" className={cx("click-basic", "round-btn", "green")}>재료명순</button>
                </div>
                <hr/>

                {/* <!-- 내 식재료 목록 --> */}
                <section className={cx(myingStyle["mying-group"], myingStyle["content-area"])}>
                    <div className={myingStyle[`title-area`]}>
                        <h3>과일(*카테고리명으로 수정해야 함*)</h3>
                        <hr className={myingStyle["gray"]}/>
                    </div>

                    <div className={cx(myingStyle["mying-part-grid"], myingStyle["content-area"])}>
                        <article className={myingStyle[`mying-item`]}>
                            <div className={myingStyle[`thumbnail`]}>
                                <img className={myingStyle[`thumbnail-img`]} src={lodingImg.noImage}/>
                                <img className={myingStyle[`bang-icon`]} src={lodingImg.bang}/>
                                <div className={myingStyle[`d-day`]}>D - 30</div>
                                {/* <div className={myingStyle[`d-day`]}>D - {dDay}</div> */}
                            </div>
                            <div className={myingStyle[`mying-title`]}>
                                <p>(1줄 이상 ...처리) 팽이버섯 무밥 말이 15분 완성!</p>
                                <img className={myingStyle[`cancel-icon`]} src={lodingImg.cancel}/>
                            </div>
                        </article>
                        <article className={myingStyle[`mying-item`]}>
                            <div className={myingStyle[`thumbnail`]}>
                                <img className={myingStyle[`thumbnail-img`]} src={lodingImg.noImage}/>
                                <img className={myingStyle[`bang-icon`]} src={lodingImg.bang}/>
                                <div className={myingStyle[`d-day`]}>D - 30</div>
                                {/* <div className={myingStyle[`d-day`]}>D - {dDay}</div> */}
                            </div>
                            <div className={myingStyle[`mying-title`]}>
                                <p>재료1 (1)</p>
                                <img className={myingStyle[`cancle-icon`]} src={lodingImg.cancel}/>
                            </div>
                        </article>
                        


                    </div>
                </section>


                <Pagination/>
            </div>

        </>
    )
}