import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import Controller from './utils/interface/controller.interface';
import 'dotenv/config';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import path from 'path';
import cookieParser from 'cookie-parser';
import { passTokenCookieToHeader } from './middleware/jwt.middleware';
import { createServer } from 'http';
import { Server } from 'socket.io';
import AdminController from './resource/admin/admin.controller';
import ClientController from './resource/client/client.controller';
import NotificationService from './resource/notification/notification.service';

export default class App {
  private app: Application = express();
  private port: number;
  private httpServer = createServer(this.app);
  private io = new Server(this.httpServer, {
    /* options */
  });
  private notiService: NotificationService;
  private monthNames = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  constructor(port: number = 3000) {
    this.notiService = new NotificationService();
    this.port = port;
    this.initialiseConfig();
    this.initialiseMongoDB();
    this.initialiseController();
  }

  initialiseConfig() {
    this.app.use(express.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.engine('.hbs', engine({ extname: '.hbs' }));
    this.app.set('view engine', '.hbs');
    this.app.set('views', path.join(__dirname, '/../views'));
    this.app.use(express.static(path.join(__dirname, '/../public')));
    this.app.use(cookieParser());
    this.app.use('/', passTokenCookieToHeader);
  }
  private initialiseController() {
    const controllers: Controller[] = [
      new AdminController(),
      new ClientController(),
    ];
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });

    this.app.use('/', (req: Request, res: Response) => {
      try {
        res.status(200).json({
          status: 'Success',
          message: 'Welcom',
        });
      } catch (err) {
        res.status(400).json({
          status: 'Failed',
          message: 'I in busy',
        });
      }
    });
  }
  private initialiseMongoDB() {
    const mongoodbUri = String(process.env.URL_MONGODB);
    const connectionParams = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    };
    mongoose
      .connect(mongoodbUri)
      .then((result) => {
        console.log('Connect to mongoDB success');
      })
      .catch((err) => {
        console.log('Connect mongoDB has been failed', err);
      });
    mongoose.connection.on('error', (err) => {
      console.log('Connect mongoDB has been failed', err);
    });
  }

  private getTextCurrentTime(): string {
    var date_obj = new Date();
    let date = date_obj.getDate();
    let dateText = date < 10 ? '0' + date : date;
    let month = this.monthNames[date_obj.getMonth()];
    let hour = date_obj.getHours();
    let hourText = hour < 10 ? '0' + hour : hour;
    let minute = date_obj.getMinutes();
    let minuteText = minute < 10 ? '0' + minute : minute;
    return `${hourText}:${minuteText} - ${dateText} ${month} ${date_obj.getFullYear()}`;
  }

  public listen() {
    this.io.on('connection', (socket) => {
      socket.on('KEY_NOTIFICATION', (arg) => {
        var _time = this.getTextCurrentTime();
        arg.time = _time;
        this.notiService.saveNotification(arg.title, arg.message, _time);
        socket.broadcast.emit('notification', arg);
      });
    });
    this.io.on('disconnect', () => {
      console.log('disconnect');
    });
    this.httpServer.listen(this.port);
    // this.app.listen(this.port, () => {
    //   console.log(`App running at port ${this.port}`);
    // });
  }
}
