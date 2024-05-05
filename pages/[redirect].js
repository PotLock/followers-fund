import { useEffect } from "react";
import redirectLinks from "../components/data/redirectLinks";

const Redirect = () => {
  useEffect(() => {
    const url = redirectLinks[window.location.pathname.toLowerCase()];
    if (url) {
      window.location.href = url;
    } else {
      window.location.href = "/";
    }
  }, []);

  return <></>;
};
export default Redirect;
