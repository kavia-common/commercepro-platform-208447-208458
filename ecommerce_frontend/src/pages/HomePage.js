import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Simple landing that redirects to catalog.
 */
export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/catalog", { replace: true });
  }, [navigate]);

  return null;
}
