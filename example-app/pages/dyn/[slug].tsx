import { useRouter } from 'next/router';

export default ({ slug }: { slug: string }): JSX.Element => {
  const { query } = useRouter();

  return (
    <div>
      <h1>Welcome to dynamic page</h1>
      <p>
        You are welcome into <span>{slug}</span>
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
  params: { slug: string };
}): Record<string, unknown> => {
  return {
    props: { slug: params.slug },
  };
};

export const getStaticPaths = (): Record<string, unknown> => {
  return {
    paths: ['/dyn/page1', '/dyn/page2', '/dyn/page3'],
    fallback: 'blocking',
  };
};
