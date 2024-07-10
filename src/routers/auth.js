import { Router } from 'express';
import { userSignUp, userSignIn } from '../validation/userSchema.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import validateBody from '../utils/validateBody.js';
import {
  signInUserController,
  signUpUserController,
  refreshController,
  logoutController,
} from '../controllers/auth.js';
import { requestResetEmailSchema } from '../validation/auth.js';
import { requestResetEmailController } from '../controllers/auth.js';

const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(userSignUp),
  ctrlWrapper(signUpUserController),
);
authRouter.post(
  '/login',
  validateBody(userSignIn),
  ctrlWrapper(signInUserController),
);

authRouter.post('/refresh', ctrlWrapper(refreshController));

authRouter.post('/logout', ctrlWrapper(logoutController));

authRouter.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);
export default authRouter;
