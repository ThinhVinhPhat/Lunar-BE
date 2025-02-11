import * as bcrypt from 'bcrypt';
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
