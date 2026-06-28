import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";

export function MainApp() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}