import { User } from 'src/api/users/entities/user.entity';
import { Role } from 'src/types/user';
export const ADMIN: Partial<User> = {
  firstName: 'Niyo',
  lastName: 'Admin',
  role: Role.ADMIN,
  username: 'admin',
};
