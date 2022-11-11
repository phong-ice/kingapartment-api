import ApartmentService from '../apartment/apartment.service';
import { Request, Response } from 'express';

export default class ApartmentApi {
  private apartmentService = new ApartmentService();

  async deletApartment(req: Request, res: Response) {
    try {
      const idApartment = req.body.idApartment;
      const idAccount = req.body.idAccount;
      const result = await this.apartmentService.deleteApartmentClient(
        idApartment,
        idAccount
      );
      if (result) {
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

  async searchApartment(req: Request, res: Response) {
    try {
      const pattern = req.body.patternSearch;
      if (pattern) {
        const result = await this.apartmentService.search(pattern);
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

  async updateApartment(req: Request, res: Response) {}
}
