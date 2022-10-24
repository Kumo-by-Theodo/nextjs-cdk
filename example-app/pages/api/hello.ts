// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { url } from 'gravatar';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name: string;
  avatar: string;
  email: string;
};

export default (req: NextApiRequest, res: NextApiResponse<Data>): void => {
  res.status(200).json({
    name: 'John Doe',
    email: typeof req.query['email'] === 'string' ? req.query.email : '',
    avatar: url(typeof req.query['email'] === 'string' ? req.query['email'] : 'random@gmail.com'),
  });
};
