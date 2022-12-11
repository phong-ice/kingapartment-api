import notificationModel from './notification.model';

export default class NotificationService {
  private notiModel = notificationModel;

  public saveNotification(_title: string, _message: string, _time: string) {
    return this.notiModel.create({
      title: _title,
      message: _message,
      time: _time,
    });
  }

  public seenNotification(_id: string) {
    return this.notiModel
      .findByIdAndUpdate(_id, {
        isSeen: true,
      })
      .then((result) => {
        //console.log(`old ${result}`);
      });
  }

  public getListNotification() {
    return this.notiModel.find({}).lean().sort({ createdAt: -1 });
  }

  public async listNotiNotSeen() {
    return this.notiModel.find({ isSeen: false }).lean();
  }
}
