import { useRouter } from 'next/router';

export default ({ slug, dan }: { slug: string; dan: string }): JSX.Element => {
  const { query } = useRouter();

  return (
    <div>
      <h1>Welcome to multi dynamic page</h1>
      <p>
        You are welcome into <span>{dan}</span> <span>{slug}</span>
      </p>
      <p>
        Query is <>{JSON.stringify(query)}</>
      </p>
    </div>
  );
};

export const getStaticProps = ({
  params,
}: {
  params: { dan: string; slug: string };
}): Record<string, unknown> => {
  return {
    props: { slug: params.slug, dan: params.dan },
  };
};

export const getStaticPaths = (): Record<string, unknown> => {
  return {
    paths: ['/multi/tip/top', '/multi/top/tip'],
    fallback: 'blocking',
  };
};
