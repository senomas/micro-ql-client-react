import React, { useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@material-ui/core";
import { AppContext } from "./App";

export const ErrorDialog: React.FC = () => {
  const { error, updateError } = useContext(AppContext);

  const open = !!error;

  const handleClose = () => {
    updateError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {error ? error.code || "Error" : ""}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {error ? error.message || error.code || "Unknown error" : ""}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
