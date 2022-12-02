import FavoriteService from '../../favorite/favorite.service';
import ApartmentService from '../apartment/apartment.service';
import { Request, Response } from 'express';

export default class FavoriteApi {
  public async addApartmentFavorite(req: Request, res: Response) {
    try {
      const idAccount = req.body.email;
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
      const idApartment = req.body.idApartment;
      const idAccount = req.body.email;
      const result = await new FavoriteService().removeApartmentFavorite(
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

  public async getListApartmentFavorite(req: Request, res: Response) {
    try {
      const idAccount = req.body.email;
      const listFavorite = await new FavoriteService().getListApartmentFavorite(
        idAccount
      );
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
}
