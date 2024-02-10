import Head from "next/head";
import Script from "next/script";

const Header = () => (
  <div>
    <Head>
      <title>TogoID</title>
      <link rel="icon" href="/favicon.ico" />
      <meta
        property="og:image"
        content="https://togoid.dbcls.jp/images/ogp.png"
      />
      <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
      <link
        rel="apple-touch-icon"
        sizes="114x114"
        href="/apple-icon-114x114.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="120x120"
        href="/apple-icon-120x120.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="144x144"
        href="/apple-icon-144x144.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href="/apple-icon-152x152.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/favicon-96x96.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/manifest.json" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
      <meta name="theme-color" content="#ffffff" />
    </Head>
    <Script
      src="https://dbcls.rois.ac.jp/DBCLS-common-header-footer/v2/script/common-header-and-footer.js"
      id="common-header-and-footer__script"
      data-show-footer="true"
      data-show-footer-license="true"
      data-show-footer-links="true"
      data-width="auto"
      data-color="mono"
      data-license-type="none"
    />
    <header className="header">
      <h1 className="header__title">
        <a href="/">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 336.8 122.4"
            style={{
              enableBackground: "new 0 0 336.8 122.4",
            }}
            xmlSpace="preserve"
          >
            <g>
              <g>
                <path
                  className="st0"
                  d="M124,109.2c-17.6,0-26.8,13.2-57.2,13.2C30,122.4,0,98.8,0,61.2C0,23.6,30,0,66.8,0
			c30.4,0,39.6,13.2,57.2,13.2c17.6,0,26.8-13.2,57.2-13.2C218,0,248,23.6,248,61.2s-30,61.2-66.8,61.2
			C150.8,122.4,141.6,109.2,124,109.2z"
                />
              </g>
              <path
                className="st1"
                d="M165.6,61.2c0,26.4-18.8,48-41.6,48s-41.6-21.6-41.6-48s18.8-48,41.6-48C147.2,13.2,165.6,34.8,165.6,61.2z"
              />
              <g>
                <path
                  className="st2"
                  d="M43.2,84.4h-12v-36h-10v-10h32v10h-10V84.4z"
                />
                <path
                  className="st2"
                  d="M112.4,60.4c0,14.8-10.8,25.6-25.6,25.6S61.2,75.6,61.2,60.4c0-14,12.4-24,25.6-24
			C100,36.8,112.4,46.4,112.4,60.4z"
                />
                <path
                  className="st2"
                  d="M170.4,58.8c0,6.8-0.8,12.4-4.8,18.4c-4.4,6.4-11.2,9.2-19.2,9.2c-14.4,0-24.8-10-24.8-24.4
			c0-15.2,10-24.8,25.2-24.8c9.6,0,16.8,4.4,20.8,12.8L156,54.8c-1.6-4.4-5.2-7.2-10-7.2c-8,0-12,7.6-12,14.8s4.4,14.4,12.4,14.4
			c5.2,0,9.2-2.8,9.6-8h-10v-9.6h24.4V58.8z"
                />
                <path
                  className="st2"
                  d="M230.8,60.4c0,14.8-10.8,25.6-25.6,25.6c-14.8,0-25.6-10.4-25.6-25.6c0-14,12.4-24,25.6-24
			C218.4,36.8,230.8,46.4,230.8,60.4z"
                />
              </g>
              <g>
                <path className="st3" d="M282,84.4h-12V38h12V84.4z" />
                <path
                  className="st3"
                  d="M296,38h17.2c12.8,0,23.6,10,23.6,23.2S326,84.4,313.2,84.4H296V38z M308,74h2.8c7.2,0,13.2-4,13.2-12.8
			c0-8.4-5.6-12.8-13.2-12.8H308V74z"
                />
              </g>
            </g>
          </svg>
        </a>
      </h1>
    </header>
  </div>
);

export default Header;
