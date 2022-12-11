import { Request, Response, Router } from 'express';
import Controller from '../../utils/interface/controller.interface';
import AccountController from '../account/account.controller';
import AdminAccount from './admin.interface';
import AdminService from './admin.service';
import { STATUS_SUCCESS, STATUS_FAILED } from '../../utils/const';
import { signAccessToken, signRefreshToken } from '../../utils/jwt_helper';
import ApartmentController from '../apartment/apartment.controller';
import { verifyAccessToken } from '../../middleware/jwt.middleware';
import ApartmentService from '../apartment/apartment.service';
import AccountService from '../account/account.service';
import NotificationService from '../notification/notification.service';
export default class AdminController implements Controller {
  public path: string = '/admin';
  public router: Router = Router();
  private adminService = new AdminService();
  private apartmentService = new ApartmentService();
  private accountService = new AccountService();
  private notificationService = new NotificationService();

  constructor() {
    this.initialiseRouter();
  }

  initialiseRouter() {
    const accountController = new AccountController(this.path);
    this.router.use(accountController.path, accountController.router);
    const apartmentController = new ApartmentController(this.path);
    this.router.use(apartmentController.path, apartmentController.router);

    this.router.get(
      '/login',
      verifyAccessToken,
      (req: Request, res: Response) => {
        if (req.body.info) {
          res.redirect('home');
        } else {
          res.render('login', { layout: false, titlePage: 'Login' });
        }
      }
    );

    this.router.get(
      '/home',
      verifyAccessToken,
      async (req: Request, res: Response) => {
        var _apartmentAdmin = 0;
        var _totalApartment = 0;
        var _totalClient = 0;
        try {
          _totalApartment = await this.apartmentService.countApartment();
          _apartmentAdmin = await this.apartmentService.countApartmentAdmin();
          _totalClient = await this.accountService.countAccount();
        } catch (e) {}
        res.render('home', {
          titlePage: 'Dashboard',
          admin: req.body.info,
          apartmentAdmin: _apartmentAdmin,
          apartmentClient: _totalApartment - _apartmentAdmin,
          totalClient: _totalClient,
        });
      }
    );

    this.router.get(
      '/notification',
      verifyAccessToken,
      async (req: Request, res: Response) => {
        this.notificationService
          .getListNotification()
          .then((listNoti) => {
            console.log(listNoti);
            res.render('notification_page', {
              titlePage: 'Notification',
              admin: req.body.info,
              notifications: listNoti,
            });
          })
          .catch((e) => {});
      }
    );

    this.router.post('/login', (req: Request, res: Response) => {
      const adminAccount = req.body as AdminAccount;
      this.adminService
        .login(adminAccount)
        .then(async (result) => {
          if (!result) {
            res.render('login', {
              layout: false,
              error: 'Username/Password not available',
            });
          } else {
            const access_token = await signAccessToken(result);
            const refresh_token = await signRefreshToken(result);
            res.cookie('access_token', access_token);
            res.cookie('refresh_token', refresh_token);
            res.redirect('home');
          }
        })
        .catch((err) => {
          res.status(400).json({ status: STATUS_FAILED, err });
        });
    });

    this.router.get('/logout', (req: Request, res: Response) => {
      res
        .cookie('access_token', '')
        .cookie('refresh_token', '')
        .render('login', { layout: false });
    });
  }
}
