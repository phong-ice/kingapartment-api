import e, { Router, Request, Response } from 'express';
import Controller from '../../utils/interface/controller.interface';
import AccountService from '../account/account.service';
import Account from '../account/account.interface';
import ApartmentController from '../apartment/apartment.controller';
import FavoriteApi from './api.favorite';
import ApartmentApi from './api.apartment';
import ApartmentService from '../apartment/apartment.service';
import FavoriteService from '../../favorite/favorite.service';
import { io } from 'socket.io-client';

export default class ClientController implements Controller {
  path: string = '/api';
  router: Router = Router();
  private accountService = new AccountService();
  private apartmentService = new ApartmentService();
  private favoriteService = new FavoriteService();

  constructor() {
    const apartmentController = new ApartmentController(this.path);
    this.router.use(apartmentController.path, apartmentController.router);
    this.initialiseRouter();
  }

  private initialiseRouter() {
    this.router.post('/login', async (req: Request, res: Response) => {
      try {
        var _account = req.body as Account;
        const email = _account.email;
        var account = await this.accountService.getAccountByEmail(email);
        if (account) {
          if (account.isBock) {
            res.status(400).json({ message: 'Your account has been block.' });
          } else {
            res.status(200).json({ account });
          }
        } else if (!account && email && _account.fullname) {
          account = await this.accountService.insertAccount(_account);
          const socket = io('http://localhost:3000');
          socket.emit('KEY_NOTIFICATION', {
            title: 'New client',
            message: `"${_account.fullname}" come our system \n email: ${_account.email}`,
          });
          res.status(200).json({ account });
        } else {
          res.status(400).json({
            message: 'Missing parrams',
          });
        }
      } catch (err) {
        res.status(400).json({
          message: err,
        });
      }
    });

    this.router.post(
      '/apartment/favorite/add',
      async (req: Request, res: Response) => {
        try {
          const idAccount = req.body.email;
          const idApartment = req.body.idApartment;
          if (!idAccount || !idApartment) {
            res.status(400).json({
              message: 'Missing id accont or id apartment. Please try again',
            });
          } else {
            var available = await this.favoriteService.checkApartmentFavorite(
              idAccount,
              idApartment
            );
            if (available) {
              res.status(200).json({
                message: 'This apartment is already in favorites',
              });
            } else {
              const favorite = this.favoriteService.addApartmentFavorite(
                idAccount,
                idApartment
              );
              res.status(200).json({
                message: 'Add apartment favorite succes!',
              });
            }
          }
        } catch (e) {
          console.log(e);
          res.status(400).json({
            message: 'Has error happened. Please try again.',
            e,
          });
        }
      }
    );

    this.router.post(
      '/apartment/favorite/remove',
      async (req: Request, res: Response) => {
        try {
          const idApartment = req.body.idApartment;
          const idAccount = req.body.email;
          const result = await this.favoriteService.removeApartmentFavorite(
            idApartment,
            idAccount
          );
          if (result) {
            res.status(200).json({
              message: 'Remove aparment favorite succes!',
            });
          } else {
            res.status(400).json({
              message: 'Apartment favorite not availble.',
            });
          }
        } catch (e) {
          console.log(e);
          res.status(400).json({
            mesasge: 'Has error happened. Please try again!',
            error: e,
          });
        }
      }
    );
    this.router.post(
      '/apartment/favorite',
      async (req: Request, res: Response) => {
        try {
          const idAccount = req.body.email;
          const listFavorite =
            await this.favoriteService.getListApartmentFavorite(idAccount);
          var listIds = listFavorite.map((favorite) => {
            return favorite.idApartment ?? '';
          });
          var apartmentService = new ApartmentService();
          var listApartment = await apartmentService.getListApartment(listIds);
          res.status(200).json(listApartment);
        } catch (e) {
          console.log(e);
          res.status(400).json({
            message: 'Has error happening. Please try again.',
            e,
          });
        }
      }
    );

    this.router.post(
      '/apartment/delete',
      async (req: Request, res: Response) => {
        try {
          const idApartment = req.body.idApartment;
          const idAccount = req.body.idAccount;
          const result = await this.apartmentService.deleteApartmentClient(
            idApartment,
            idAccount
          );
          if (result) {
            var socket = io();
            socket.emit('KEY_NOTIFICATION', {
              title: 'Remove apartment',
              message: `${result.createBy} removed apartment "${result.name}"`,
            });
            res.status(200).json({
              message: 'Apartment deleted!',
              result: result,
            });
          } else {
            res.status(400).json({
              message: 'Apartment not found!',
            });
          }
        } catch (e) {
          res.status(400).json({
            message: 'Some error has happened. Please try again',
            e,
          });
        }
      }
    );
    this.router.get(
      '/apartment/search',
      async (req: Request, res: Response) => {
        try {
          const pattern = req.query.pattern as string;
          console.log(pattern);
          if (pattern) {
            const result = await this.apartmentService.search(
              pattern.toLowerCase()
            );
            res.status(200).json(result);
          } else {
            const result = await this.apartmentService.search('');
            res.status(200).json(result);
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
}
