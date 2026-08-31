import { useEffect } from "react";

export function useLandingReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".landing-story [data-reveal]");

    if (typeof IntersectionObserver === "undefined") {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12%", threshold: 0.16 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}
