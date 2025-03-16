import React from "react";

interface FormButtonProps {
  buttonText: string; 
  loading: boolean; 
}

const FormButton: React.FC<FormButtonProps> = ({ buttonText, loading }) => {
  return (
    <button
      type="submit"
      className={`btn btn-primary w-100 ${loading ? "disabled" : ""}`}
      disabled={loading}
    >
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div
            className="spinner-border spinner-border-sm text-light"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default FormButton;