import { useEffect } from "react";

export default function Font() {
  useEffect(() => {
    const el = Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
    });
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch { } };
  }, []);
  return null;
}
