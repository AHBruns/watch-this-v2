import React from "react";
import { AppProps } from "next/app";
import "lib/tailwind.css";
import { SWRConfig } from "swr";
import Head from "next/head";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Yo, watch this!</title>
      </Head>
      <SWRConfig value={{}}>
        <Component {...pageProps} />
      </SWRConfig>
    </>
  );
}

export default App;
