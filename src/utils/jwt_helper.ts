import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import createError from 'http-errors';
import AdminAccount from '../resource/admin/admin.interface';

export function signAccessToken(admin: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = {
      _id: admin._id,
      username: admin.username,
      password: admin.password,
      fullname: admin.fullname,
    };
    const secret = process.env.ACCESS_TOKEN_SECRET || '';
    const option = { expiresIn: '1h' };
    jwt.sign(payload, secret, option, (err, token) => {
      if (err || !token) {
        console.log(err);
        reject(new createError.InternalServerError());
      } else {
        resolve(token);
      }
    });
  });
}

export function signRefreshToken(admin: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = {
      _id: admin._id,
      username: admin.username,
      password: admin.password,
      fullname: admin.fullname,
    };
    const secret = process.env.REFRESH_TOKEN_SECRET || '';
    const option = { expiresIn: '1y' };
    jwt.sign(payload, secret, option, (err, token) => {
      if (err || !token) {
        reject(new createError.InternalServerError());
      } else {
        resolve(token);
      }
    });
  });
}
