import express from 'express';
import logger from './utils/logging';

import { PORT } from './utils/configs';

import views from './views';
import client from './client';

logger.info('Starting server...');

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));

app.use('/', views);
app.use('/', client);

app.listen(PORT, () => {
	logger.info(`Server started on port ${PORT}`);
});
