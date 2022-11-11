import { Router, Request, Response } from 'express';
import Controller from '../../utils/interface/controller.interface';
import Account from './account.interface';
import AccountService from './account.service';
import { verifyAccessToken } from '../../middleware/jwt.middleware';
import ApartmentService from '../apartment/apartment.service';
import { upload } from '../../utils/img_helper';
import 'dotenv/config';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

export default class AccountController implements Controller {
  path: string = '/account';
  router: Router = Router();
  private accountService = new AccountService();
  private apartmentService = new ApartmentService();

  constructor(parent: string = '') {
    this.router.get('/avatar/:photoname', (req, res) => {
      const gridfsBucket = new mongoose.mongo.GridFSBucket(
        mongoose.connections[0].db,
        { bucketName: 'photos' }
      );
      const gfs = Grid(mongoose.connections[0].db, mongoose.mongo);
      gfs.collection('photos');
      gfs.files.findOne({ filename: req.params.photoname }, (err, file) => {
        if (!file || err) return res.json({ message: 'error' });
        const match = ['image/png', 'image/jpeg'];
        if (match.indexOf(file.contentType) !== -1) {
          const readStream = gridfsBucket.openDownloadStreamByName(
            file.filename
          );
          readStream.pipe(res);
        } else {
          res.json({ message: 'file not found' });
        }
      });
    });
    if (parent === '/admin') {
      this.initialiseRouterAdmin();
    } else {
      this.initialiseRouterApi();
    }
  }

  initialiseRouterApi() {
    this.router.post(
      '/update',
      upload.single('images'),
      async (req: Request, res: Response) => {
        try {
          const file = req.file;
          const idAccount = req.body._id;
          const account = req.body as Account;
          var pathAvatar = '';
          if (file) {
            pathAvatar = `${process.env.BASE_URL}/api${this.path}/avatar/${file.filename}`;
            account.avatar = pathAvatar;
          }
          const result = await this.accountService.updateAccount(
            idAccount,
            account
          );
          if (result.modifiedCount > 0) {
            res.status(200).json({
              message: 'Update account succes',
            });
          } else {
            res.status(400).json({
              message: 'Account not found',
            });
          }
        } catch (e) {
          console.log(e);
          res.status(400).json({
            message: 'Some error happened. Please try again',
            e,
          });
        }
      }
    );
  }

  initialiseRouterAdmin() {
    this.router.post(
      '/update',
      verifyAccessToken,
      upload.single('images'),
      async (req: Request, res: Response) => {
        try {
          const file = req.file;
          const idAccount = req.body._id;
          const account = req.body as Account;
          var pathAvatar = '';
          if (file) {
            pathAvatar = `${process.env.BASE_URL}/api${this.path}/avatar/${file.filename}`;
            account.avatar = pathAvatar;
          }
          const result = await this.accountService.updateAccount(
            idAccount,
            account
          );
          if (result.modifiedCount > 0) {
            res.status(200).json({
              message: 'Update account succes',
            });
          } else {
            res.status(400).json({
              message: 'Account not found',
            });
          }
        } catch (e) {
          console.log(e);
          res.status(400).json({
            message: 'Some error happened. Please try again',
            e,
          });
        }
      }
    );

    this.router.get(
      '/search',
      verifyAccessToken,
      async (req: Request, res: Response) => {
        try {
          const pattern = String(req.query.pattern);
          const page = Number(req.query.page);
          const pageSize = Number(req.query.page_size);
          const resultObject = Object(
            await this.accountService.search(pattern, page, pageSize)
          );
          res.render('account_search', {
            title: 'Customer manager',
            accounts: resultObject.result,
            totalPage: resultObject.totalPage,
            page: page,
            pattern: pattern,
            admin: req.body.info,
          });
        } catch (err) {
          res.status(400).json({
            message: 'Some error happened. Please try again',
            err,
          });
        }
      }
    );

    this.router.get(
      '/',
      verifyAccessToken,
      async (req: Request, res: Response) => {
        try {
          console.log(req.body.info);
          const page = Number(req.query.page);
          const pageSize = Number(req.query.page_size);
          const result = Object(
            await this.accountService.getAllAccount(page, pageSize)
          );
          res.render('all_account', {
            title: 'Account manager',
            accounts: result.accounts,
            // totalPage: result.totalPage,
            titlePage: 'Account manager',
            admin: req.body.info,
          });
        } catch (err) {
          res.render('404_page', { titlePage: '404 not found' });
        }
      }
    );

    this.router.get(
      '/apartment/:idAccount',
      verifyAccessToken,
      async (req: Request, res: Response) => {
        try {
          var idAccount = req.params.idAccount;
          var _account = await this.accountService.findAccountById(idAccount);
          var apartments = await this.apartmentService.getApartmentByIdAccount(
            idAccount
          );
          res.render('apartment_of_client', {
            admin: req.body.info,
            account: _account,
            apartments: apartments,
          });
        } catch (e) {}
      }
    );
  }
}
