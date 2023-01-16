export interface CreatePostDto {
  previewImageUrl: string;
  originalImageUrl: string;
  source?: string;
  tags: string[];
  owner: string;
}
