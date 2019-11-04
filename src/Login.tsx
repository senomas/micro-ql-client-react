import React, { useContext } from "react";
import { Formik } from "formik";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button
} from "@chakra-ui/core";
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
            <FormControl
              isRequired
              isInvalid={errors.username && touched.username}
            >
              <FormLabel htmlFor="username">User name</FormLabel>
              <Input
                id="username"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.username}
              />
              <FormErrorMessage>{errors.username}</FormErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={errors.password && touched.password}
            >
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                type="password"
                id="password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            <Button
              mt={4}
              variantColor="teal"
              isLoading={isSubmitting}
              type="submit"
            >
              Submit
            </Button>
          </form>
        )}
      </Formik>
    </div>
  );
};