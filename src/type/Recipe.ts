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

// NutrientInfo 컴포넌트 및 재료 영양소 계산에 사용될 타입
export interface NutrientData {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sodium: number;
}

// 백엔드 API('/api/ingredients/search')의 응답 데이터 구조
export interface IngredientSearchResult {
  ingNo: number;
  ingName: string;
  energy: number; // 칼로리
  carb: number;   // 탄수화물
  protein: number;// 단백질
  fat: number;    // 지방
  sodium: number; // 나트륨
}

// 최종적으로 레시피에 추가되는 재료의 데이터 구조
export interface Ingredient {
  id: number; // 프론트엔드에서 목록 관리를 위한 임시 고유 ID
  name: string;
  quantity: string; // 예: "100g (1개)"
  nutrients: NutrientData; // 사용자가 입력한 중량에 맞게 환산된 영양소
}

// 요리 순서 데이터 구조
export interface CookingStep {
  id: number;
  description: string;
  image: File | null;
  imagePreview?: string;
}