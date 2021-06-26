import Exception from './exception';

export default class UserInvalidException extends Exception {
  constructor(message: string, status: number = 404) {
    super(message, status);
  }
}