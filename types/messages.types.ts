export const LOGIN_ERROR_MESSAGES = {
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  lockedOutUser: 'Epic sadface: Sorry, this user has been locked out.',
  emptyFields: 'Epic sadface: Username is required',
} as const;

export type LoginErrorMessage = (typeof LOGIN_ERROR_MESSAGES)[keyof typeof LOGIN_ERROR_MESSAGES];
export type LoginErrorKey = keyof typeof LOGIN_ERROR_MESSAGES;

export const SESSION_MESSAGES = {
  guardedRoute: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
} as const;

export type SessionMessage = (typeof SESSION_MESSAGES)[keyof typeof SESSION_MESSAGES];
export type SessionMessageKey = keyof typeof SESSION_MESSAGES;
