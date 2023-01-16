import { NextFunction, Request, Response } from 'express';

import { TagsService } from '@/services/tags.service';

export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  async getAutocomplete(req: Request, res: Response, next: NextFunction) {
    try {
      let { query } = req.query as { query: string };
      query = query.toLowerCase().trim();

      if (query === '') {
        res.json([]);
        return;
      }

      const tags = await this.tagsService.search(query);
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }
}
