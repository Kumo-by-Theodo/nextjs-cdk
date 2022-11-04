import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  id: string | string[];
};

export default (req: NextApiRequest, res: NextApiResponse<Data>): void => {
  console.log({ req });
  res.status(200).json({
    id: req.query['id'] ?? 'undefined id',
  });
};
