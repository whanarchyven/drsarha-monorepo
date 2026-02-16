export interface LootboxItem {
  type: 'stars' | 'exp' | 'prize' | 'lootbox';
  amount: number;
  chance: number; // 0..1
  objectId?: string; // для prize/lootbox
}

export interface Lootbox {
  _id: string;
  title: string;
  description: string;
  image: string;
  items: LootboxItem[];
  created_at: string;
  updated_at: string;
}
