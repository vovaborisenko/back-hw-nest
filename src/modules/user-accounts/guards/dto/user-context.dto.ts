export class UserContextDto {
  id: string;
}

export function isUserContextDto(user: unknown): user is UserContextDto {
  return !!user && typeof user === 'object' && 'id' in user;
}
