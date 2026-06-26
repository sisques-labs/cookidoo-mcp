/** Base class for every Cookidoo-related error. */
export class CookidooException extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** The configuration (credentials, localization) is invalid or unusable. */
export class CookidooConfigException extends CookidooException {}

/** Authentication failed — bad credentials or an expired/invalid session. */
export class CookidooAuthException extends CookidooException {}

/** A response body could not be parsed into the expected shape. */
export class CookidooParseException extends CookidooException {}

/** A request failed (timeout, connection error or unexpected status). */
export class CookidooRequestException extends CookidooException {}
