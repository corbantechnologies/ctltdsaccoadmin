# Sprout SACCO: Administrator’s Onboarding & Migration Guide

Welcome to the Sprout SACCO platform! This guide is designed to assist you in migrating your SACCO’s data and setting up the system for the first time. 

Migration is a critical phase. To ensure data integrity and a smooth transition, we must follow a specific **System Configuration Sequence**.

---

## 🛠 Phase 1: Setting the Foundation (System Config)

Before you can import members or record balances, you must define the "Rules of the House." This is done in the **System Setup** section of your dashboard.

### 🏁 Setup Sequence
Follow this exact order to avoid dependency errors:
1. **General Ledger (Chart of Accounts)**
2. **Payment Accounts**
3. **Fee Types**
4. **Loan Products**
5. **Saving Products**

---

### 1. General Ledger (The Engine) 🏦
The General Ledger (GL) is the heart of the system. Every cent moved in the platform must have a home in the GL.

*   **What to do:** Create your Chart of Accounts.
*   **Categories:** 
    *   `ASSET`: Cash at bank, M-Pesa balances, and Loan Receivables (Principal).
    *   `LIABILITY`: Member savings, Share capital, and Payables.
    *   `EQUITY`: Retained earnings and Reserves.
    *   `REVENUE`: Interest income, Penalty income, and Fee income.
    *   `EXPENSE`: Interest expense and Operating costs.
*   **💡 Pro-Tip:** Use a standard numbering system (e.g., Assets start with 1, Liabilities with 2) to keep your reports organized.

### 2. Payment Accounts (The Channels) 💳
These are the touchpoints where money enters or leaves the SACCO (e.g., your I&M Bank account or Safaricom Paybill).

*   **What to do:** Define each physical account you use.
*   **Linking:** Each Payment Account **must** be linked to an `ASSET` GL account.
*   **Example:** "Main Bank Account" → GL Code `100101` (Cash at Bank).

### 3. Fee Types (The Extras) 🎟
Fees handle one-time or recurring charges like Membership Registration, Share Capital contributions, or specific penalties.

*   **What to do:** List all fees members are expected to pay.
*   **Key Settings:**
    *   `Apply to Everyone`: If checked, the system will automatically expect this fee from every new member.
    *   `GL Account`: Link this to a `REVENUE` or `LIABILITY` account (e.g., Share Capital is a Liability, Registration Fee is Revenue).

### 4. Loan Products (Lending Rules) 📈
This defines how you lend money to members. 

*   **What to do:** Create products like "Short Term Loan," "Emergency Loan," or "Development Loan."
*   **Critical Mappings:** You must tell the system where to track four things for every loan:
    1.  `Principal Asset`: The GL account tracking the money you lent out.
    2.  `Interest Revenue`: The GL account tracking the profit from interest.
    3.  `Penalty Revenue`: The GL account for late payment charges.
    4.  `Processing Fee Revenue`: The GL account for the upfront processing fee.
*   **Calculation Methods:** Choose between `Flat-rate` (calculated on total amount) or `Reducing Balance` (interest decreases as the member pays).

### 5. Saving Products (Deposit Rules) 💰
Define where members store their money.

*   **What to do:** Create types like "Main Savings," "Education Fund," or "Merry-go-round."
*   **Guaranteeing:** Check the `Can Guarantee` box if this savings type can be used as collateral for a loan.
*   **GL Mapping:** Link to a `LIABILITY` GL account (since this is money the SACCO owes to the member).

---

---

## 👥 Phase 2: Member Migration

Now that your system "rules" are set, it's time to bring in your members. You can find these options under the **Members** section or the **Migration Hub**.

There are three ways to add members to the platform:

### 1. Single Member Invite (Manual) 👤
Best for adding individual members one-by-one or testing the system.
*   **Process:** Enter the member's personal details (Name, Email, Phone, ID Number) and click "Invite."
*   **Result:** The member will receive an email to activate their account and set a password.

### 2. Bulk Entry Form (Quick Batch) 📝
Best for small groups of members (up to **15 at a time**).
*   **Process:** A grid-like form allows you to type in multiple members' details quickly on a single page.
*   **Limit:** This form is optimized for 15 entries to ensure speed and accuracy.

### 3. CSV File Upload (Mass Migration) 📁
Best for migrating your entire existing member register.
*   **Process:** Download the **Member Migration Template** (CSV), fill it with your member data, and upload it.
*   **Template:** Ensure you use the official template provided in the "Bulk Upload" section to avoid formatting errors.
*   **💡 Pro-Tip:** Open the CSV in Excel, fill in your data, and save it as "CSV (Comma delimited)" before uploading.

---

## 💰 Phase 3: Savings & Fees Migration

Once your members are registered, you need to migrate their existing financial balances—what they have saved and what they owe in fees (e.g., unpaid Share Capital or Registration fees).

Similar to member registration, you have three flexible options:

### 1. Single Transaction 🎯
Best for one-off corrections or adding balances for a few members.
*   **Savings:** Go to **Saving Deposits** and create a "Deposit" for the member. Use a reference like "MIGRATION_OPENING_BAL."
*   **Fees:** Go to **Fee Payments** and record a payment or charge for a specific member.

### 2. Bulk Entry Form (Batch Posting) 📑
Best for manually entering balances from a paper list or small spreadsheet.
*   **Process:** Use the multi-row form to enter Member Numbers and their corresponding balances in one go.
*   **Note:** This is perfect for the 15-member batch processing mentioned in Phase 2.

### 3. Bulk CSV Update (Mass Balance Upload) 🚀
The fastest way to move thousands of balances at once.
*   **Process:**
    1.  Download the **Savings/Fees Migration Template**.
    2.  Match Member Numbers with their current balances.
    3.  Upload to the respective section (**Saving Deposits** or **Fee Payments**).
*   **💡 Pro-Tip:** Ensure the "Member Number" in your CSV exactly matches the Member Number in Sprout to avoid orphaned transactions.

---

## 🏦 Phase 4: Loan Migration (Critical)

Migrating existing loans is the most complex part of onboarding. You have two distinct paths depending on how much automation and visibility you want to give your members.

### Option 1: Bulk Loan Application (Recommended) 🚀
Use this if you want the loan to behave like a native Sprout loan.
*   **The Concept:** You create a "Bulk Loan Application" where the **Book Outstanding Balance** is treated as the **Principal**.
*   **Advantages:**
    *   **Automation:** Sprout automatically generates a repayment schedule.
    *   **Visibility:** Members can track their loan, see their balance, and view their schedule in the Member Portal.
    *   **Accounting:** All repayments hit the General Ledger (GL) automatically.
    *   **Life Cycle:** You can track disbursements, payments, and penalties normally.

### Option 2: Legacy Loan Migration (Manual Bypass) 📜
Use this for old, complicated loans that don't fit into standard products or if you just want a quick record without automation.
*   **The Concept:** These are "Existing Loans" that bypass the standard loan machinery.
*   **Disadvantages:**
    *   **No Schedule:** The system does not generate a repayment schedule.
    *   **Invisible to Members:** Members cannot track these loans in their portal.
    *   **Manual Accounting:** Transactions do **not** hit the GL automatically. The admin must manage everything manually.
*   **Use Case:** Only recommended for loans that are almost fully repaid or "bad debt" you just want to track for recovery.

---

---

## 🔄 Phase 4 (Continued): The Loan Lifecycle

Beyond migration, you will manage day-to-day loan applications initiated by your members. Here is how the "dance" between members and admins works in Sprout:

### 1. The Application & Amendment Loop ➰
*   **Member Starts:** A member applies for a loan.
*   **Requesting Changes:** If the terms aren't quite right, the member can **Submit for Amendment**.
*   **Admin Review:** You (the Admin) review and adjust the terms (amount, rate, etc.) and submit the amendment back to them.
*   **Member Decision:**
    *   **Reject:** The application ends immediately.
    *   **Accept:** The process continues.

### 2. Guarantees & Final Submission 🤝
*   **Collateral Check:** Sprout checks if the loan is fully covered by the member's own savings.
*   **Guarantors:** If it's **not fully guaranteed**, the member must invite other members to act as guarantors.
*   **Final Submission:** Once the loan is 100% guaranteed, the member sends it for your **Final Approval**.

### 3. Approval & Disbursement 💸
*   **Final Verdict:** You review the fully-guaranteed application and **Approve** or **Decline**.
*   **Disbursement:** After approval, you trigger the **Disburse** action to officially fund the loan.

### 4. Ongoing Loan Management 🛠
Once a loan is active, you can manage it from the **Member Detail Page**:
*   **Access:** Search for the member → Click their name → Select the specific loan.
*   **Penalty:** Trigger a manual penalty for policy violations.
*   **Payments:** Log a manual payment if they pay via cash/cheque.
*   **📊 Accounting:** Sprout automatically logs these management actions to your General Ledger.

---

## 📊 Phase 5: Reports & Validation

Your data migration is complete! Now you can verify everything using Sprout's reporting engine.

### 1. Member-Specific Reports 👤
Need to see how a specific person is doing?
*   **Where:** Visit the **Member Detail Page**.
*   **What:** View individual statements, savings history, and detailed loan performance for that specific member.

### 2. SACCO-Wide Reports 🏛
View the overall health of your institution.
*   **Where:** Navigate to the main **Reports** page.
*   **What:**
    *   **Financial Statements:** Trial Balance, Balance Sheets, and Profit & Loss.
    *   **Portfolio Reports:** Total Savings, Loan Aging reports, and M-Pesa transaction logs.

---

## 🎉 Migration Complete
Congratulations! You have successfully onboarded your SACCO to Sprout. Your foundation is solid, your members are in, and your books are balanced.

> [!TIP]
> **Check your Trial Balance daily** during the first week of adoption to ensure all automated entries align with your expectations.



