import { Router, Request, Response } from 'express';
import Controller from '../../utils/interface/controller.interface';
import AccountService from '../account/account.service';
import Account from '../account/account.interface';
import ApartmentController from '../apartment/apartment.controller';
import FavoriteApi from './api.favorite';
import ApartmentApi from './api.apartment';

export default class ClientController implements Controller {
  path: string = '/api';
  router: Router = Router();
  private accountService = new AccountService();
  private apiFovorite = new FavoriteApi();
  private apiApartment = new ApartmentApi();

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
        console.log(_account);
        console.log(account);
        if (account) {
          res.status(200).json({ account });
        } else if (!account && email && _account.fullname) {
          account = await this.accountService.insertAccount(_account);
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
      this.apiFovorite.addApartmentFavorite
    );

    this.router.post(
      '/apartment/favorite/remove',
      this.apiFovorite.removeApartmentFavorite
    );
    this.router.post(
      '/apartment/favorite',
      this.apiFovorite.getListApartmentFavorite
    );

    this.router.post('/apartment/delete', this.apiApartment.deletApartment);
    this.router.post('/apartment/search', this.apiApartment.searchApartment);
  }
}
