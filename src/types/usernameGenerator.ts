export interface Config {
  dictionaries: string[][];
  separator?: string;
  randomDigits?: number;
  length?: number;
  style?: any;
}

export interface UsernameGeneratorInterface {
  generateUsernameFromEmail: (email: string, random: number) => string;
  generateUniqueUsername: (config: Config) => string;
}
