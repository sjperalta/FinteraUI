# Readjustment Payment Status Feature

## Overview
This document describes the implementation of the "readjustment" payment status for handling capital repayment operations in the FinteraUI application.

## Business Context
When a capital repayment (abono a capital) is applied to a contract, the payment schedule needs to be recalculated. Payments that have been readjusted due to this recalculation should be marked with a special "readjustment" status and become read-only (disabled) as no operations should be allowed on them.

## Backend Response Structure
The backend returns the following structure after a capital repayment:

```ruby
{
  success: true,
  message: 'Amortización de capital registrada exitosamente',
  contract: @contract,
  reajusted_payments_count: @reajusted_payments&.size || 0,
  reajusted_payments: @reajusted_payments || []
}
```

**Note**: The response includes the complete `reajusted_payments` array with full payment objects, not just IDs.

## Implementation Details

### 1. PaymentScheduleModal.jsx Changes

#### Capital Repayment Handler
Updated the capital repayment endpoint handler to:
- Update contract balance from backend response
- Replace payments with complete readjusted payment objects from `reajusted_payments` array
- Mark updated payments with "readjustment" status
- **Important**: Does NOT reload payment schedule to avoid overwriting readjusted statuses
- Show success message with count of readjusted payments

```javascript
// Update contract with new balance from backend
if (data.contract) {
  setCurrentContract(prev => ({
    ...(prev || {}),
    ...data.contract,
    balance: data.contract.balance
  }));
}

// Update schedule with readjusted payments from backend
if (data.reajusted_payments && Array.isArray(data.reajusted_payments) && data.reajusted_payments.length > 0) {
  const safeSchedule = Array.isArray(schedule) ? schedule : [];
  
  // Replace existing payments with readjusted ones from backend
  const updatedSchedule = safeSchedule.map(payment => {
    // Find if this payment was readjusted
    const reajustedPayment = data.reajusted_payments.find(rp => rp.id === payment.id);
    if (reajustedPayment) {
      // Use the complete payment data from backend
      return {
        ...reajustedPayment,
        status: 'readjustment',
        readjusted_at: new Date().toISOString()
      };
    }
    return payment;
  });
  setSchedule(updatedSchedule);
}

// Note: Do NOT call loadPaymentSchedule() here as it would overwrite 
// the readjusted payments with the contract's payment_schedule
```

### 2. PaymentScheduleTab.jsx Changes

#### Readjustment Detection
Added detection for readjustment status:
```javascript
const isReadjustment = status === "readjustment";
```

#### Row Styling
Rows with readjustment status now have:
- Gray background: `bg-gray-100 dark:bg-gray-800`
- Reduced opacity: `opacity-60`
- Disabled cursor: `cursor-not-allowed`
- Grayed-out text colors

#### Status Badge
Added readjustment status badge:
```javascript
{isReadjustment 
  ? t('paymentSchedule.readjustment') 
  : isPaid 
  ? t('paymentSchedule.paid') 
  : isOverdue 
  ? t('paymentSchedule.overdue') 
  : t('paymentSchedule.pending')
}
```

#### Action Buttons
Readjusted rows show only a lock icon (🔒) instead of action buttons:
```javascript
{isReadjustment ? (
  <span className="px-2 py-1 text-xs text-gray-400 dark:text-gray-500" title={t('paymentSchedule.readjustment')}>
    🔒
  </span>
) : (
  // ... regular action buttons
)}
```

### 3. Translation Keys

#### English (en.json)
```json
{
  "contracts": {
    "capitalPaymentAmountRequired": "Capital payment amount is required",
    "totalAmountRequired": "Total amount is required",
    "applyingCapitalPayment": "Applying capital payment...",
    "paymentsReadjusted": "payment(s) have been readjusted"
  },
  "paymentSchedule": {
    "readjustment": "Readjustment"
  },
  "payments": {
    "statusOptions": {
      "readjustment": "Readjustment"
    }
  }
}
```

#### Spanish (es.json)
```json
{
  "contracts": {
    "capitalPaymentAmountRequired": "El monto del pago de capital es requerido",
    "totalAmountRequired": "El monto total es requerido",
    "applyingCapitalPayment": "Aplicando pago de capital...",
    "paymentsReadjusted": "pago(s) han sido reajustados"
  },
  "paymentSchedule": {
    "readjustment": "Reajuste"
  },
  "payments": {
    "statusOptions": {
      "readjustment": "Reajuste"
    }
  }
}
```

## User Experience

### Capital Repayment Flow
1. User clicks "Capital Payment" button (🏦)
2. Modal opens requesting capital payment amount
3. User enters amount and confirms
4. Backend processes payment and returns complete readjusted payment objects
5. Frontend updates:
   - Contract balance
   - Replaces readjusted payments with recalculated data from backend
   - Marks updated payments with 'readjustment' status
   - Reloads payment schedule
6. Success message shows: "Capital Payment applied successfully\n\nX payment(s) have been readjusted"

### Backend Response Integration
The backend now returns the complete `reajusted_payments` array containing full payment objects:
```javascript
{
  success: true,
  contract: { id: 123, balance: 50000, ... },
  reajusted_payments_count: 5,
  reajusted_payments: [
    { id: 101, amount: 500, due_date: "2025-01-15", interest_amount: 0, ... },
    { id: 102, amount: 500, due_date: "2025-02-15", interest_amount: 0, ... },
    // ... more payments
  ]
}
```

**Key Advantage**: Frontend receives fully recalculated payment data (amounts, dates, interest) directly from backend, ensuring accuracy.

### Visual Indicators
- **Readjusted Rows**: Gray background, reduced opacity, grayed-out text
- **Status Badge**: Gray badge with "Readjustment"/"Reajuste" text
- **Actions Column**: Lock icon (🔒) only, no action buttons
- **Tooltip**: "Readjustment" when hovering over lock icon

## Benefits
1. **Clear Visual Distinction**: Users can immediately identify readjusted payments
2. **Prevented Errors**: No operations allowed on readjusted payments
3. **Audit Trail**: `readjusted_at` timestamp tracks when adjustment occurred
4. **Bilingual Support**: Full Spanish and English translation
5. **User Feedback**: Success message includes count of affected payments

## Testing Checklist
- [ ] Capital payment successfully updates contract balance
- [ ] Backend returns `reajusted_payments` array with complete payment objects
- [ ] Readjusted payment data (amounts, dates) updates correctly in UI
- [ ] Readjusted payments show gray background and lock icon
- [ ] No action buttons available on readjusted rows
- [ ] Status badge shows "Readjustment"/"Reajuste"
- [ ] Success message displays readjusted payment count
- [ ] Payment schedule reloads after capital payment
- [ ] Dark mode styling works correctly
- [ ] Spanish translations display correctly
- [ ] Recalculated amounts match backend expectations

## Future Enhancements
1. Add ability to view readjustment history
2. Show original vs. readjusted amounts
3. Add admin-only ability to undo readjustments
4. Generate readjustment reports

## Troubleshooting

### Issue: Readjusted payments showing as "pending" instead of "readjustment"

**Problem**: After applying a capital payment, the readjusted payments briefly show the correct status but then revert to "pending".

**Cause**: The `loadPaymentSchedule()` function was being called after updating the schedule with readjusted payments. This reloaded the schedule from `contract.payment_schedule`, which didn't have the `status: 'readjustment'` field, overwriting the correct status.

**Solution**: Removed the `loadPaymentSchedule()` call after capital repayment. The schedule is already updated with complete payment data from `data.reajusted_payments`, so reloading is unnecessary and causes the issue.

**Code location**: `PaymentScheduleModal.jsx`, capital repayment handler (around line 649)

### Backend Requirements

For the readjustment feature to work correctly, the backend must:

1. Return `reajusted_payments` array with complete payment objects (not just IDs)
2. Include all payment fields: `id`, `amount`, `due_date`, `interest_amount`, `payment_type`, etc.
3. The backend can optionally include `status: 'readjustment'` in the payment objects, but if not, the frontend will add it
4. Update the contract's `balance` field with the new balance after capital repayment
5. Return `reajusted_payments_count` for user feedback
