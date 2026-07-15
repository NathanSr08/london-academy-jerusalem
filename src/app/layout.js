import "./globals.css";

export const metadata = {
  title: "London Academy Jerusalem — Elite English & Maths Tutoring",
  description:
    "Boutique British tutoring for young learners (ages 4–10) in Jerusalem. English & Mathematics, in-person or online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
