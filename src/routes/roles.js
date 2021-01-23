"user strict";

import express from 'express';
import { Players } from '../server/entities/index.js';

const ROLES = [];

Object.keys(Players).forEach(key => {
  let ctor = Players[key];
  let Role = ctor.toString().split(' ')[1];
  let role = Role.charAt(0).toLowerCase() + Role.substring(1);
  ROLES.push({type:role, name:Role})
});

export default function (app)  {
  let router = express.Router();
  router.get('/', function (req, res, next) {
    res.json(ROLES);
  });

  app.use("/roles", router);
}