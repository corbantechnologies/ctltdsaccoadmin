"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

export const signUpSaccoAdmin = async (values) => {
  const response = await apiActions?.post(
    "/api/v1/auth/signup/system-admin/",
    values
  );
  return response;
};

// Members create their accounts
export const signUpMember = async (values) => {
  const response = await apiActions?.post(
    "/api/v1/auth/signup/member/",
    values
  );
  return response;
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------
// SACCO Admins
// Add new member
export const addMember = async (values, token) => {
  const response = await apiActions?.post(
    "/api/v1/auth/new-member/create/",
    values,
    token
  );
  return response;
};

// View all members
export const getMembers = async (token) => {
  const response = await apiActions?.get("/api/v1/auth/", token);
  return response?.data?.results || [];
};

// View member details
export const getMemberDetail = async (member_no, token) => {
  const response = await apiActions?.get(
    `/api/v1/auth/member/${member_no}/`,
    token
  );
  return response?.data;
};

// Update member roles
export const updateMemberRoles = async (member_no, values, token) => {
  const response = await apiActions?.patch(
    `/api/v1/auth/member/${member_no}/`,
    values,
    token
  );
  return response?.data;
};

// Approve members
export const approveMember = async (member_no, token) => {
  await apiActions?.patch(`/api/v1/auth/approve-member/${member_no}/`, token);
};

// download bulk members template
export const downloadBulkMembersTemplate = async (token) => {
  const response = await apiActions?.get("/api/v1/auth/new-members/bulk-create/template/download/", token);
  return response;
};

// Bulk create
export const createBulkMembers = async (values, token) => {
  const response = await apiActions?.post(
    "/api/v1/auth/new-members/bulk-create/",
    values,
    token
  );
  return response;
};

// Bulk upload
export const createBulkMembersUpload = async (formData, token) => {
  await apiMultipartActions.post("api/v1/auth/new-members/bulk-create/upload/", formData, token);
};

// Reset a member's password
export const resetMemberPassword = async (member_no, password, token) => {
  await apiActions?.patch(`/api/v1/auth/member/${member_no}/reset-password/`, password, token);
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------
// Member Views
export const getMember = async (userId, token) => {
  const response = await apiActions?.get(`/api/v1/auth/${userId}/`, token);
  return response?.data;
};

export const updateMember = async (userId, formData, token) => {
  await apiMultipartActions?.patch(`/api/v1/auth/${userId}/`, formData, token);
};

// Change Password
export const changePassword = async (values, token) => {
  await apiActions?.patch(`/api/v1/auth/password/change/`, values, token);
};

// Activate Account
export const activateAccount = async (values) => {
  await apiActions?.patch(`/api/v1/auth/password/activate-account/`, values);
};

// Forgot Password
export const forgotPassword = async (values) => {
  await apiActions?.post(`/api/v1/auth/password/forgot-password/`, values);
};

// Password Reset
export const passwordReset = async (values) => {
  await apiActions?.post(`/api/v1/auth/password/reset-password/`, values);
};