import FavoriteService from '../../favorite/favorite.service';
import ApartmentService from '../apartment/apartment.service';
import { Request, Response } from 'express';

export default class FavoriteApi {
  private favoriteService = new FavoriteService();
  private apartmentService = new ApartmentService();

  public async addApartmentFavorite(req: Request, res: Response) {
    try {
      const idAccount = req.body.idAccount;
      const idApartment = req.body.idApartment;
      if (!idAccount || !idApartment) {
        res.status(400).json({
          message: 'Missing id accont or id apartment. Please try again',
        });
      } else {
        const favorite = await new FavoriteService().addApartmentFavorite(
          idAccount,
          idApartment
        );
        res.status(200).json({
          message: 'Add apartment favorite succes!',
          favorite: favorite,
        });
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({
        message: 'Has error happened. Please try again.',
        e,
      });
    }
  }

  public async removeApartmentFavorite(req: Request, res: Response) {
    try {
      const idFovorite = req.body.id;
      const result = await this.favoriteService.removeApartmentFavorite(
        idFovorite
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

  public async getListApartmentFavorite(req: Request, res: Response) {
    try {
      const idAccount = req.body.idAccount;
      const listFavorite = await this.favoriteService.getListApartmentFavorite(
        idAccount
      );
      var listApartment: Array<any> = [];
      listFavorite.forEach(async (favorite) => {
        this.apartmentService
          .getApartmentById(favorite.idApartment ?? '')
          .then((apartment) => {
            listApartment.push(apartment);
          });
      });
      res.status(200).json({
        apartments: listApartment,
      });
    } catch (e) {
      res.status(400).json({
        message: 'Has error happening. Please try again.',
        e,
      });
    }
  }
}
