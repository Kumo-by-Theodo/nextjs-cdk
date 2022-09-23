import { useRouter } from 'next/router';

export default function DynSlug({ slug, dan }: { slug: string; dan: string }) {
  const { query } = useRouter();

  return (
    <div>
      <h1>Welcome to multi dynamic page</h1>
      <p>
        You are welcome into <span>{dan}</span> <span>{slug}</span>
      </p>
    </div>
  );
}

export const getStaticProps = ({ params }: { params: { dan: string; slug: string } }) => {
  return {
    props: { slug: params.slug, dan: params.dan },
  };
};

export const getStaticPaths = () => {
  return {
    paths: ['/multi/tip/top', '/multi/top/tip'],
    fallback: false,
  };
};
