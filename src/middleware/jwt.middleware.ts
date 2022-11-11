import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import AdminAccount from '../resource/admin/admin.interface';
import { signAccessToken } from '../utils/jwt_helper';

export function verifyAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers['Authorization'] as string;
    if (!authHeader) return next(new createError.Unauthorized());
    const beare = authHeader.split(' ');
    const secret = process.env.ACCESS_TOKEN_SECRET || '';
    const token = beare[1];
    jwt.verify(token, secret, (err, payload) => {
      if (!err) {
        req.body.info = payload;
        next();
      } else {
        const refresh_token = req.cookies['refresh_token'] as string;
        let secret = process.env.REFRESH_TOKEN_SECRET || '';
        jwt.verify(refresh_token, secret, async (err, payload) => {
          if (err || !payload) {
            if (req.url == '/login') {
              next();
            } else {
              res.redirect('/admin/login');
            }
          } else {
            const admin = payload as AdminAccount & { _id: string };
            let access_token = await signAccessToken(admin);
            res.cookie('Authorization', access_token);
            req.body.info = payload;
            next();
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.render('404_page', { layout: false });
  }
}

export function passTokenCookieToHeader(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const access_token = req.cookies['access_token'];
  req.headers['Authorization'] = `Bearer ${access_token}`;
  next();
}
