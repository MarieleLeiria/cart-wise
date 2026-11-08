import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PopupApp } from "@/ui/popup/PopupApp";
import "@/ui/shared/styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <PopupApp />
    </StrictMode>,
  );
}
