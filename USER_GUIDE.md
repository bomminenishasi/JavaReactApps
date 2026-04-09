# SecureBank – End User Guide

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [Accounts](#3-accounts)
4. [Open a Checking Account](#4-open-a-checking-account)
5. [Transactions](#5-transactions)
6. [Payments](#6-payments)
7. [Credit Cards](#7-credit-cards)
8. [Zelle – Send Money](#8-zelle--send-money)
9. [Credit Score](#9-credit-score)
10. [Rewards](#10-rewards)
11. [Travel](#11-travel)
12. [Benefits](#12-benefits)
13. [Profile & Settings](#13-profile--settings)
14. [Logging Out](#14-logging-out)

---

## 1. Getting Started

### Register a New Account

1. Open your browser and go to **http://localhost:3000**
2. Click **Register** on the login page
3. Fill in:
   - First Name
   - Last Name
   - Email Address
   - Password *(min 8 characters, must include uppercase, number, and special character)*
   - Confirm Password
4. Click **Register**
5. You are automatically logged in and redirected to the Dashboard

### Log In

1. Go to **http://localhost:3000/login**
2. Enter your **Email** and **Password**
3. Click **Sign In**
4. You are redirected to your Dashboard

### Forgot Password

1. On the Login page, click **Forgot Password?**
2. Enter your registered email address
3. Follow the on-screen instructions to reset your password

---

## 2. Dashboard

The Dashboard is the home screen after login. It gives you a snapshot of your finances at a glance.

**What you'll see:**

| Section | Description |
|---|---|
| Account Summary | Balance totals across all your accounts |
| Recent Transactions | Your last few transactions with amounts and dates |
| Quick Actions | Shortcut buttons for Deposit, Withdraw, Transfer |
| Account Cards | Individual cards for each of your accounts showing balance and account number |

Click any account card to navigate directly to that account's transactions.

---

## 3. Accounts

Navigate to **Accounts** from the left sidebar.

### View Accounts

- All your accounts (Savings, Checking) are listed as cards
- Each card shows: Account Number, Account Type, Balance, Status, Currency

### Open a New Savings Account

1. Click **New Account** (or **Open Account**) button at the top
2. Select account type — **SAVINGS** is pre-selected
3. Click **Create Account**
4. Your new account appears in the list immediately

> A Savings account can be opened directly from this page.  
> A Checking account requires a full application — see Section 4.

---

## 4. Open a Checking Account

Navigate to **Open Checking Acct** in the left sidebar (only visible if you do not already have a checking account).

This is a 5-step wizard:

### Step 1 – Personal Information
- **Date of Birth** — enter in MM/DD/YYYY format
- **Social Security Number (SSN)** — enter 9 digits (auto-formatted as XXX-XX-XXXX)
- **Country of Citizenship** — select from dropdown (e.g. United States)
- Click **Continue**

### Step 2 – Contact Information
- **Phone Number** — 10 digits
- **Street Address**
- **City**
- **State** — select from dropdown
- **ZIP Code**
- Click **Continue**

### Step 3 – Financial Information
- **Annual Income** — enter your yearly income
- **Employment Status** — select from dropdown (Employed, Self-Employed, Unemployed, Retired, Student)
- Click **Continue**

### Step 4 – Account Features
- Review the features included with your checking account
- Click **Looks Good** to proceed

### Step 5 – Review & Confirm
- Review all your information
- Check the **Terms & Conditions** checkbox
- Click **Open My Checking Account**

Your checking account is created and the **Open Checking Acct** link disappears from the sidebar.

---

## 5. Transactions

Navigate to **Transactions** from the left sidebar.

### Select an Account

Use the **Select Account** dropdown at the top to choose which account to view. Transactions and action buttons are only active after selecting an account.

### View Transaction History

- All transactions for the selected account are displayed in a table
- Columns: Date, Description, Type, Amount, Status
- Use pagination controls at the bottom to browse pages

### Deposit Money

1. Select an account from the dropdown
2. Click **Deposit**
3. Enter the amount
4. Click **Submit**
5. The deposit is processed and your balance updates

### Withdraw Money

1. Select an account from the dropdown
2. Click **Withdraw**
3. Enter the amount *(cannot exceed available balance)*
4. Click **Submit**

### Transfer Between Accounts

1. Select a source account from the dropdown
2. Click **Transfer**
3. Choose the **destination account**
4. Enter the **amount**
5. Click **Submit**

> Transfers are processed asynchronously via Kafka and appear in transaction history within seconds.

---

## 6. Payments

Navigate to **Payments** from the left sidebar.

### View Scheduled Payments

All upcoming and past bill payments are listed with payee name, amount, date, and status.

### Schedule a New Payment

1. Click **Schedule Payment**
2. Fill in:
   - **Payee Name** — e.g. Electric Company, Internet Provider
   - **Amount**
   - **Payment Date**
3. Click **Schedule**
4. The payment is added to your list and processed automatically on the scheduled date

### Payment Statuses

| Status | Meaning |
|---|---|
| SCHEDULED | Awaiting processing on the scheduled date |
| COMPLETED | Successfully paid |
| FAILED | Payment could not be processed |

---

## 7. Credit Cards

Navigate to **Credit Cards** from the left sidebar.

- View your linked credit cards with card number (masked), credit limit, current balance, and available credit
- See recent credit card transactions
- Monitor spending by category

---

## 8. Zelle – Send Money

Navigate to **Zelle** from the left sidebar.

### Send Money

1. Click **Send Money**
2. Enter the **Recipient** (email or phone number of the recipient)
3. Enter the **Amount**
4. Optionally add a **Note/Memo**
5. Click **Send**

### Transfer History

All past Zelle transfers are listed below the send form with recipient, amount, date, and status.

---

## 9. Credit Score

Navigate to **Credit Score** from the left sidebar.

Your FICO-style credit score is calculated automatically based on your account activity.

### Score Gauge

- Displays your current score (**300 – 850**)
- Color-coded by category:

| Range | Category | Color |
|---|---|---|
| 300 – 579 | Poor | Red |
| 580 – 669 | Fair | Orange |
| 670 – 739 | Good | Yellow |
| 740 – 799 | Very Good | Green |
| 800 – 850 | Exceptional | Blue |

### Score Factors

| Factor | Weight | What it measures |
|---|---|---|
| Payment History | 35% | On-time vs missed/failed transactions |
| Credit Utilization | 30% | Current credit usage vs total limit (lower is better) |
| Account Age | 15% | Age of your oldest account |
| Credit Mix | 10% | Variety of account types (savings, checking, credit) |

### Personalised Tip

A tailored recommendation is displayed at the bottom to help you improve your score.

> Your score is recalculated each time you visit this page.

---

## 10. Rewards

Navigate to **Rewards** from the left sidebar.

- View your current rewards points balance
- Browse available rewards to redeem
- Track points earned from transactions and credit card usage

---

## 11. Travel

Navigate to **Travel** from the left sidebar.

- Access travel-related benefits tied to your account or credit card
- View travel offers, insurance coverage, and partner discounts

---

## 12. Benefits

Navigate to **Benefits** from the left sidebar.

- Browse all account and card benefits
- View coverage details for purchase protection, extended warranty, and other perks

---

## 13. Profile & Settings

Navigate to **Profile** from the left sidebar.

### View Profile

- Your name, email address, and account details are displayed

### Edit Profile

1. Click **Edit**
2. Update your First Name, Last Name, or other details
3. Click **Save**

### Change Password

1. Click **Change Password**
2. Enter your **Current Password**
3. Enter your **New Password**
4. Confirm the new password
5. Click **Update Password**

---

## 14. Logging Out

Click your **avatar / profile icon** in the top-right corner of the header, then click **Logout**.

You are redirected to the Login page and your session is cleared.

---

## Tips & Troubleshooting

| Issue | Solution |
|---|---|
| Page shows a loading spinner and never loads | The backend may be starting up — wait 30 seconds and refresh |
| "Select an account" — buttons greyed out on Transactions page | Choose an account from the dropdown first |
| Transfer fails | Ensure source account has sufficient balance |
| Can't see "Open Checking Acct" in sidebar | You already have a checking account — it's hidden once you have one |
| Forgot password email not received | Check your spam folder; ensure the email matches your registered address |

---

*SecureBank — Secure. Simple. Smart.*
