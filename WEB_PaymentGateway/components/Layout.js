import Head from "next/head";

// Wrapper tampilan berbentuk "layar HP" seperti wireframe
export default function Layout({ title, children }) {
  const pageTitle = title ? `${title} | Cafe Pintar` : "Cafe Pintar";
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Cafe Pintar - pesan makanan & minuman favoritmu" />
        <link rel="icon" href="/images/logo.svg" />
      </Head>
      <div className="app-bg">
        <main className="phone">{children}</main>
      </div>
    </>
  );
}
