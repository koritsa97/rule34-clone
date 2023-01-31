export interface CreateUserDto {
  username: string;
  password: string;
}

export interface UpdateUserDto {
  username: string;
  favoriteTags: string;
}
