export interface Tag {
  _id: string;
  name: string;
  created_at: string;
  updated_at: string;
  usage_count?: number; // для популярных тегов
}
