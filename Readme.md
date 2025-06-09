# PiggyBank Backend

A secure backend service for a digital piggy bank application that allows users to add and withdraw money using payment gateway integration (Cashfree).

---

## Project Overview

PiggyBank helps users save money by setting financial goals and managing funds within a personal wallet. Users can add money to their piggy bank and request withdrawals seamlessly. The backend handles user authentication, wallet management, transaction tracking, and payment gateway integration.

---

## Features

- User registration and login with OTP verification
- Wallet balance management for each user
- Integration with Cashfree payment gateway for adding funds
- Secure handling of withdrawal requests
- Transaction history and status tracking
- Automated OTP generation and validation
- API endpoints for frontend consumption

---

## Technology Stack

- Node.js with Express.js (REST API)
- MongoDB (Mongoose ODM)
- Cashfree Payment Gateway integration
- JWT Authentication for security

---

## Payment Flow

1. User initiates adding money to their piggy bank.
2. Backend creates a payment order with Cashfree.
3. User completes payment on frontend (not included yet).
4. Cashfree notifies backend of payment status.
5. Backend updates user's wallet balance accordingly.
6. User can request withdrawal; backend processes the request.

---

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or cloud instance)
- Cashfree account credentials (App ID, Secret Key)

### Installation

1. Clone the repo:

```bash
git clone https://github.com/yourusername/piggybank-backend.git
cd piggybank-backend
