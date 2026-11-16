export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Acesso negado.') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = 'Recurso não encontrado.') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends HttpError {
  constructor(message: string = 'Dados inválidos.') {
    super(400, message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Autenticação necessária.') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}
