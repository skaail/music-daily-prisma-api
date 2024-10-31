import express from 'express';
import { albumRoute } from './album';
import { bandaRoute } from './banda';

export const routes = express.Router();

routes.use(albumRoute)
routes.use(bandaRoute)