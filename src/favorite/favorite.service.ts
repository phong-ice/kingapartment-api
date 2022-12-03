import favoriteModel from './favorite.model';

export default class FavoriteService {
  private favoriteModel = favoriteModel;

  public addApartmentFavorite(_email: string, idAparment: string) {
    return this.favoriteModel.create({
      email: _email,
      idApartment: idAparment,
    });
  }

  public checkApartmentFavorite(_email: string, idAparment: string) {
    return this.favoriteModel.findOne({
      idApartment: idAparment,
      email: _email,
    });
  }

  public removeApartmentFavorite(_idApartment: string, _email: string) {
    return this.favoriteModel.findOneAndDelete({
      idApartment: _idApartment,
      email: _email,
    });
  }

  public getListApartmentFavorite(_email: string) {
    return this.favoriteModel.find({
      email: _email,
    });
  }
}
