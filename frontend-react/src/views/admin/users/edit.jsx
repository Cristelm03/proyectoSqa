//import useState dan useEffect
import { useState, useEffect } from "react";

//import UserForm
import UserForm from "../../../components/UserForm";

//import useNavigate
import { useNavigate, useParams } from "react-router-dom";

//import js cookie
import Cookies from "js-cookie";

//import api
import api from "../../../services/api";

//get token from cookies
const token = Cookies.get("token");

export default function UsersEdit() {
  //useNavigate
  const navigate = useNavigate();

  //destruct ID
  const { id } = useParams();

  //define state
  const [user, setUser] = useState({ name: "", email: "", password: "" });

  //state validation
  const [validation, setValidation] = useState([]);

  //hook useEffect: fetch the user detail again whenever the ID in the URL changes
  useEffect(() => {
    api
      .get(`/api/users/find/${id}`)
      .then((response) => {
        //assign to state
        const { name, email } = response.data.data;
        setUser((current) => ({ ...current, name, email }));
      })
      .catch((error) => {
        console.error("There was an error fetching the user!", error);
      });
  }, [id]);

  //function "handleChange": update one field of the form
  const handleChange = (field, value) => {
    setUser((current) => ({ ...current, [field]: value }));
  };

  //method "updateUser"
  const updateUser = async (e) => {
    e.preventDefault();

    //call api
    api.defaults.headers.common["Authorization"] = token;
    await api
      .put(`/api/users/update/${id}`, user)
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
      title="EDIT USER"
      submitLabel="UPDATE"
      values={user}
      errors={validation.errors}
      onChange={handleChange}
      onSubmit={updateUser}
    />
  );
}
