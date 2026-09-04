type AuthError = {
  code?: string;
  message?: string;
};

const messages: Record<string, string> = {
  INVALID_ORIGIN: "Запрос выполнен с недопустимого адреса приложения.",
  INVALID_EMAIL_OR_PASSWORD: "Неверный email или пароль.",
  USER_NOT_FOUND: "Учётная запись не найдена.",
  USER_ALREADY_EXISTS: "Учётная запись с таким email уже существует.",
  EMAIL_CAN_NOT_BE_UPDATED: "Email этой учётной записи нельзя изменить.",
  INVALID_PASSWORD: "Пароль не соответствует требованиям безопасности.",
};

export function getAuthErrorMessage(error: AuthError | null | undefined, fallback: string) {
  if (!error) return fallback;
  if (error.code && messages[error.code]) return messages[error.code];
  if (error.message === "Invalid origin") return messages.INVALID_ORIGIN;
  return fallback;
}
