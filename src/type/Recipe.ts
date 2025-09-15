// 유저
export interface User {
  userNo: number;
  username: string;
  sik_bti: string;
  imageNo?: number;
  serverName?: string; // 프로필 이미지 경로
}

//레시피 정보
export interface Recipe {
  rcpNo: number;
  userInfo: User;
  rcpName: string;
  rcpInfo: string;
  tag?: string;
  views: number;
  stars?: number;
  createdAt: string;
  deleteStatus: 'N' | 'Y';
  rcpMthNo: number;
  rcpMthMame?: string;
  rcpStaMo: number;
  rcpStaName?: string;  
  imageNo?: number;
  serverName?: string;
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
}

//레시피 재료
export interface RecipeIngredient {
  ingName: string;
  quantity: string;
  weight: number;
}

//요리순서
export interface CookingStep {
  rcpOrder: number;
  description: string;
  serverName?: string;
}

// 리뷰 정보
export interface Review {
  reviewNo: number;
  userInfo: User;
  stars: number;
  content: string;
  serverName?: string; // 리뷰 이미지 경로
  reviewDate: string;

  rcpSource : 'API' | 'COMM';
  refNo:number; //rcp_no
  deleteStatus :  'N' | 'Y';
}


//재료 검색
export interface IngredientSearchResult {
  ingNo: number;
  ingName: string;
  energy: number;
  carb: number;
  protein: number;
  fat: number;
  sodium: number;
}

//영양소 정보
export interface NutrientData {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sodium: number;
}

//재료추가 모달
export interface AddedIngredient {
  id: number;
  ingNo: number;
  name: string;
  quantity: string;
  weight: number;
  nutrients: NutrientData;
}

//요리순서추가
export interface CookingStepForForm {
  id: number;
  description: string;
  image: File | null;
  imagePreview?: string;
}


// 서버로전송하는 재료정보
export interface IngredientForServer {
  ingNo: number;
  quantity: string;
  weight: number;
}

// 서버로 전송될 레시피 작성 데이터
export interface RecipeWriteRequestDto {
  rcpName: string;
  rcpInfo: string;
  tag?: string;
  rcpMthNo: number;
  rcpStaNo: number;
  
  // ✨ ingredients는 JSON 문자열로 변환하여 전송될 예정
  ingredients: string; // JSON.stringify(IngredientForServer[])

  // ✨ 파일 및 순서 설명은 별도의 키로 전송
  mainImage: File;
  stepDescriptions: string[];
  stepImages: File[]; // File 또는 Blob 배열
}

// 요리방법 상황 드롭다운
export interface SelectOption {
  id: number;
  name: string;
}

/**
 * IngredientModal 컴포넌트의 Props 타입
 */
export interface IngredientModalProps {
  onClose: () => void;
  onComplete: (ingredient: AddedIngredient) => void;
}



// 레시피 목록의 개별 아이템 타입
export interface RecipeListItem {
  rcpNo: number;
  rcpName: string;
  createdAt: string;
  username: string;
  serverName?: string;
  userProfileImage?: string;
  sikBti?: string;
  avgStars?: number;
  reviewCount?: number;
}

// 백엔드로부터 받을 페이지 전체 데이터 타입
export interface RecipePage {
  recipes: RecipeListItem[];
  totalPages: number;
  totalElements: number;
}

// 사이드바 드롭다운 옵션 타입
export interface RcpOption {
  id: number;
  name: string;
}

// 사이드바 재료 검색 결과 타입
export interface IngredientOption {
  ingNo: number;
  ingName: string;
}


// 레시피 상세
export interface RecipeDetail {
  rcpNo: number;
  rcpName: string;
  rcpInfo: string;
  createdAt: string;
  views: number;
  tag?: string;
  
  // JOIN된 정보들
  isOfficial: boolean; // 공식/식구 레시피 구분
  rcpMethod: string;   // 요리 방법 이름
  rcpSituation: string; // 요리 종류 이름
  
  mainImage: string; // 대표 이미지 경로
  writer: User;  // 작성자 정보
  
  totalNutrient: NutrientData; // 전체 영양 정보
  ingredients: RecipeIngredient[]; // 재료 목록
  steps: CookingStep[];    // 요리 순서 목록

  // 집계 정보
  likeCount: number;
  dislikeCount: number;
  avgStars: number;
  reviewCount: number;
  
  // 현재 로그인한 유저의 정보 
  myLikeStatus?: 'LIKE' | 'DISLIKE' ;
}

export interface WriteReviewModalProps {
  rcpNo: number; // 어떤 레시피에 대한 리뷰인지 식별
  onClose: () => void; // 모달을 닫는 함수
  onReviewSubmit: () => void; // 리뷰 제출 성공 시 호출될 함수
}

export interface PhotoReviewModalProps {
  photoReviews: Review[]; // 표시할 포토 리뷰 목록
  initialIndex: number; // 처음 보여줄 이미지의 인덱스
  onClose: () => void; // 모달을 닫는 함수
}

