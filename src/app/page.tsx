import Nav                from "@/components/home/Nav";
import Hero               from "@/components/home/Hero";
import About              from "@/components/home/About";
import Experience         from "@/components/home/Experience";
import HorizontalProjects from "@/components/home/HorizontalProjects";
import Projects           from "@/components/home/Projects";
import Contact            from "@/components/home/Contact";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <HorizontalProjects />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
