import React from "react";
import { User } from "firebase/auth";
import { MainApp } from "../MainApp";

type AppRoutesProps = {
  user: User;
};

export function AppRoutes({
  user,
}: AppRoutesProps) {
  return <MainApp user={user} />;
}

export default AppRoutes;