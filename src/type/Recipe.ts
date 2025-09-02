// 레시피 타입 정의
export interface Recipe {
    rcp_no : number;		//레시피 번호
	user_no : number;		//유저 번호
	rcp_name : string;	    //레시피명
	rcp_info : string;	    //레시피 정보(레시피 소개)
    userInfo?:{
        nickname : string;
        eat_bti : string;
        profileImage : string;
    };
    image_no : number;		//이미지 번호
    imageUrl?:string;       //이미지 URL
    views : number;		    //조회수
    stars? : number;
    created_at : Date;     //작성일
    // rcp_mth_no : number;	//요리 방법(요리방법)
    // rcp_sta_no : number;	//요리 상황(요리종류)
    // tag : string;			//태그
    // category_no : number;	//카테고리 번호
    // nutrient_no : number;	//영양성분 정보
    // ingredient : string;	//재료정보(사과, 귤, ...)
    // approval : string;	    //공식레시피 승인 유무
}

// //레시피 디테일
// export const initMenu:CommunityRecipe = {
//     rcp_no : 0,
//     restaurant : '',
//     name: '',
//     price : 0,
//     rcp_mth_no : 0,
//     rcp_sta_no : 0
// } as const;

// // 레시피 등록 타입
// export type MenuCreate=Omit<Menu, 'id'>;

// // 레시피 수정 타입
// export type MenuUpdate = Pick<Menu,'id'> & Partial<Omit<Menu,'id'>>;