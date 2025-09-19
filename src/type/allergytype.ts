export interface AllergyDto {
  allergyNo: number;
  name: string;
  category: number | null;
  children?: AllergyDto[];
}