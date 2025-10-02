import React from "react";
import AccountProf from "../components/AccountProf";
import AccountSettCourses from "../components/AccountSettCourses";

const AccountSettingPage = () => {
  return (
    <>
      <AccountProf instructor={true} />
      <AccountSettCourses />
    </>
  );
};

export default AccountSettingPage;
