import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app brand", () => {
  render(<App />);
  const brand = screen.getByText(/COMMERCEPRO\/\/RETRO/i);
  expect(brand).toBeInTheDocument();
});
