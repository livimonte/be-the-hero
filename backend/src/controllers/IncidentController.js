const connection = require('../database/dbconnection');

module.exports = {
  async index(req, res) {
    try {
      const { page = 1 } = req.query;
      const [count] = await connection('incidents').count();

      const incidents = await connection('incidents')
        .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
        .limit(5)
        .offset((page - 1) * 5)
        .select([
          'incidents.*',
          'ongs.name as ong_name',
          'ongs.email as ong_email',
          'ongs.whatsapp as ong_whatsapp',
          'ongs.city as ong_city',
          'ongs.uf as ong_uf',
        ]);

      res.header('X-Total-Count', count['count(*)']);

      return res.json(incidents);
    } catch (error) {
      return res.status(400).json({ error: 'Bad Request' });
    }
  },

  async create(req, res) {
    try {
      const { title, description, value } = req.body;
      const ong_id = req.headers.authorization;

      const [id] = await connection('incidents').insert({
        ong_id,
        title,
        description,
        value,
      });

      return res.json({ id });
    } catch (error) {
      return res.status(400).json({ error: 'Bad Request' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const ong_id = req.headers.authorization;
      const incident = await connection('incidents')
        .where('id', id)
        .select('ong_id')
        .first();

      if (!incident) {
        return res.status(404).json({ error: 'Incident not found.' });
      }

      if (incident.ong_id !== ong_id) {
        return res.status(401).json({ error: 'Operation not permitted.' });
      }

      await connection('incidents').where('id', id).delete();

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Bad Request' });
    }
  },
};
