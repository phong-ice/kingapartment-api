import favoriteModel from './favorite.model';

export default class FavoriteService {
  private favoriteModel = favoriteModel;

  public addApartmentFavorite(idAccount: string, idAparment: string) {
    return this.favoriteModel.create({
      idAccount: idAccount,
      idApartment: idAparment,
    });
  }

  public removeApartmentFavorite(_idApartment: string, _idAccount: string) {
    return this.favoriteModel.findOneAndDelete({
      idApartment: _idApartment,
      idAccount: _idAccount,
    });
  }

  public getListApartmentFavorite(idAccount: string) {
    return this.favoriteModel.find({
      idAccount: idAccount,
    });
  }
}
