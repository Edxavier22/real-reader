import { LandingPage } from "@/components/LandingPage";
import { RealReaderApp } from "@/components/RealReaderApp";

export default function Home() {
  return (
    <>
      <LandingPage />
      <section id="reader">
        <RealReaderApp />
      </section>
    </>
  );
}
