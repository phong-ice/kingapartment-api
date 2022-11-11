import App from './app';
import 'dotenv/config';
import AdminController from './resource/admin/admin.controller';
import ClientController from './resource/client/client.controller';

const app = new App(
  [new AdminController(), new ClientController()],
  Number(process.env.PORT) || 3000
);
app.listen();
