import { Auth } from "./Auth";
import { useNavigate } from "react-router-dom";

const AuthRoute = () => {
  const navigate = useNavigate();

  return (
    <Auth onBack={() => navigate("/")} />
  );
};

export default AuthRoute;