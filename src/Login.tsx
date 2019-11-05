import React, { useContext } from "react";
import { Formik } from "formik";
import { login as doLogin, getGraphqlError } from "./lib";
import { AppContext } from "./App";

export const Login: React.FC = () => {
  const { updateAuth, updateError } = useContext(AppContext);

  return (
    <div>
      <Formik
        initialValues={{ username: "admin", password: "dodol123" }}
        validate={(values: any) => {
          const errors: any = {};
          if (!values.username) {
            errors.username = "Required";
          }
          if (!values.password) {
            errors.password = "Required";
          }
          return errors;
        }}
        onSubmit={async (values: any, { setSubmitting }: any) => {
          try {
            const res = await doLogin(values.username, values.password);
            updateAuth(res);
          } catch (error) {
            const err = getGraphqlError(error);
            console.log("ERROR", { err });
            updateError(err);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting
        }: any) => (
          <form onSubmit={handleSubmit}>
            <input
              name="username"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
            />
            {errors.username && touched.username && errors.username}
            <input
              type="password"
              name="password"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
            />
            {errors.password && touched.password && errors.password}
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};
