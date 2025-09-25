// 유저
export interface User {
  userNo: number;
  username: string;
  sikBti: string;
  imageNo?: number;
  serverName?: string; // 프로필 이미지 경로
  profileImage?: string;
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
  stars: number;
  content: string;
  serverName?: string; // 리뷰 이미지 경로
  reviewDate: string;
  userInfo:User;

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
  onComplete: (newIngredients: Omit<AddedIngredient, 'id'>[]) => void;
}



// 레시피 목록의 개별 아이템 타입
export interface RecipeListItem {
  rcpNo: number;
  rcpName: string;
  createdAt: string;
  userNo : number;
  username: string;
  serverName?: string;
  userProfileImage?: string;
  sikBti?: string;
  avgStars?: number;
  reviewCount?: number;
  isOfficial: boolean;
  bookmarkCount?: number;
  isBookmarked?: boolean;
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

export interface RecipeDetail {
  rcpNo: number;
  rcpName: string;
  rcpInfo: string;
  createdAt: string;
  updatedAt :string;
  views: number;
  tag?: string;
  
  isOfficial: boolean;
  rcpMethod: string;
  rcpSituation: string;
  
  mainImage: string;
  writer: User | null;
  
  totalNutrient: NutrientData;
  ingredients: RecipeIngredient[];
  steps: CookingStep[];

  avgStars:number;
  rcpIngList?: string;

  bookmarked?: boolean;

  likeCount: number;
  bookmarkCount?: number;
  reviewCount: number;
}



export interface WriteReviewModalProps {
  rcpNo: number;
  onClose: () => void;
  onReviewSubmit: () => void;
}

export interface PhotoReviewModalProps {
  photoReviews: Review[];
  initialIndex: number;
  onClose: () => void;
}

export type RecipeResponse = {
  rcpNo: number;
  userNo: number;
  username: string;
  sikBti: string;
  userProfileImage: string;
  rcpName: string;
  serverName: string;
  views: number;
  createdAt: string; // Date 타입은 보통 string으로 넘어옵니다.
  avgStars: number;
  reviewCount: number;
  isOfficial?: boolean; // 랭킹 목록에도 공식 레시피가 포함될 수 있으므로 추가
};

export type OfficialRecipeResponse = {
  rcpNo: number;
  rcpName: string;
  serverName: string;
  views: number;
  username: string | null; // 작성자가 없는 공식 레시פי(API)일 수 있으므로 null
  sikBti: string | null;
  userProfileImage: string | null;
  isOfficial: boolean;
  bookmarkCount: number;
  isBookmarked: boolean;
};
export interface MyPageRecipe {
  id: number;
  title: string;
  likes: number; 
  img: string;
}