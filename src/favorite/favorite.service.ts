import favoriteModel from './favorite.model';

export default class FavoriteService {
  private favoriteModel = favoriteModel;

  public addApartmentFavorite(idAccount: string, idAparment: string) {
    return this.favoriteModel.create({
      idAccount: idAccount,
      idApartment: idAparment,
    });
  }

  public removeApartmentFavorite(id: string) {
    return this.favoriteModel.findOneAndDelete({
      _id: id,
    });
  }

  public getListApartmentFavorite(idAccount: string) {
    return this.favoriteModel.find({
      idAccount: idAccount,
    });
  }
}
