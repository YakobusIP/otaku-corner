class CustomError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public type: "WARN" | "ERROR"
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class BadRequestError extends CustomError {
  constructor(message = "Bad Request") {
    super(400, message, "ERROR");
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized") {
    super(401, message, "ERROR");
  }
}

class ForbiddenError extends CustomError {
  constructor(message = "Forbidden") {
    super(403, message, "ERROR");
  }
}

class NotFoundError extends CustomError {
  constructor(message = "Not Found") {
    super(404, message, "ERROR");
  }
}

class PrismaUniqueError extends CustomError {
  constructor(message = "Unique constraint failed") {
    super(409, message, "ERROR");
  }
}

class UnprocessableEntityError extends CustomError {
  constructor(message = "Unprocessable Entity") {
    super(422, message, "ERROR");
  }
}

class FileStorageError extends CustomError {
  public originalMessage: string;
  constructor(message: string) {
    super(500, "Internal server error", "ERROR");
    this.originalMessage = message;
  }
}

class InternalServerError extends CustomError {
  public originalMessage: string;
  constructor(message: string) {
    super(500, "Internal server error", "ERROR");
    this.originalMessage = message;
  }
}

class UnknownError extends CustomError {
  constructor(message = "An unknown error occurred") {
    super(500, message, "ERROR");
  }
}

export {
  CustomError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  PrismaUniqueError,
  UnprocessableEntityError,
  FileStorageError,
  InternalServerError,
  UnknownError
};
