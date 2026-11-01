//import PropTypes to validate the props
import PropTypes from "prop-types";

//import SidebarMenu
import SidebarMenu from "./SidebarMenu";

//import FormField
import FormField from "./FormField";

//page with the user form, shared by the "create user" and "edit user" views
export default function UserForm({ title, submitLabel, values, errors, onChange, onSubmit }) {
  return (
    <div className="container mt-5 mb-5">
      <div className="row">
        <div className="col-md-3">
          <SidebarMenu />
        </div>
        <div className="col-md-9">
          <div className="card border-0 rounded shadow-sm">
            <div className="card-header">{title}</div>
            <div className="card-body">
              {errors && (
                <div className="alert alert-danger mt-2 pb-0">
                  {errors.map((error, index) => (
                    <p key={index}>
                      {error.path} : {error.msg}
                    </p>
                  ))}
                </div>
              )}
              <form onSubmit={onSubmit}>
                <FormField
                  id="name"
                  label="Full Name"
                  placeholder="Full Name"
                  value={values.name}
                  onChange={(value) => onChange("name", value)}
                />
                <FormField
                  id="email"
                  type="email"
                  label="Email address"
                  placeholder="Email Address"
                  value={values.email}
                  onChange={(value) => onChange("email", value)}
                />
                <FormField
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Password"
                  value={values.password}
                  onChange={(value) => onChange("password", value)}
                />

                <button type="submit" className="btn btn-sm btn-primary">
                  {submitLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

UserForm.propTypes = {
  title: PropTypes.string.isRequired,
  submitLabel: PropTypes.string.isRequired,
  values: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
  }).isRequired,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      msg: PropTypes.string,
    })
  ),
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
