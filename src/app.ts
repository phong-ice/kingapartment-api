import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import Controller from './utils/interface/controller.interface';
import 'dotenv/config';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import path from 'path';
import cookieParser from 'cookie-parser';
import { passTokenCookieToHeader } from './middleware/jwt.middleware';

export default class App {
  private app: Application = express();
  private port: number;

  constructor(controllers: Controller[], port: number = 3000) {
    this.port = port;
    this.initialiseConfig();
    this.initialiseMongoDB();
    this.initialiseController(controllers);
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
  private initialiseController(controllers: Controller[]) {
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

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App running at port ${this.port}`);
    });
  }
}
