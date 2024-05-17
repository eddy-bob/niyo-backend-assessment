export interface JwtProvider {
  verifyToken: (
   token: string
  ) => Promise<any>;
}
