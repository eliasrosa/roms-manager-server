const express = require('express');

/**
 * @param {import('../controllers/RomController')} controller
 */
function createRomRouter(controller) {
  const router = express.Router();

  const wrap = (fn) => (req, res, next) => fn.call(controller, req, res, next).catch(next);

  router.get('/',                     wrap(controller.list));
  router.post('/sync',                wrap(controller.sync));
  router.get('/:platform/:filename',  wrap(controller.download));

  return router;
}

module.exports = createRomRouter;
