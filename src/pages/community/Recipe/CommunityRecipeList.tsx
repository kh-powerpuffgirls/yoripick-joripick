import { useNavigate } from "react-router-dom";
import CommunityHeader from "../Header/CommunityHeader";
import CommunitySidebar from "../Sidebar/CommunitySidebar";
import './CommunityList.css';
import useInput from "../../../hooks/useInput";
import { useState } from "react";

export default function UserRecipeList(){
    const navigate = useNavigate();

    const [searchKeyword, onChangeKeyword] = useInput({
        rcp_mth_no : 'all',
        rcp_sta_no : 'all'
        // tag : 'null'     //태그
    });

    const [submittedKeyword, setSubmittedKeyword] = useState({
        rcp_mth_no : 'all',
        rcp_sta_no : 'all'
        // tag : 'null'     //태그
    });

    // const {data:}
    
    return(

        <>
            <CommunityHeader/>
            <div className="main">
                <CommunitySidebar/>

            </div>

        </>

    )
}