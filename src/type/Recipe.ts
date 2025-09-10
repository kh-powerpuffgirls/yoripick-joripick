export interface User {
  user_no: number;
  username: string;
  sik_bti: string;
  image_no?: number;
  server_name?: string; // 프로필 이미지 경로
}

/**
 * 레시피 상세 정보 (Recipe 테이블 기반 + JOIN 데이터)
 * API에서 recipe 단건 조회 시 받아올 데이터 구조입니다.
 */
export interface Recipe {
  rcp_no: number;         // 레시피 번호 (PK)
  userInfo: User;         // 작성자 정보 (JOIN)
  rcp_name: string;       // 레시피명
  rcp_info: string;       // 레시피 소개
  tag?: string;           // 태그
  views: number;          // 조회수
  stars?: number;         // 별점 (리뷰 평균 등)
  created_at: string;     // 작성일 (Date나 string 타입 사용 가능)
  delete_status: 'N' | 'Y'; // 삭제 유무

  // FK이지만, API에서 실제 이름과 함께 보내줄 가능성이 높은 필드들
  rcp_mth_no: number;     // 요리 방법 번호
  rcp_mth_name?: string;  // 요리 방법 이름 (예: "굽기")
  rcp_sta_no: number;     // 요리 상황 번호
  rcp_sta_name?: string;  // 요리 상황 이름 (예: "일상")
  
  image_no?: number;        // 대표 이미지 번호
  server_name?: string;     // 대표 이미지 URL
  
  // 레시피에 포함된 재료 목록 (JOIN)
  ingredients: RecipeIngredient[];

  // 레시피에 포함된 요리 순서 목록 (JOIN)
  steps: CookingStep[];
}

/**
 * 레시피에 포함된 개별 재료 정보 (rcp_ingredient 테이블 기반)
 */
export interface RecipeIngredient {
  ing_no: number;         // 재료 번호
  ing_name: string;       // 재료 이름 (JOIN)
  quantity: string;       // 수량 (예: "1개", "2T")
  weight: number;         // 중량 (g)
}

/**
 * 요리 순서 정보
 */
export interface CookingStep {
  step_order: number;       // 순서 번호
  description: string;      // 설명
  image_no?: number;        // 이미지 번호
  server_name?: string;     // 이미지 URL
}

/**
 * 레시피 리뷰 정보
 */
export interface Review {
  review_no: number;
  userInfo: User;
  stars: number;
  content: string;
  server_name?: string; // 포토리뷰 이미지 경로
  review_date: string;
  ref_no: number;      // 레시피 번호 (Recipe['rcp_no'])
  delete_status: 'N' | 'Y';
}


// --- 2. API 및 컴포넌트 상호작용용 타입 ---
// API 요청/응답, 컴포넌트 간 데이터 전달에 사용되는 타입입니다.

/**
 * 재료 검색 API('/api/ingredients/search')의 응답 데이터 구조 (Ingredient 테이블 기반)
 */
export interface IngredientSearchResult {
  ing_no: number;     // DB의 ING_NO
  ing_name: string;   // DB의 ING_NAME
  // 100g당 영양 정보 (Nutrient 테이블과 JOIN된 결과로 추정)
  energy: number;     // 칼로리
  carb: number;       // 탄수화물
  protein: number;    // 단백질
  fat: number;        // 지방
  sodium: number;     // 나트륨
}

/**
 * 재료 추가 모달을 통해 레시피 작성 폼에 추가된 재료의 타입
 * 프론트엔드에서 상태 관리를 위해 사용합니다.
 */
export interface AddedIngredient {
  id: number;               // 프론트엔드에서 목록 관리를 위한 임시 고유 ID
  ing_no: number;           // 선택된 재료의 DB 번호
  name: string;             // 재료명
  quantity: string;         // 사용자가 입력한 수량 (예: "1개")
  weight: number;           // 사용자가 입력한 중량 (g)
  nutrients: NutrientData;  // 입력한 중량에 맞게 환산된 영양소
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
 * 요리 순서 추가/수정을 위한 프론트엔드용 타입
 */
export interface CookingStepForForm {
  id: number;               // 프론트엔드에서 목록 관리를 위한 임시 고유 ID
  description: string;
  image: File | null;       // 업로드할 이미지 파일
  imagePreview?: string;     // 이미지 미리보기 URL
}

/**
 * 레시피 작성 폼에서 서버로 전송될 전체 데이터 구조 (DTO)
 */
export interface RecipeFormData {
  rcp_name: string;
  rcp_info: string;
  tag?: string;
  rcp_mth_no: number;
  rcp_sta_no: number;
  mainImage: File; // 대표 이미지 파일
  // 서버에서 JSON 문자열을 객체 배열로 파싱해야 함
  ingredients: {
    ing_no: number;
    quantity: string;
    weight: number;
  }[];
  step_descriptions: string[];
  step_images: (File | Blob)[]; // 이미지가 없는 경우 빈 Blob 전송
}


// --- 3. 드롭다운 선택지 및 모달 Props 타입 ---

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

/**
 * ReviewModal 컴포넌트의 Props 타입
 */
export interface ReviewModalProps {
  recipeId: number;
  onClose: () => void;
  onReviewSubmit: () => void;
}