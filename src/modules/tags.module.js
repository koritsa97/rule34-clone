import { Router } from 'express';

import { TagsController } from '../controllers/tags.controller.js';
import { TagsService } from '../services/tags.service.js';

const router = Router();
const tagsService = new TagsService();
const tagsController = new TagsController(tagsService);

router.get(
  '/tags/autocomplete',
  tagsController.getAutocomplete.bind(tagsController)
);

export default router;
