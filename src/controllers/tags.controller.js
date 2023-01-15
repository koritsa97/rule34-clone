import Tag from '../models/Tag.js';

export class TagsController {
  async getAutocomplete(req, res, next) {
    try {
      const { query } = req.query;
      const tags = await Tag.find({
        name: {
          $regex: query,
          $options: 'i',
        },
      });

      res.json(query === '' ? [] : tags);
    } catch (error) {
      next(error);
    }
  }
}
