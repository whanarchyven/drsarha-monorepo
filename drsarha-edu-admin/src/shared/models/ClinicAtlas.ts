export interface ClinicAtlas {
  _id?: string;
  name: string;
  coverImage: string;
  images: {
    title: string;
    image: string;
    description: string;
  }[];
  description: string;
  tags: string[];
  likes: string[];
  comments: string[];
  createdAt: Date;
}
