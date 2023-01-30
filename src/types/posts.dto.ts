export interface CreatePostDto {
  previewUrl: string;
  originalUrl: string;
  sourceUrl?: string;
  tags: string[];
  ownerId: number;
}

export interface UpdatePostDto {
  previewUrl: string;
  originalUrl: string;
  sourceUrl?: string;
  tags: string[];
}
