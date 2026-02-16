export interface Nozology {
  _id: string;
  name: string;
  description: string;
  cover_image: string;
  category_id: string;
  categoryName?: string;
  materials_count?: {
    total: number;
  };
}
