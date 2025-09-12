// --- 1. DB 테이블 및 API 응답 관련 타입 ---
// 주로 서버로부터 데이터를 받아올 때 사용되는 타입입니다.

export interface User {
  userNo: number;
  username: string;
  sik_bti: string;
  imageNo?: number;
  serverName?: string; // 프로필 이미지 경로
}

/**
 * ✨ 레시피 상세 정보 (기존 Recipe 타입 유지)
 * API에서 recipe 단건 조회 시 받아올 데이터 구조입니다.
 */
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

export interface RecipeIngredient {
  ingNo: number;
  ingName: string;
  quantity: string;
  weight: number;
}

export interface CookingStep {
  stepOrder: number;
  description: string;
  imageNo?: number;
  serverName?: string;
}

// --- 2. 프론트엔드 상태 관리 및 컴포넌트 상호작용용 타입 ---
// API 요청/응답, 컴포넌트 간 데이터 전달에 사용됩니다.

/**
 * 재료 검색 API('/api/ingredients/search')의 응답 데이터 구조
 */
export interface IngredientSearchResult {
  ingNo: number;
  ingName: string;
  energy: number;
  carb: number;
  protein: number;
  fat: number;
  sodium: number;
}

/**
 * 영양소 정보
 */
export interface NutrientData {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sodium: number;
}

/**
 * ✨ 재료 추가 모달을 통해 레시피 작성 폼에 추가된 재료의 타입 (기존 AddedIngredient 유지)
 * 프론트엔드에서 상태 관리를 위해 사용합니다. (ID, 계산된 영양소 등 포함)
 */
export interface AddedIngredient {
  id: number;
  ingNo: number;
  name: string;
  quantity: string;
  weight: number;
  nutrients: NutrientData;
}

/**
 * ✨ 요리 순서 추가/수정을 위한 프론트엔드용 타입 (기존 CookingStepForForm 유지)
 */
export interface CookingStepForForm {
  id: number;
  description: string;
  image: File | null;
  imagePreview?: string;
}


// --- 3. API 요청(DTO) 및 기타 타입 ---

/**
 * ✨ 서버로 전송될 재료 데이터의 타입
 * 프론트엔드 상태(AddedIngredient)에서 서버가 필요한 부분만 추출하여 만듭니다.
 */
export interface IngredientForServer {
  ingNo: number;
  quantity: string;
  weight: number;
}

/**
 * ✨ 레시피 작성 폼에서 서버로 전송될 전체 데이터 구조 (DTO)
 * FormData에 담길 데이터들의 명세를 명확하게 정의합니다.
 * 백엔드 Spring Controller에서 @RequestParam으로 받을 이름과 일치시키는 것이 좋습니다.
 */
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

/**
 * 요리 방법/상황 드롭다운 옵션 타입
 */
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



// Sidebar 사이드바 타입
// 레시피 목록의 개별 아이템 타입
export interface RecipeListItem {
  rcpNo: number;
  rcpName: string;
  createdAt: string;
  username: string;
  serverName?: string;
  userProfileImage?: string;
  sikBti?: string;
  likeCount?: number;
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