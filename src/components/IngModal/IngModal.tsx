import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import ingModalStyle from "./ingModal.module.css"
import { useEffect, useState } from 'react';
import { lodingImg } from "../../assets/images";
import "../../assets/css/button.css";
import cx from "classnames";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { useQuery } from "@tanstack/react-query";
import { searchIngs } from "../../api/ing/ingApi";
import Pagination from "../Pagination";
import type { PageInfo } from "../../api/adminApi";
import type { IngItem } from "../../type/Ing";

export const IngPopup = () => {

  const [searchParams] = useSearchParams();
  const target = searchParams.get('target');
  
  const handleSelect = (ingItem:IngItem) => {
    window.opener?.postMessage({ 
      type: 'ING_RESULT', 
      target,
      payload: {
        ingNo: ingItem.ingNo,
        ingName: ingItem.ingName,
        ingCode: ingItem.ingCode,
        ingCodeName: ingItem.ingCodeName,
    }}, '*');
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

  const ingCodeName = ['전체','과일', '채소', '버섯류', '곡류', '육류', '수산물', '유제품', '견과류', '당류', '양념류', '분말류', '기타'];

  const navigate = useNavigate();

  const [searchKeyword, onChangeKeyword] = useInput({
      ingCode:0,
      keyword: '',
      page: 0
  });

  const [submittedKeyword, setSubmittedKeyword] = useState({
      ingCode:0,
      keyword: '',
      page: 0
  });

  const{data:IngItems, isLoading, isError, error} = useQuery({
    queryKey: ['IngItems', submittedKeyword],
    queryFn: () => searchIngs(submittedKeyword),
      staleTime: 60*1000
  })

  const [ingPageInfo, setIngPageInfo] = useState<PageInfo>({
    listCount: 0,
    currentPage: 0,
    pageLimit: 0,
    itemLimit: 0,
    maxPage: 0,
    startPage: 0,
    endPage: 0
  });  

  useEffect(() => {
    if (IngItems?.pageInfo) {
      setIngPageInfo(IngItems.pageInfo);
      console.log(IngItems?.list);
    }
  }, [IngItems]);

  const handleSearchIngs = () => {
    setSubmittedKeyword({ ...searchKeyword, page: 1 });
  };

  if(isLoading) return <div>Loading...</div>
  if(isError) return <div className="alert alert-danger">{error.message}</div>

  const fetchIngData = (page:number) => {
    setSubmittedKeyword({ ...searchKeyword, page: page });
  };

  
  return (
    <div className={cx(ingModalStyle["ing-modal"], ingModalStyle["ing-modal"], ingModalStyle["container"])}>
      <h3 className={ingModalStyle.title}>재료명 검색</h3>
      <form action="." method="get" className={cx(ingModalStyle["search-box"],ingModalStyle["form"])}
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchIngs();
        }}>
        <select name="ingCode" className={ingModalStyle["drop-menu"]} value={searchKeyword.ingCode} onChange={onChangeKeyword}>
            {ingCodeName.map(
                (item, index) => (
                    <option value={index} className={ingModalStyle["drop-item"]}>{item}</option>
                )
            )}
        </select>
        <input className={ingModalStyle["search-txt"]} type="text" name="keyword" placeholder="내 식재료 검색"
          onChange={onChangeKeyword} value={searchKeyword.keyword}/>
        <img src={lodingImg.search} className={ingModalStyle["search-icon"]}
          onClick={(e) => {
          e.preventDefault();
          handleSearchIngs();
        }}/>
        <button type="submit" style={{ display: 'none' }} />
      </form>
      <hr className={ingModalStyle.margin0}/>
      <section className={ingModalStyle.result}>
        <ul>
          {IngItems?.list.map(
                (Ingitem) => (
                  <>
                    <li className={ingModalStyle["result-item"]} onClick={()=>handleSelect(Ingitem)}>
                      <div className={ingModalStyle.category}>{Ingitem.ingCodeName}</div>
                      <div className={ingModalStyle.ingName}>{Ingitem.ingName}</div>
                    </li> 
                    <hr className={cx(ingModalStyle.margin0, ingModalStyle.gray)}/>
                  </>
                )
            )}
        </ul>
      </section>
      
      <div className={ingModalStyle["pagination-aria"]}>
        <Pagination
          pageInfo={ingPageInfo}
          onPageChange={(page)=> fetchIngData(page)}
        />
      </div>
      
    </div>
  )
}
