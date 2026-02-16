import type { Nozology } from './Nozology';

export interface Category {
  _id?: string;
  name: string;
  description: string;
  cover_image: string;
  nozologies?: Nozology[];
}
