//import PropTypes to validate the props
import PropTypes from "prop-types";

//label + input pair; onChange receives the new value as a string
export default function FormField({ id, label, type = "text", placeholder, value, onChange }) {
  return (
    <div className="form-group mb-3">
      <label htmlFor={id} className="mb-1 fw-bold">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
        id={id}
        placeholder={placeholder}
      />
    </div>
  );
}

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
