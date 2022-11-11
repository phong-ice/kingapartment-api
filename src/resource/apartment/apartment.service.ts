import Apartment from './apartment.interface';
import apartmentModel from './apartment.model';

export default class ApartmentService {
  private apartmentModel = apartmentModel;

  public insertApartment(apartment: Apartment) {
    return this.apartmentModel.create(apartment);
  }

  public getAllApartment() {
    return new Promise((resolve, rejects) => {
      this.apartmentModel
        .countDocuments({})
        .then((sumDocument) => {
          this.apartmentModel
            .find({})
            .lean()
            .then((result) => {
              resolve({ result });
            })
            .catch((err) => rejects(err));
        })
        .catch((err) => rejects(err));
    });
  }

  public updateApartment(id: string, apartment: Apartment) {
    return this.apartmentModel.updateOne({ _id: id }, apartment);
  }

  public deleteApartment(id: string) {
    return this.apartmentModel.deleteOne({ _id: id });
  }

  public deleteApartmentClient(idApartment: string, idAccount: string) {
    return this.apartmentModel.findByIdAndDelete({
      _id: idApartment,
      idOwner: idAccount,
    });
  }

  public async search(pattern: string): Promise<any> {
    const condition = {
      $or: [
        { name: { $regex: pattern } },
        { address: { $regex: pattern } },
        { price: { $regex: pattern } },
        { sqrt: { $regex: pattern } },
      ],
    };
    return new Promise((resolve, rejects) => {
      this.apartmentModel
        .countDocuments({})
        .then((sumDocument) => {
          this.apartmentModel
            .find(condition)
            .then((apartments) => {
              resolve({ apartments, sumRecord: sumDocument });
            })
            .catch((err) => rejects(err));
        })
        .catch((err) => rejects(err));
    });
  }

  public getApartmentPopular(): Promise<any> {
    return new Promise((resolve, rejects) => {
      this.apartmentModel
        .countDocuments({})
        .then((sumDocument) => {
          this.apartmentModel
            .find({})
            .sort({ countVisit: -1 })
            .lean()
            .then((apartments) => {
              resolve({ result: apartments, sumApartment: sumDocument });
            })
            .catch((err) => rejects(err));
        })
        .catch((err) => rejects(err));
    });
  }

  public getApartmentById(_id: string) {
    return this.apartmentModel.findById(_id).lean();
  }

  public getApartmentByIdAccount(_id: string) {
    return this.apartmentModel.find({ idOwner: _id }).lean();
  }

  public getApartmentNearest(
    longitude: number,
    latitude: number,
    distance?: number
  ): Promise<any> {
    return new Promise(async (resolve, rejects) => {
      try {
        const location = {
          lat: latitude,
          lng: longitude,
        };
        const allApartment = await this.apartmentModel.find({}).lean();
        if (distance) {
          let apartments = allApartment.filter((e) => {
            this.getDistanceKilomet(location, { lat: e.lat, lng: e.lng }) <
              distance;
          });
          resolve({ apartments });
        } else {
          const apartments = allApartment.sort((a, b) => {
            const distance1 = this.getDistanceKilomet(location, {
              lat: a.lat,
              lng: a.lng,
            });
            const distance2 = this.getDistanceKilomet(location, {
              lat: b.lat,
              lng: b.lng,
            });
            if (distance1 < distance2) return 1;
            if (distance1 > distance2) return 0;
            return 0;
          });
          resolve({ result: apartments });
        }
      } catch (err) {
        rejects(err);
      }
    });
  }

  private getDistanceKilomet(p1: any, p2: any): number {
    const rad = 0.01746031;
    const lat1 = p1.lat * rad;
    const lng1 = p1.lng * rad;
    const lat2 = p2.lat * rad;
    const lng2 = p2.lng * rad;
    const difflng = lng2 - lng1;
    const difflat = lat2 - lat1;
    const value =
      Math.pow(Math.sin(difflat / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(difflng / 2), 2);
    return 6378.8 * (2 * Math.asin(Math.sqrt(value)));
  }
}
