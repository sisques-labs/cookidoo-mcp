/** Public, non-sensitive account info returned by the Cookidoo community profile. */
export interface CookidooUserInfo {
  readonly id: string;
  readonly username: string;
  readonly description: string | null;
  readonly picture: string | null;
}

/** A Cookidoo subscription as exposed by the ownership/subscriptions endpoint. */
export interface CookidooSubscription {
  readonly active: boolean;
  readonly expires: string;
  readonly startDate: string;
  readonly status: string;
  readonly subscriptionLevel: string;
  readonly subscriptionSource: string;
  readonly type: string;
  readonly extendedType: string;
}
