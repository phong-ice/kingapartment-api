import AccountModel from './account.model';
import Account from './account.interface';

export default class AccountService {
  private accountModel = AccountModel;

  public async insertAccount(account: Account) {
    return this.accountModel.create(account);
  }

  public updateAccount(id: string, account: Account) {
    return this.accountModel.updateOne({ _id: id }, account);
  }

  public async getAllAccount(page: number, pageSize: number) {
    return new Promise((resolve, rejects) => {
      var _page = 1;
      var _pageSize = 10;
      if (page) _page = page;
      if (pageSize) _pageSize = pageSize;
      this.accountModel
        .countDocuments({})
        .then((sumDocument) => {
          const _totalPage = Math.ceil(sumDocument / _pageSize);
          this.accountModel
            .find({})
            .lean()
            // .skip((_page - 1) * _pageSize)
            // .limit(_pageSize)
            .then((accounts) => {
              resolve({ accounts });
            })
            .catch((err) => rejects(err));
        })
        .catch((err) => rejects(err));
    });
  }

  public async search(
    pattern: string,
    page: number = 1,
    pageSize: number = 10
  ) {
    var _page = 1;
    var _pageSize = 10;
    if (page) _page = page;
    if (pageSize) _pageSize = pageSize;
    const condition = {
      $or: [{ fullname: { $regex: pattern } }, { email: { $regex: pattern } }],
    };
    return this.accountModel.find(condition).lean();
  }

  public async findAccountById(id: string) {
    return this.accountModel.findById(id).lean();
  }

  public async getAccountByEmail(_email: string) {
    return this.accountModel.findOne({
      email: _email,
    });
  }

  public countAccount() {
    return this.accountModel.countDocuments({});
  }

  public blockAccount(idAccount: string, _isBlock: boolean) {
    this.accountModel
      .findOneAndUpdate({ _id: idAccount }, { isBock: _isBlock })
      .then((result) => {
        //console.log(`old ${result}`);
      });
  }
}
