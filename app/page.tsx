import { HomeLanding } from "@/components/home-landing";

type PageProps = {
  searchParams: Promise<{
    login?: string;
    from?: string;
    error?: string;
  }>;
};

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <HomeLanding
      loginHint={searchParams.login}
      fromPath={searchParams.from}
      error={searchParams.error}
    />
  );
}
