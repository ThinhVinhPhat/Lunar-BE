import * as bcrypt from 'bcrypt';
import { reverse } from './reverse';
const saltOrRounds = 10;

export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    const hashedPasword = await bcrypt.hash(plainPassword, saltOrRounds);
    return hashedPasword;
  } catch (error) {
    console.log(error);
  }
};
export const hashPasswordCompareHelper = async (
  plainPassword: string,
  hashedPassword: string,
) => {
  try {
    const hashedPasword = await bcrypt.compare(plainPassword, hashedPassword);
    return hashedPasword;
  } catch (error) {
    console.log(error);
  }
};

export const hashedRefreshToken = async (refreshToken: string) => {
  try {
    const hashedToken = await bcrypt.hash(refreshToken, saltOrRounds);
    return hashedToken;
  } catch (error) {
    console.log(error);
  }
};

export const hashTokenCompareHelper = async (
  plainToken: string,
  hashedToken: string,
) => {
  try {
    const isCompared = await bcrypt.compare(reverse(plainToken), hashedToken);
    return isCompared;
  } catch (error) {
    console.log(error);
  }
};
