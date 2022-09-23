import { useRouter } from 'next/router';

export default function DynSlug({ slug }: { slug: string }) {
  const { query } = useRouter();

  return (
    <div>
      <h1>Welcome to dynamic page</h1>
      <p>
        You are welcome into <span>{slug}</span>
      </p>
    </div>
  );
}

export const getStaticProps = ({ params }: { params: { slug: string } }) => {
  return {
    props: { slug: params.slug },
  };
};

export const getStaticPaths = () => {
  return {
    paths: ['/dyn/page1', '/dyn/page2', '/dyn/page3'],
    fallback: false,
  };
};
