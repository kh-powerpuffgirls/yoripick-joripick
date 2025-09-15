import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import ingModalStyle from "./ingModal.module.css"
import { useEffect, useState } from 'react';
import { lodingImg } from "../../assets/images";
import ingStyle from "../../pages/Ingpedia/Ingpedia.module.css";
import cx from "classnames";
import { useNavigate } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { useMutation, useQuery } from "@tanstack/react-query";
import { searchIngs } from "../../api/IngApi";

export const IngPopup = () => {
  
  const handleSelect = (value: string) => {
    window.opener?.postMessage({ type: 'ING_RESULT', payload: value }, '*');
    window.close();
  };

  useEffect(() => {
    const headerEl = document.querySelector('#header');
    const footerEl = document.querySelector('#footer');
    if (headerEl) {
        (headerEl as HTMLElement).style.display = 'none';
    }
    if (footerEl) {
        (footerEl as HTMLElement).style.display = 'none';
    }
  }, []);


  const ingCode = 0;
  const ingCodeName = ['분류','과일', '채소', '버섯류', '곡류', '육류', '수산물', '유제품', '견과류', '당류', '양념류', '분말류', '기타'];
  const ingResult = ['테스트1','테스트2'];





  const navigate = useNavigate();

  const [searchKeyword, onChangeKeyword] = useInput({
      ingCode:0,
      keyword: ''
  });

  const [submittedKeyword, setSubmittedKeyword] = useState({
      ingCode:0,
      keyword: ''
  });

  const{data:IngItems, isLoading, isError, error} = useQuery({
    queryKey: ['IngItems', submittedKeyword],
    queryFn: () => searchIngs(submittedKeyword),
      staleTime: 60*1000
  })

  const handleSearchIngs = () => {
    setSubmittedKeyword(searchKeyword);
  };

  if(isLoading) return <div>Loading...</div>
  if(isError) return <div className="alert alert-danger">{error.message}</div>


  
  return (
    <div className={ingModalStyle.container}>
      <h3 className={ingModalStyle.title}>재료명 검색</h3>
      <form action="." method="post" className={ingStyle["search-box"]}>
        <select name="ingCodeName" className={ingModalStyle["drop-menu"]}>
            {ingCodeName.map(
                (item, index) => (
                    <option value={index} className={ingModalStyle["drop-item"]}>{item}</option>
                )
            )}
        </select>
        <input className={ingStyle["search-txt"]} type="text" placeholder="내 식재료 검색" />
        <img src={lodingImg.search} className={ingStyle["search-icon"]} alt="검색 아이콘" />
      </form>
      <hr className={ingModalStyle.margin0}/>
      <section className={ingModalStyle.result}>
        <ul>
          {ingResult.map(
                (item) => (
                  <>
                    <li className={ingModalStyle["result-item"]}>
                      <div className={ingModalStyle.category}>{item}</div>
                      <div className={ingModalStyle.ingName}>{item}</div>
                    </li>
                    <hr className={cx(ingModalStyle.margin0, ingModalStyle.gray)}/>
                  </>
                )
            )}
            <li className={ingModalStyle["result-item"]}>
              <div className={ingModalStyle.category}>aaAAAAaa</div>
              <div className={ingModalStyle.ingName}>aaaa</div>
            </li>
            <hr className={cx(ingModalStyle.margin0, ingModalStyle.gray)}/>
            <li className={ingModalStyle["result-item"]}>
              <div className={ingModalStyle.category}>aaAAAAaa</div>
              <div className={ingModalStyle.ingName}>aaaa</div>
            </li>
            <hr className={cx(ingModalStyle.margin0, ingModalStyle.gray)}/>
            <li className={ingModalStyle["result-item"]}>
              <div className={ingModalStyle.category}>aaAAAAaa</div>
              <div className={ingModalStyle.ingName}>aaaa</div>
            </li>
            <hr className={cx(ingModalStyle.margin0, ingModalStyle.gray)}/>
            <li className={ingModalStyle["result-item"]}>
              <div className={ingModalStyle.category}>aaAAAAaa</div>
              <div className={ingModalStyle.ingName}>aaaa</div>
            </li>
            <hr className={cx(ingModalStyle.margin0, ingModalStyle.gray)}/>
            
        </ul>
      </section>
      

      <div className={ingModalStyle["pagination-area"]}>
            <ul className={ingModalStyle["pagination"]}>
                <li> <a href="#">&lt;&lt;</a></li>
                <li> <a href="#">&lt;</a></li> 
                <li> <a href="#" className={cx(ingModalStyle.active, ingModalStyle["page-num"])}>1</a></li>
                <li> <a href="#" className="page-num">2</a></li>
                <li> <a href="#" className="page-num">3</a></li>
                <li> <a href="#" className="page-num">4</a></li>
                <li> <a href="#">&gt;</a></li>
                <li><a href="#">&gt;&gt;</a></li>
            </ul>
        </div>
    </div>
  )
}
