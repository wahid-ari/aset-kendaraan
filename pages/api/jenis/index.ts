import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { getSessionToken, supabase, writeLogs } from '@/libs/supabase';

const schema = z.object({
  nama: z.string().min(1, { message: 'Nama tidak boleh kosong' }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query } = req;
  const header = req.headers.authorization;
  const token = req.headers.authorization?.split(' ')[1] || '';

  switch (method) {
    case 'GET':
      if (!query.id) {
        const { data } = await supabase.from('aset_jenis').select(`*`).order('id');
        res.status(200).json(data);
        return;
      } else {
        const { data } = await supabase.from('aset_jenis').select(`*`).eq('id', query.id).order('id');
        res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
        res.status(200).json(data);
      }
      break;

    case 'POST':
      // Check session
      // const sessionPost = await getSessionToken(res, header, token);
      // if (sessionPost) {
      const isValid = schema.safeParse(body);
      if (!isValid.success) {
        res.status(422).json({ message: isValid?.error?.issues });
        return;
      } else {
        const { data } = await supabase.from('aset_jenis').select(`nama`).eq('nama', body.nama).single();
        if (data == null) {
          const { error } = await supabase.from('aset_jenis').insert([
            {
              nama: body.nama,
            },
          ]);
          if (error) {
            res.status(422).json({ message: error.message });
            return;
          }
          // Write logs
          // const errorLogs = await writeLogs(sessionPost.user_id, 'create', 'nama');
          // if (errorLogs) {
          //   res.status(422).json({ message: error.message });
          //   return;
          // }
          res.status(200).json({ message: 'Success add jenis' });
          return;
        } else {
          res.status(422).json({ message: 'Jenis sudah ada' });
          return;
        }
        // }
      }
      break;

    case 'PUT':
      // Check session
      // const sessionPut = await getSessionToken(res, header, token);
      // if (sessionPut) {
      console.log(body);
      const isValidPut = schema.safeParse(body);
      if (!isValidPut.success) {
        res.status(422).json({ message: isValidPut?.error?.issues });
        return;
      } else {
        const { data } = await supabase.from('aset_jenis').select(`nama`).eq('nama', body.nama).single();
        if (data == null) {
          const { error } = await supabase
            .from('aset_jenis')
            .update({
              nama: body.nama,
            })
            .eq('id', body.id);
          if (error) {
            res.status(422).json({ message: error.message });
            return;
          }
          // Write logs
          // const errorLogs = await writeLogs(sessionPut.user_id, 'update', 'nama', body.id);
          // if (errorLogs) {
          //   res.status(422).json({ message: error.message });
          //   return;
          // }
          res.status(201).json({ message: 'Success update jenis' });
          return;
        } else {
          res.status(422).json({ message: 'Jenis sudah ada' });
          return;
        }
      }
      // }
      break;

    case 'DELETE':
      // Check session
      // const sessionDelete = await getSessionToken(res, header, token);
      // if (sessionDelete) {
      if (!query.id) {
        res.status(422).json({ message: 'Id required' });
        return;
      } else {
        const { error } = await supabase.from('aset_jenis').delete().eq('id', query.id);
        if (error) {
          res.status(422).json({ message: error.message, detail: error.details });
          return;
        }
        // Write logs
        // const errorLogs = await writeLogs(sessionDelete.user_id, 'delete', 'nama', query.id);
        // if (errorLogs) {
        //   res.status(422).json({ message: error.message });
        //   return;
        // }
        res.status(200).json({ message: 'Success delete jenis' });
        return;
      }
      // }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
