import AdminAccount from './admin.interface';
import adminModel from './admin.model';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import createHttpError from 'http-errors';
import Account from '../account/account.interface';

export default class AdminService {
  private adminModel = adminModel;

  public async login(accountAdmin: AdminAccount) {
    return this.adminModel.findOne({
      username: accountAdmin.username,
      password: accountAdmin.password,
    });
  }

  public async findById(id: string) {
    return this.adminModel.findById(id);
  }
}
