import "@/../styles/style.scss";
import Header from "@/components/Header";

export const metadata = {
  title: "TogoID",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
