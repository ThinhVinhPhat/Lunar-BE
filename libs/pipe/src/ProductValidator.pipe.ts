import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

const getModel = () => {
  dotenv.config();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
  });
  return model;
};

@ValidatorConstraint({
  name: 'ProductDescription',
  async: true,
})
export class ProductDescription implements ValidatorConstraintInterface {
  message: string = '';
  async validate(description: string) {
    const model = getModel();
    const prompt = `Given the description provided below,
      check if it means something to a user perspective and
      that it doesn't contain any offensive content or
      vague informations
      \\n \\n the description: "${description}"
      \\n if you think the description is
      valid, please return "valid" otherwise type "This product description is invalid"
      + the reason why you think it's invalid
      \\n the response should be sent in a human-readable
      format, since it will be used to send feedback to the
      client`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const isValid = !response
      .text()
      .toLowerCase()
      .includes('This product description is invalid');
    console.log(this.message);

    if (!isValid) this.message = response.text();
    return isValid;
  }
  defaultMessage() {
    return this.message;
  }
}

@ValidatorConstraint({
  name: 'ProductName',
  async: true,
})
export class ProductName implements ValidatorConstraintInterface {
  message: string = '';
  async validate(name: any, args: ValidationArguments) {
    const dto = args.object as any;
    const category = dto.category;
    const model = getModel();
    const prompt = `Given the product name and its category provided below,
    check if the name is clear, meaningful, and appropriate from a user perspective,
    and ensure it does not contain any offensive, misleading, or vague content.
    Also, evaluate whether the name is relevant to its product category.

    Product name: "${name}"
    Category: "${category}"

    If you believe the name is valid, respond with "valid".
    Otherwise, respond with "This product name is invalid" followed by the reason why the name is not acceptable.

    The response should be in a friendly and human-readable format,
    as it will be used directly as feedback to the client.
    `;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const isValid = !response
      .text()
      .toLowerCase()
      .includes('This product name is invalid');
    console.log(this.message);

    if (!isValid) this.message = response.text();
    return isValid;
  }
  defaultMessage() {
    return this.message;
  }
}
