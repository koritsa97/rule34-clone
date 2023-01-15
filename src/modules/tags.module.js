import { Router } from 'express';

import { TagsController } from '../controllers/tags.controller.js';

const router = Router();
const tagsController = new TagsController();

router.get(
  '/tags/autocomplete',
  tagsController.getAutocomplete.bind(tagsController)
);

export default router;
