import { configureStore } from '@reduxjs/toolkit';
import authReducer       from '../features/auth/authSlice';
import accountsReducer   from '../features/accounts/accountsSlice';
import transactionsReducer from '../features/transactions/transactionsSlice';
import paymentsReducer   from '../features/payments/paymentsSlice';
import userReducer       from '../features/users/userSlice';
import creditCardsReducer from '../features/creditcard/creditCardSlice';
import rewardsReducer    from '../features/rewards/rewardsSlice';
import zelleReducer      from '../features/zelle/zelleSlice';
import creditScoreReducer from '../features/creditscore/creditScoreSlice';

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    accounts:     accountsReducer,
    transactions: transactionsReducer,
    payments:     paymentsReducer,
    user:         userReducer,
    creditCards:  creditCardsReducer,
    rewards:      rewardsReducer,
    zelle:        zelleReducer,
    creditScore:  creditScoreReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
