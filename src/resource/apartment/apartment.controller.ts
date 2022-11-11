import { Router, Request, Response } from 'express';
import Controller from '../../utils/interface/controller.interface';
import { upload } from '../../utils/img_helper';
import Grid from 'gridfs-stream';
import mongoose from 'mongoose';
import Apartment from './apartment.interface';
import ApartmentService from './apartment.service';
import { STATUS_FAILED, STATUS_SUCCESS } from '../../utils/const';
import 'dotenv/config';
import AccountService from '../account/account.service';
import { verifyAccessToken } from '../../middleware/jwt.middleware';
import AdminService from '../admin/admin.service';

export default class ApartmentController implements Controller {
  path: string = '/apartment';
  router: Router = Router();
  private apartmentService = new ApartmentService();
  private accountSerive = new AccountService();
  private adminService = new AdminService();

  constructor(parentPath: string) {
    this.router.get('/photos/:photoname', (req, res) => {
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

    this.router.post(
      '/update',
      upload.array('images'),
      async (req: Request, res: Response) => {
        try {
          const files = req.files;
          const _apartment = req.body as Apartment;
          if (files) {
            (files as any[]).forEach((element) => {
              const pathPhoto =
                process.env.BASE_URL +
                '/api' +
                this.path +
                '/photos/' +
                Object(element).filename;
              _apartment.photos.push(pathPhoto);
            });
          }
          const apartment = await this.apartmentService.insertApartment(
            _apartment
          );
          res.status(200).json({
            message: 'Update apartment succes!',
            apartment: apartment,
          });
        } catch (e) {
          res.status(400).json({
            message: 'Action fail! Please try again',
            e,
          });
        }
      }
    );

    if (parentPath === '/admin') {
      this.initialiseRouter();
    } else {
      this.initialiseRouterClient();
    }
  }

  private initialiseRouterClient() {
    this.router.get('/near-you', async (req: Request, res: Response) => {
      try {
        const longitude = Number(req.query.longitude);
        const latitude = Number(req.query.latitude);
        const distance = Number(req.query.distance);
        if (!longitude || !latitude) {
          return res.json({
            status: STATUS_FAILED,
            message: 'Missing params longitude/latitude',
          });
        }
        const apartments = await this.apartmentService.getApartmentNearest(
          longitude,
          latitude,
          distance
        );
        res.status(200).json({
          status: STATUS_SUCCESS,
          apartments: apartments,
        });
      } catch (err) {
        res.status(400).json({
          status: STATUS_FAILED,
          message: 'Some error happened. Please try again ',
          err,
        });
      }
    });

    this.router.get('/popular', async (req: Request, res: Response) => {
      try {
        const apartments = await this.apartmentService.getApartmentPopular();
        res.json({
          status: STATUS_SUCCESS,
          apartments: apartments,
        });
      } catch (err) {
        res.json({
          status: STATUS_FAILED,
          message: 'Some error happened. Please try again',
        });
      }
    });

    this.router.post(
      '/upload',
      upload.array('images'),
      async (req: Request, res: Response) => {
        try {
          const _idAccount = req.body._id;
          const files = req.files;
          var pathPhotos: string[] = [];
          if (files) {
            pathPhotos = (files as any[]).map((element) => {
              return (
                process.env.BASE_URL +
                '/api' +
                this.path +
                '/photos/' +
                Object(element).filename
              );
            });
          }
          const account = await this.accountSerive.findAccountById(_idAccount);
          if (!account) {
            res.status(400).json({
              message: 'Account not available!',
            });
          } else {
            const _apartment = req.body as Apartment;
            _apartment.createBy = account.fullname;
            _apartment.idOwner = _idAccount;
            _apartment.photos = pathPhotos;
            const apartment = await this.apartmentService.insertApartment(
              _apartment
            );
            account.countApartment += 1;
            this.accountSerive.updateAccount(_idAccount, account);
            res.status(200).json({
              message: 'Upload succes!',
              apartment: apartment,
            });
          }
        } catch (e) {
          res.status(400).json({
            message: 'Action fail! Please try again',
            e,
          });
        }
      }
    );
  }

  private initialiseRouter() {
    this.router.get(
      '/insert',
      verifyAccessToken,
      (req: Request, res: Response) => {
        res.render('add_apartment', {
          titlePage: 'Add apartment',
          admin: req.body.info,
        });
      }
    );

    this.router.post(
      '/insert',
      upload.array('images'),
      verifyAccessToken,
      (req: Request, res: Response) => {
        const fullnameAdmin = req.body.info.fullname;
        const _idAdmin = req.body.info._id;
        const files = req.files;
        var pathPhotos: string[] = [];
        if (files) {
          pathPhotos = (files as any[]).map((element) => {
            return (
              process.env.BASE_URL +
              '/api' +
              this.path +
              '/photos/' +
              Object(element).filename
            );
          });
        }
        const apartment = req.body as Apartment;
        apartment.createBy = 'admin';
        apartment.idOwner = _idAdmin;
        apartment.photos = pathPhotos;
        this.apartmentService
          .insertApartment(apartment)
          .then(async (result) => {
            res.redirect('/admin/apartment');
          })
          .catch((err) => {
            console.log(err);
            res.render('404_page', {
              titlePage: '404 not found',
              layout: false,
            });
          });
      }
    );

    this.router.post('/delete', async (req: Request, res: Response) => {
      try {
        console.log(req.body);
        const _id = req.body._id;
        if (!_id) {
          return res.render('404_page', {
            layout: false,
            titlePage: '404 not found',
          });
        } else {
          const resultDelete = await this.apartmentService.deleteApartment(_id);
          const isDeleteSuccess = resultDelete.deletedCount > 0;
          res.redirect('/admin/apartment');
        }
      } catch (err) {
        return res.render('404_page', {
          layout: false,
          titlePage: '404 not found',
        });
      }
    });

    this.router.post('/update', (req: Request, res: Response) => {
      try {
        const gfs = Grid(mongoose.connections[0].db, mongoose.mongo);
        gfs.collection('photos');
        // const { error, value } = apartmentSchema.validate(req.body);
        const _id = req.body.id;
        gfs.files
          .find({
            filename: { $regex: 'datn' },
          })
          .toArray((err, files) => {
            console.log(files);
          });
        res.json({
          status: STATUS_SUCCESS,
        });
        // if (error) {
        //   return res.json({
        //     status: STATUS_FAILED,
        //     message: `Missing params ${error.details[0].path}`,
        //   });
        // }
      } catch (err) {
        return res.json({
          status: STATUS_FAILED,
          message: 'Failed! Please try again',
          err,
        });
      }
    });

    this.router.get(
      '/detail/:id',
      verifyAccessToken,
      async (req: Request, res: Response) => {
        try {
          const _idApartment = req.params.id;
          const apartment = await this.apartmentService.getApartmentById(
            _idApartment
          );
          if (apartment) {
            res.render('apartment_detail', {
              apartment: apartment,
              titlePage: 'Apartment manager',
              accountOwner: await this.accountSerive.findAccountById(
                apartment?.idOwner
              ),
              accountAdmin: await this.adminService.findById(
                apartment?.idOwner
              ),
              admin: req.body.info,
            });
          } else {
            res.render('apartment_detail', {
              messageErr: 'Không tìm thấy chung cư',
            });
          }
        } catch (err) {
          console.log(err);
          res.render('404_page', {
            titlePage: '404 not found',
            layout: false,
          });
        }
      }
    );

    this.router.get(
      '/',
      verifyAccessToken,
      async (req: Request, res: Response) => {
        try {
          const resultObject = Object(
            await this.apartmentService.getAllApartment()
          );
          res.render('apartment_manager', {
            apartments: resultObject.result,
            totalPage: resultObject.totalPage,
            titlePage: 'Apartment manager',
            admin: req.body.info,
          });
        } catch (err) {
          return res.render('404_page', {
            titlePage: '404 not found',
            layout: false,
          });
        }
      }
    );
  }
}
