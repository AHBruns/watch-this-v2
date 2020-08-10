import React from "react";
import { AppProps } from "next/app";
import "lib/tailwind.css";
import { SWRConfig } from "swr";

function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig value={{}}>
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default App;
