import * as bcrypt from 'bcrypt';
import { reverse } from './reverse';
const saltOrRounds = 10;

export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltOrRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const hashPasswordCompareHelper = async (
  plainPassword: string,
  hashedPassword: string,
) => {
  try {
    const comparedPassword = await bcrypt.compare(
      plainPassword,
      hashedPassword,
    );
    return comparedPassword;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const hashedRefreshToken = async (refreshToken: string) => {
  try {
    const hashedToken = await bcrypt.hash(refreshToken, saltOrRounds);
    return hashedToken;
  } catch (error) {
    throw new Error(error.message);
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
    throw new Error(error.message);
  }
};
