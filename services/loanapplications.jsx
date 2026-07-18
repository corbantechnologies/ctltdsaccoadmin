// Flow

// Member applies for loan: In Progress. Here they can update the loan application.
// Member submits for amendment Application status changes to Ready for Amendment.
// Admin amends loan application: Application status changes to Amended.
// Member reviews amendment. Can accept or reject
//      If accepts: status changes to In Progress if loan is not fully covered. Here they apply for guarantors; if they accept and fully cover, it changes to Ready for Submission or it changes to Ready for Submission if loan is fully covered.
//      If rejects: status changes to Rejected. Application ends here
// Once status is Ready for Submission, member submits the loan application for approval.
// Admin reviews the loan application. Can approve or decline.
//      If approves: status changes to Approved. Loan application ends here.
//      If declines: status changes to Declined. Loan application ends here.
// A Disbursed loan application is a loan that has been disbursed to the member. No further action can be taken on it.
// Status changes are automatically done by the system except for the following:
//      1. Member accepting or cancelling amendment.
//      2. Admin approving or declining loan application.

"use client"
import { apiActions, apiMultipartActions } from "@/tools/axios"

export const createLoanApplication = async (values, token) => {
    const response = await apiActions?.post("/api/v1/loanapplications/", values, token)
    return response?.data || {}
}

export const getLoanApplications = async (token) => {
    const response = await apiActions?.get("/api/v1/loanapplications/", token)
    return response?.data?.results || []
}

export const getLoanApplicationDetail = async (reference, token) => {
    const response = await apiActions?.get(`/api/v1/loanapplications/${reference}/`, token)
    return response?.data || {}
}

export const updateLoanApplication = async (reference, values, token) => {
    await apiActions?.patch(`/api/v1/loanapplications/${reference}/`, values, token)
}

export const submitForAmendment = async (reference, token) => {
    await apiActions?.post(`/api/v1/loanapplications/${reference}/submit-amendment/`, {}, token)
}

export const amendLoanApplication = async (reference, values, token) => {
    // Done by admin. 
    // Basically updates the loan application: requested_amount can be changed.
    // Allows the admin to draft and preview the changes before finalizing.
    // Allows them to check the schedules
    await apiActions?.patch(`/api/v1/loanapplications/${reference}/amend/`, values, token)
}

export const finalizeLoanAmendment = async (reference, values, token) => {
    // Done by admin.
    // Basically updates the loan application: requested_amount can be changed.
    // If it is okay with the admin, they just leave the requested_amount as it is.
    // they have to always write an amendment note: amendment_note whether the loan application is changed or not.
    await apiActions?.patch(`/api/v1/loanapplications/${reference}/finalize-amendment/`, values, token)
}

export const acceptAmendment = async (reference, token) => {
    // Done by member. 
    // This action updates the loan application to In Progress or Ready for Submission
    // In Progress: loan application is not fully covered by the member's savings so he/she needs to request for guarantee.
    // Ready for Submission: loan application is fully covered by the member's savings and can proceed to the next step.
    await apiActions?.post(`/api/v1/loanapplications/${reference}/accept-amendment/`, {}, token)
}

export const rejectAmendment = async (reference, token) => {
    // Done by member. 
    // Application process is cancelled and ends here.
    await apiActions?.post(`/api/v1/loanapplications/${reference}/cancel/`, {}, token)
}


export const submitLoanApplication = async (reference, token) => {
    // Done by member. 
    // Application process is completed and member makes the final submission for the admins to approve or decline.
    await apiActions?.post(`/api/v1/loanapplications/${reference}/submit/`, {}, token)
}

export const approveLoanApplication = async (reference, token) => {
    // Done by admin. 
    // Application process is completed and member makes the final submission for the admins to approve or decline.
    await apiActions?.patch(`/api/v1/loanapplications/${reference}/status/`, {
        status: "Approved"
    }, token)
}

export const rejectLoanApplication = async (reference, token) => {
    // Done by admin. 
    // Application process is completed and member makes the final submission for the admins to approve or decline.
    await apiActions?.patch(`/api/v1/loanapplications/${reference}/status/`, {
        status: "Declined"
    }, token)
}

// Admin Functions
export const adminCreateLoanApplication = async (values, token) => {
    // Done by admin.
    // Application process is approved and awaiting disbursement.
    const response = await apiActions?.post(
        "/api/v1/loanapplications/admin/create/",
        values,
        token
    )
    return response?.data || {}
}

// Bulk Functions
export const bulkCreateLoanApplications = async (values, token) => {
    await apiActions?.post("/api/v1/loanapplications/admin/bulk/create/", values, token);
};

export const bulkUploadLoanApplications = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/loanapplications/admin/bulk/upload/", values, token);
};

export const downloadLoanApplicationsTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/loanapplications/admin/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "loan_applications_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};