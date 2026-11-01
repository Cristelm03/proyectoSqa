//import useState
import { useState } from "react";

//import UserForm
import UserForm from "../../../components/UserForm";

//import useNavigate
import { useNavigate } from "react-router-dom";

//import js cookie
import Cookies from "js-cookie";

//import api
import api from "../../../services/api";

//get token from cookies
const token = Cookies.get("token");

export default function UsersCreate() {
  //useNavigate
  const navigate = useNavigate();

  //define state
  const [user, setUser] = useState({ name: "", email: "", password: "" });

  //state validation
  const [validation, setValidation] = useState([]);

  //function "handleChange": update one field of the form
  const handleChange = (field, value) => {
    setUser((current) => ({ ...current, [field]: value }));
  };

  //function "storeUser"
  const storeUser = async (e) => {
    e.preventDefault();

    //call api
    api.defaults.headers.common["Authorization"] = token;
    await api
      .post("/api/users/create", user)
      .then(() => {
        //redirect ke halaman users
        navigate("/admin/users");
      })
      .catch((error) => {
        //assign error to state validation
        setValidation(error.response.data);
      });
  };

  return (
    <UserForm
      title="ADD USER"
      submitLabel="SAVE"
      values={user}
      errors={validation.errors}
      onChange={handleChange}
      onSubmit={storeUser}
    />
  );
}
