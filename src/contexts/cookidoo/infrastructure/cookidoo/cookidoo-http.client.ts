import { promises as fs } from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { CookieJar } from 'tough-cookie';

import {
  CookidooConfig,
  CookidooLocalization,
} from '@core/config/cookidoo.config';
import {
  CookidooSubscription,
  CookidooUserInfo,
} from '../../domain/types/cookidoo-account.type';
import {
  CookidooRecipeDetails,
  CookidooSearchParams,
  CookidooSearchResult,
  CookidooShoppingRecipe,
} from '../../domain/types/cookidoo-recipe.type';
import {
  CookidooAdditionalItem,
  CookidooIngredientItem,
} from '../../domain/types/cookidoo-shopping-list.type';
import { CookidooCalendarDay } from '../../domain/types/cookidoo-calendar.type';
import { CookidooCustomRecipe } from '../../domain/types/cookidoo-custom-recipe.type';
import {
  CookidooCollection,
  CookidooCollectionPage,
} from '../../domain/types/cookidoo-collection.type';
import {
  CookidooAdditionalItemEdit,
  CookidooOwnershipChange,
  ICookidooClient,
} from '../../domain/interfaces/cookidoo-client.interface';
import {
  CookidooAuthException,
  CookidooParseException,
  CookidooRequestException,
} from '../../domain/exceptions/cookidoo.exceptions';
import {
  additionalItemFromJson,
  calendarDayFromJson,
  collectionFromJson,
  customRecipeFromJson,
  ingredientItemFromJson,
  recipeDetailsFromJson,
  searchResultFromJson,
  shoppingRecipeFromJson,
  subscriptionFromJson,
  userInfoFromJson,
} from './cookidoo.mappers';
import {
  ADD_ADDITIONAL_ITEMS_PATH,
  ADD_CUSTOM_COLLECTION_PATH,
  ADD_CUSTOM_RECIPE_PATH,
  ADD_INGREDIENT_ITEMS_FOR_RECIPES_PATH,
  ADD_MANAGED_COLLECTION_PATH,
  ADD_RECIPES_TO_CALENDAR_PATH,
  ADD_RECIPES_TO_CUSTOM_COLLECTION_PATH,
  ADDITIONAL_ITEMS_PATH,
  CIAM_LOGIN_SRV_URL,
  COMMUNITY_PROFILE_PATH,
  CUSTOM_COLLECTIONS_PATH,
  CUSTOM_RECIPE_PATH,
  CUSTOM_RECIPES_PATH,
  DEFAULT_API_HEADERS,
  EDIT_ADDITIONAL_ITEMS_PATH,
  EDIT_OWNERSHIP_ADDITIONAL_ITEMS_PATH,
  EDIT_OWNERSHIP_INGREDIENT_ITEMS_PATH,
  INGREDIENT_ITEMS_PATH,
  LOGIN_PATH,
  LOGIN_REDIRECT,
  MANAGED_COLLECTIONS_PATH,
  RECIPE_PATH,
  RECIPES_IN_CALENDAR_WEEK_PATH,
  REMOVE_ADDITIONAL_ITEMS_PATH,
  REMOVE_CUSTOM_COLLECTION_PATH,
  REMOVE_CUSTOM_RECIPE_PATH,
  REMOVE_INGREDIENT_ITEMS_FOR_RECIPES_PATH,
  REMOVE_MANAGED_COLLECTION_PATH,
  REMOVE_RECIPE_FROM_CALENDAR_PATH,
  REMOVE_RECIPE_FROM_CUSTOM_COLLECTION_PATH,
  REQUIRED_AUTH_COOKIES,
  SHOPPING_LIST_RECIPES_PATH,
  SUBSCRIPTIONS_PATH,
} from './cookidoo.constants';

/* eslint-disable @typescript-eslint/no-explicit-any */

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// The OAuth2 login flow must look like a browser navigation: requesting JSON
// from the login/authorize endpoints makes them answer 401 instead of serving
// the HTML login form. Mirrors the upstream library, which sends no
// `Accept: application/json` on the login requests.
const BROWSER_ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,' +
  'image/webp,*/*;q=0.8';

// Headers a real Chrome sends on a navigation. cidaas exposes no CSRF form
// field, so the login POST is accepted based on Origin/Referer/Sec-Fetch — a
// bare POST just re-renders the login page.
const BROWSER_NAV_HEADERS: Record<string, string> = {
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-User': '?1',
  'sec-ch-ua':
    '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
};

const MAX_REDIRECTS = 30;

interface RequestOptions {
  params?: Record<string, string>;
  data?: unknown;
  headers?: Record<string, string>;
  parseResponse?: boolean;
}

interface SendOptions {
  data?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  responseType?: 'json' | 'text';
}

/**
 * HTTP adapter to the Cookidoo backend (port: {@link ICookidooClient}).
 *
 * Ported from the upstream Python `cookidoo-api`. A single account is used,
 * configured via environment variables. Authentication is a browser-style
 * OAuth2 redirect flow whose session cookies are kept in an in-memory jar;
 * login is lazy and re-attempted once on a 401. The adapter is a singleton, so
 * one logged-in session is shared across all requests.
 *
 * Redirects are followed manually (axios is configured with
 * `maxRedirects: 0`): on every hop we read the matching cookies from the jar
 * into the `Cookie` header and persist any `Set-Cookie` back. This mirrors
 * aiohttp's `CookieJar(unsafe=True)` and is what makes the cross-domain OAuth2
 * cookie exchange work — `axios-cookiejar-support` does not reliably persist
 * cookies set during cross-domain redirects.
 */
@Injectable()
export class CookidooHttpClient implements ICookidooClient {
  private readonly logger = new Logger(CookidooHttpClient.name);
  private readonly config: CookidooConfig;
  private readonly localization: CookidooLocalization;
  private jar: CookieJar;
  private readonly http: AxiosInstance;
  private readonly debug = process.env.COOKIDOO_DEBUG === 'true';

  private loggedIn = false;
  private loginInFlight: Promise<void> | null = null;
  private sessionRestored = false;

  constructor(configService: ConfigService) {
    this.config = configService.getOrThrow<CookidooConfig>('cookidoo');
    this.localization = this.config.localization;
    this.jar = new CookieJar();
    this.http = axios.create({
      timeout: 30_000,
      // Redirects are followed manually (see `sendFollowingRedirects`) so the
      // cookie jar is applied on every hop.
      maxRedirects: 0,
      // Only the User-Agent is global. The JSON `Accept` is added per API
      // request (see `dispatch`), never on the browser-style login flow.
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
      },
      // Inspect every status manually so we can map 401 -> auth error and
      // handle 3xx ourselves.
      validateStatus: () => true,
    });
  }

  // ---------------------------------------------------------------------------
  // Low-level transport (manual redirect + cookie-jar handling)
  // ---------------------------------------------------------------------------

  /**
   * Performs a single request, injecting the jar's cookies for the target URL
   * and persisting any `Set-Cookie` from the response back into the jar.
   */
  private async send(
    method: string,
    url: string,
    options: SendOptions,
  ): Promise<AxiosResponse> {
    const headers = { ...(options.headers ?? {}) };
    const cookie = await this.jar.getCookieString(url);
    if (cookie) {
      headers.Cookie = cookie;
    }
    if (this.debug) {
      const sent = cookie
        ? cookie
            .split(';')
            .map((c) => c.split('=')[0].trim())
            .join(', ')
        : '-';
      this.logger.debug(
        `  -> ${method.toUpperCase()} ${url} cookies=[${sent}]`,
      );
    }

    const response = await this.http.request({
      method,
      url,
      data: options.data,
      params: options.params,
      headers,
      responseType: options.responseType ?? 'json',
    });

    const setCookies = response.headers['set-cookie'] as string[] | undefined;
    if (setCookies) {
      for (const raw of setCookies) {
        try {
          await this.jar.setCookie(raw, url);
          if (this.debug) {
            this.logger.debug(
              `  set-cookie OK  (${url}): ${raw.split(';')[0]}`,
            );
          }
        } catch (error) {
          // Mirrors aiohttp's lenient jar: a cookie that does not match the
          // responding host is dropped rather than aborting the flow.
          if (this.debug) {
            this.logger.debug(
              `  set-cookie DROP (${url}): ${raw.split(';')[0]} — ${(error as Error).message}`,
            );
          }
        }
      }
    }

    return response;
  }

  /**
   * Sends a request and follows up to {@link MAX_REDIRECTS} redirects by hand,
   * carrying the cookie jar across every (possibly cross-domain) hop. POST/PUT
   * become GET on 301/302/303 (as browsers do); 307/308 keep the method.
   */
  private async sendFollowingRedirects(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    options: SendOptions = {},
  ): Promise<AxiosResponse> {
    let currentMethod: string = method;
    let currentUrl = url;
    let currentData = options.data;
    let currentParams = options.params;
    const headers = { ...(options.headers ?? {}) };

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const response = await this.send(currentMethod, currentUrl, {
        data: currentData,
        params: currentParams,
        headers,
        responseType: options.responseType,
      });

      const { status } = response;
      const location = response.headers['location'] as string | undefined;

      if (this.debug) {
        const cookieNames =
          (response.headers['set-cookie'] as string[] | undefined)
            ?.map((c) => c.split('=')[0])
            .join(', ') ?? '-';
        this.logger.debug(
          `[hop ${hop}] ${currentMethod.toUpperCase()} ${currentUrl} -> ${status}` +
            `${location ? ` -> ${location}` : ''} set-cookie:[${cookieNames}]`,
        );
      }

      if (status >= 300 && status < 400 && location) {
        currentUrl = new URL(location, currentUrl).toString();
        // The redirect target carries its own query string.
        currentParams = undefined;
        if (status !== 307 && status !== 308) {
          currentMethod = 'get';
          currentData = undefined;
          delete headers['Content-Type'];
          delete headers['content-type'];
        }
        continue;
      }

      // Expose the final (post-redirect) URL so callers can build a Referer.
      (response as AxiosResponse & { finalUrl?: string }).finalUrl = currentUrl;
      return response;
    }

    throw new CookidooRequestException(
      'Login flow failed: too many redirects.',
    );
  }

  // ---------------------------------------------------------------------------
  // URL helpers
  // ---------------------------------------------------------------------------

  /** API endpoint derived from the localization URL, e.g. `https://cookidoo.ch`. */
  private get apiEndpoint(): string {
    const url = new URL(this.localization.url);
    return `${url.protocol}//${url.host}`;
  }

  private buildUrl(
    path: string,
    replacements: Record<string, string> = {},
  ): string {
    const resolved = Object.entries({
      language: this.localization.language,
      ...replacements,
    }).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, value), path);
    return `${this.apiEndpoint}/${resolved}`;
  }

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------

  private async ensureLoggedIn(): Promise<void> {
    if (!this.sessionRestored) {
      this.sessionRestored = true;
      await this.restoreSession();
    }
    if (this.loggedIn) {
      return;
    }
    if (!this.loginInFlight) {
      this.loginInFlight = this.login().finally(() => {
        this.loginInFlight = null;
      });
    }
    await this.loginInFlight;
  }

  private async login(): Promise<void> {
    const { language } = this.localization;
    const redirect = LOGIN_REDIRECT.replaceAll('{language}', language);
    const loginUrl =
      this.buildUrl(LOGIN_PATH) + `?redirectAfterLogin=${redirect}`;

    this.logger.log('Logging in to Cookidoo');

    let loginHtml: string;
    let loginPageUrl = loginUrl;
    try {
      const resp = await this.sendFollowingRedirects('get', loginUrl, {
        responseType: 'text',
        headers: {
          Accept: BROWSER_ACCEPT,
          ...BROWSER_NAV_HEADERS,
          'Sec-Fetch-Site': 'none',
        },
      });
      if (resp.status !== 200) {
        throw new CookidooAuthException(
          `Login flow failed: could not reach login page (status ${resp.status}).`,
        );
      }
      loginHtml = resp.data as string;
      loginPageUrl =
        (resp as AxiosResponse & { finalUrl?: string }).finalUrl ?? loginUrl;
    } catch (error) {
      throw this.wrapNetworkError(error, 'reach login page');
    }

    const requestId = this.extractRequestId(loginHtml);
    const loginForm = this.describeLoginForm(loginHtml);

    let postResponse: AxiosResponse;
    try {
      postResponse = await this.sendFollowingRedirects(
        'post',
        CIAM_LOGIN_SRV_URL,
        {
          data: new URLSearchParams({
            requestId,
            username: this.config.email,
            password: this.config.password,
          }),
          responseType: 'text',
          // Submit the form like a real browser navigation: cidaas has no CSRF
          // form field, so it relies on Origin/Referer/Sec-Fetch to accept the
          // POST. Without these it just re-renders the login page.
          headers: {
            Accept: BROWSER_ACCEPT,
            ...BROWSER_NAV_HEADERS,
            'Sec-Fetch-Site': 'same-origin',
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: new URL(CIAM_LOGIN_SRV_URL).origin,
            Referer: loginPageUrl,
          },
        },
      );
    } catch (error) {
      throw this.wrapNetworkError(error, 'submit credentials');
    }

    // cidaas reports invalid credentials by redirecting back to the login page
    // with an `error` query param — surface that as a clear auth error.
    this.assertNoLoginError(postResponse);
    await this.verifyAuthCookies(postResponse, loginForm);
    this.loggedIn = true;
    this.logger.log('Cookidoo login successful');
    await this.persistSession();
  }

  // ---------------------------------------------------------------------------
  // Session persistence (optional, via COOKIDOO_COOKIE_FILE)
  // ---------------------------------------------------------------------------

  /**
   * Restore the cookie jar from {@link CookidooConfig.cookieFile} if configured
   * and present. When the restored jar already holds the required auth cookies,
   * the session is treated as logged in (an expired one self-heals on the first
   * 401 via the re-login path). Missing/invalid files are ignored — the client
   * just logs in fresh.
   */
  private async restoreSession(): Promise<void> {
    const path = this.config.cookieFile;
    if (!path) {
      return;
    }
    let serialized: unknown;
    try {
      serialized = JSON.parse(await fs.readFile(path, 'utf-8'));
    } catch {
      // No usable cookie file yet — start with a fresh login.
      return;
    }
    try {
      this.jar = await CookieJar.deserialize(
        serialized as Parameters<typeof CookieJar.deserialize>[0],
      );
    } catch (error) {
      this.logger.warn(
        `Ignoring invalid cookie file "${path}": ${(error as Error).message}`,
      );
      return;
    }
    const { cookies } = await this.jar.serialize();
    const names = new Set(cookies.map((cookie) => cookie.key));
    if (REQUIRED_AUTH_COOKIES.every((name) => names.has(name))) {
      this.loggedIn = true;
      this.logger.log(`Restored Cookidoo session from "${path}"`);
    }
  }

  /** Write the current cookie jar to {@link CookidooConfig.cookieFile}. */
  private async persistSession(): Promise<void> {
    const path = this.config.cookieFile;
    if (!path) {
      return;
    }
    try {
      const serialized = await this.jar.serialize();
      await fs.writeFile(path, JSON.stringify(serialized), 'utf-8');
      if (this.debug) {
        this.logger.debug(`Persisted Cookidoo session to "${path}"`);
      }
    } catch (error) {
      this.logger.warn(
        `Could not persist session to "${path}": ${(error as Error).message}`,
      );
    }
  }

  private assertNoLoginError(postResponse: AxiosResponse): void {
    const finalUrl = (postResponse as AxiosResponse & { finalUrl?: string })
      .finalUrl;
    if (!finalUrl) {
      return;
    }
    const params = new URL(finalUrl).searchParams;
    const error = params.get('error');
    if (!error) {
      return;
    }
    const description = params.get('error_description') ?? '';
    throw new CookidooAuthException(
      `Cookidoo rejected the login (${error})` +
        (description ? `: ${description}` : '') +
        '. Check COOKIDOO_EMAIL and COOKIDOO_PASSWORD.',
    );
  }

  private extractRequestId(html: string): string {
    const match =
      /<input[^>]*name=["']requestId["'][^>]*value=["']([^"']+)["']/.exec(
        html,
      ) ??
      /<input[^>]*value=["']([0-9a-f-]{36})["'][^>]*name=["']requestId["']/.exec(
        html,
      );
    if (!match) {
      throw new CookidooParseException(
        'Login flow failed: could not extract requestId from login page.',
      );
    }
    return match[1];
  }

  /** Summarise the login form (action + input name(type)) for diagnostics. */
  private describeLoginForm(html: string): string {
    const action = /<form[^>]*action=["']([^"']+)["']/i.exec(html)?.[1] ?? '-';
    const inputs = [...html.matchAll(/<input\b[^>]*>/gi)].map((match) => {
      const tag = match[0];
      const name = /name=["']([^"']+)["']/i.exec(tag)?.[1];
      const type = /type=["']([^"']+)["']/i.exec(tag)?.[1] ?? 'text';
      return name ? `${name}(${type})` : null;
    });
    const fields = [
      ...new Set(inputs.filter((field): field is string => !!field)),
    ];
    return `action=${action} fields=[${fields.join(', ')}]`;
  }

  private async verifyAuthCookies(
    postResponse: AxiosResponse,
    loginForm: string,
  ): Promise<void> {
    // Like the upstream library, check every cookie in the jar regardless of
    // domain (not just the ones scoped to the API host).
    const serialized = await this.jar.serialize();
    const collected = serialized.cookies.map((cookie) => ({
      key: cookie.key,
      domain: cookie.domain ?? '?',
    }));
    const names = new Set(collected.map((cookie) => cookie.key));
    const missing = REQUIRED_AUTH_COOKIES.filter((name) => !names.has(name));

    if (missing.length === 0) {
      return;
    }

    const summary =
      collected.length > 0
        ? collected.map((cookie) => `${cookie.key}@${cookie.domain}`).join(', ')
        : '(none)';
    const postStatus = postResponse.status;
    const contentType = String(postResponse.headers['content-type'] ?? '');

    this.logger.warn(
      `Login verification failed: missing [${missing.join(', ')}]. ` +
        `POST status=${postStatus} content-type=${contentType} cookies=[${summary}]. ` +
        'Set COOKIDOO_DEBUG=true to trace the login flow.',
    );

    if (this.debug) {
      const bodySnippet =
        typeof postResponse.data === 'string'
          ? postResponse.data.replace(/\s+/g, ' ').slice(0, 600)
          : JSON.stringify(postResponse.data).slice(0, 600);
      this.logger.debug(`Login form: ${loginForm}`);
      this.logger.debug(
        `Credentials POST body (first 600 chars): ${bodySnippet}`,
      );
    }

    throw new CookidooAuthException(
      `Login failed: missing session cookies [${missing.join(', ')}] ` +
        `(credentials POST returned ${postStatus}). ` +
        'Set COOKIDOO_DEBUG=true to trace the login flow.',
    );
  }

  // ---------------------------------------------------------------------------
  // Request helper
  // ---------------------------------------------------------------------------

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    operation: string,
    options: RequestOptions = {},
  ): Promise<T | null> {
    await this.ensureLoggedIn();

    const { parseResponse = true } = options;
    let response = await this.dispatch(method, url, options);

    // The session may have expired — re-login once and retry.
    if (response.status === 401) {
      this.logger.warn(
        `Session expired during "${operation}", re-authenticating`,
      );
      this.loggedIn = false;
      await this.ensureLoggedIn();
      response = await this.dispatch(method, url, options);
    }

    if (response.status === 401) {
      throw new CookidooAuthException(
        `${operation} failed due to authorization failure, the session is invalid or expired.`,
      );
    }

    if (response.status < 200 || response.status >= 300) {
      throw new CookidooRequestException(
        `${operation} failed with status ${response.status}.`,
      );
    }

    if (!parseResponse || response.status === 204) {
      return null;
    }

    if (response.data === undefined || response.data === '') {
      return null;
    }

    return response.data as T;
  }

  private async dispatch(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    options: RequestOptions,
  ) {
    try {
      return await this.sendFollowingRedirects(method, url, {
        params: options.params,
        data: options.data,
        // API calls negotiate JSON; the login flow (which bypasses this helper)
        // keeps its browser-style Accept header instead.
        headers: { ...DEFAULT_API_HEADERS, ...options.headers },
      });
    } catch (error) {
      throw this.wrapNetworkError(error, 'request Cookidoo');
    }
  }

  private wrapNetworkError(error: unknown, operation: string): Error {
    if (
      error instanceof CookidooAuthException ||
      error instanceof CookidooParseException ||
      error instanceof CookidooRequestException
    ) {
      return error;
    }
    const message = axios.isAxiosError(error)
      ? error.message
      : 'unknown network error';
    return new CookidooRequestException(`Failed to ${operation}: ${message}.`);
  }

  private ensureObject(value: unknown, operation: string): Record<string, any> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new CookidooParseException(
        `${operation} failed during parsing of request response.`,
      );
    }
    return value as Record<string, any>;
  }

  private ensureArray(value: unknown, operation: string): any[] {
    if (!Array.isArray(value)) {
      throw new CookidooParseException(
        `${operation} failed during parsing of request response.`,
      );
    }
    return value;
  }

  // ---------------------------------------------------------------------------
  // ICookidooClient
  // ---------------------------------------------------------------------------

  async getUserInfo(): Promise<CookidooUserInfo> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(COMMUNITY_PROFILE_PATH),
      'loading user info',
    );
    return userInfoFromJson(this.ensureObject(result, 'loading user info'));
  }

  async getActiveSubscription(): Promise<CookidooSubscription | null> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(SUBSCRIPTIONS_PATH),
      'loading active subscription',
    );
    const subscriptions = this.ensureArray(
      result,
      'loading active subscription',
    );
    const active = subscriptions.find((sub) => sub && sub.active);
    return active ? subscriptionFromJson(active) : null;
  }

  async getRecipeDetails(id: string): Promise<CookidooRecipeDetails> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(RECIPE_PATH, { id }),
      'loading recipe details',
    );
    return recipeDetailsFromJson(
      this.ensureObject(result, 'loading recipe details'),
      this.localization,
    );
  }

  async searchRecipes(
    params: CookidooSearchParams,
  ): Promise<CookidooSearchResult> {
    const locale = params.locale ?? this.localization.language.split('-')[0];
    const query: Record<string, string> = {};
    if (params.query) query.query = params.query;
    if (params.ingredients?.length)
      query.ingredients = params.ingredients.join(',');
    if (params.excludeIngredients?.length)
      query.excludeIngredients = params.excludeIngredients.join(',');
    if (params.categories?.length)
      query.categories = params.categories.join(',');
    if (params.tags?.length) query.tags = params.tags.join(',');
    if (params.difficulty) query.difficulty = params.difficulty;
    if (params.preparationTime !== undefined)
      query.preparationTime = String(params.preparationTime);
    if (params.totalTime !== undefined)
      query.totalTime = String(params.totalTime);
    if (params.portions !== undefined) query.portions = String(params.portions);
    if (params.page !== undefined) query.page = String(params.page);
    if (params.pageSize !== undefined) query.pageSize = String(params.pageSize);
    if (params.tmv?.length) query.tmv = params.tmv.join(',');

    const result = await this.request<unknown>(
      'get',
      `${this.apiEndpoint}/search/${locale}`,
      'search recipes',
      { params: query },
    );
    if (result === null) {
      return { recipes: [], total: 0 };
    }
    return searchResultFromJson(
      this.ensureObject(result, 'search recipes'),
      this.localization,
    );
  }

  async getShoppingListRecipes(): Promise<CookidooShoppingRecipe[]> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(SHOPPING_LIST_RECIPES_PATH),
      'loading shopping list recipes',
    );
    const data = this.ensureObject(result, 'loading shopping list recipes');
    const recipes: any[] = [
      ...(data.recipes ?? []),
      ...(data.customerRecipes ?? []),
    ];
    return recipes.map((recipe) =>
      shoppingRecipeFromJson(recipe, this.localization),
    );
  }

  async getIngredientItems(): Promise<CookidooIngredientItem[]> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(INGREDIENT_ITEMS_PATH),
      'loading ingredient items',
    );
    const data = this.ensureObject(result, 'loading ingredient items');
    return this.collectIngredientItems([
      ...(data.recipes ?? []),
      ...(data.customerRecipes ?? []),
    ]);
  }

  async addIngredientItemsForRecipes(
    recipeIds: string[],
  ): Promise<CookidooIngredientItem[]> {
    const result = await this.request<unknown>(
      'post',
      this.buildUrl(ADD_INGREDIENT_ITEMS_FOR_RECIPES_PATH),
      'add ingredient items for recipes',
      { data: { recipeIDs: recipeIds } },
    );
    const data = this.ensureObject(result, 'add ingredient items for recipes');
    return this.collectIngredientItems(data.data ?? []);
  }

  async removeIngredientItemsForRecipes(recipeIds: string[]): Promise<void> {
    await this.request<void>(
      'post',
      this.buildUrl(REMOVE_INGREDIENT_ITEMS_FOR_RECIPES_PATH),
      'remove ingredient items for recipes',
      { data: { recipeIDs: recipeIds }, parseResponse: false },
    );
  }

  async getAdditionalItems(): Promise<CookidooAdditionalItem[]> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(ADDITIONAL_ITEMS_PATH),
      'loading additional items',
    );
    const data = this.ensureObject(result, 'loading additional items');
    const items: any[] = data.additionalItems ?? [];
    return items.map(additionalItemFromJson);
  }

  async addAdditionalItems(names: string[]): Promise<CookidooAdditionalItem[]> {
    const result = await this.request<unknown>(
      'post',
      this.buildUrl(ADD_ADDITIONAL_ITEMS_PATH),
      'add additional items',
      { data: { itemsValue: names } },
    );
    const data = this.ensureObject(result, 'add additional items');
    const items: any[] = data.data ?? [];
    return items.map(additionalItemFromJson);
  }

  async removeAdditionalItems(ids: string[]): Promise<void> {
    await this.request<void>(
      'post',
      this.buildUrl(REMOVE_ADDITIONAL_ITEMS_PATH),
      'remove additional items',
      { data: { additionalItemIDs: ids }, parseResponse: false },
    );
  }

  async clearShoppingList(): Promise<void> {
    await this.request<void>(
      'delete',
      this.buildUrl(INGREDIENT_ITEMS_PATH),
      'clear shopping list',
      { parseResponse: false },
    );
  }

  async getRecipesInCalendarWeek(day: string): Promise<CookidooCalendarDay[]> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(RECIPES_IN_CALENDAR_WEEK_PATH, { day }),
      'loading calendar week',
    );
    const data = this.ensureObject(result, 'loading calendar week');
    const days = this.ensureArray(data.myDays ?? [], 'loading calendar week');
    return days.map((entry) => calendarDayFromJson(entry, this.localization));
  }

  async addRecipesToCalendar(
    day: string,
    recipeIds: string[],
  ): Promise<CookidooCalendarDay> {
    const result = await this.request<unknown>(
      'put',
      this.buildUrl(ADD_RECIPES_TO_CALENDAR_PATH),
      'add recipes to calendar',
      { data: { recipeIds, dayKey: day } },
    );
    const data = this.ensureObject(result, 'add recipes to calendar');
    return calendarDayFromJson(
      this.ensureObject(data.content, 'add recipes to calendar'),
      this.localization,
    );
  }

  async removeRecipeFromCalendar(
    day: string,
    recipeId: string,
  ): Promise<CookidooCalendarDay> {
    const result = await this.request<unknown>(
      'delete',
      this.buildUrl(REMOVE_RECIPE_FROM_CALENDAR_PATH, {
        day,
        recipe: recipeId,
      }),
      'remove recipe from calendar',
    );
    const data = this.ensureObject(result, 'remove recipe from calendar');
    return calendarDayFromJson(
      this.ensureObject(data.content, 'remove recipe from calendar'),
      this.localization,
    );
  }

  async editIngredientItemsOwnership(
    changes: CookidooOwnershipChange[],
  ): Promise<CookidooIngredientItem[]> {
    const ownedTimestamp = this.nowSeconds();
    const result = await this.request<unknown>(
      'post',
      this.buildUrl(EDIT_OWNERSHIP_INGREDIENT_ITEMS_PATH),
      'edit ingredient items ownership',
      {
        data: {
          ingredients: changes.map((change) => ({
            id: change.id,
            isOwned: change.isOwned,
            ownedTimestamp,
          })),
        },
      },
    );
    const data = this.ensureObject(result, 'edit ingredient items ownership');
    const items: any[] = data.data ?? [];
    return items.map(ingredientItemFromJson);
  }

  async addIngredientItemsForCustomRecipes(
    recipeIds: string[],
  ): Promise<CookidooIngredientItem[]> {
    const result = await this.request<unknown>(
      'post',
      this.buildUrl(ADD_INGREDIENT_ITEMS_FOR_RECIPES_PATH),
      'add ingredient items for custom recipes',
      {
        data: {
          recipeIDs: recipeIds.map((id) => ({ id, source: 'CUSTOMER' })),
        },
      },
    );
    const data = this.ensureObject(
      result,
      'add ingredient items for custom recipes',
    );
    return this.collectIngredientItems(data.data ?? []);
  }

  async removeIngredientItemsForCustomRecipes(
    recipeIds: string[],
  ): Promise<void> {
    await this.request<void>(
      'post',
      this.buildUrl(REMOVE_INGREDIENT_ITEMS_FOR_RECIPES_PATH),
      'remove ingredient items for custom recipes',
      { data: { recipeIDs: recipeIds }, parseResponse: false },
    );
  }

  async editAdditionalItems(
    edits: CookidooAdditionalItemEdit[],
  ): Promise<CookidooAdditionalItem[]> {
    const result = await this.request<unknown>(
      'post',
      this.buildUrl(EDIT_ADDITIONAL_ITEMS_PATH),
      'edit additional items',
      {
        data: {
          additionalItems: edits.map((edit) => ({
            id: edit.id,
            name: edit.name,
          })),
        },
      },
    );
    const data = this.ensureObject(result, 'edit additional items');
    const items: any[] = data.data ?? [];
    return items.map(additionalItemFromJson);
  }

  async editAdditionalItemsOwnership(
    changes: CookidooOwnershipChange[],
  ): Promise<CookidooAdditionalItem[]> {
    const ownedTimestamp = this.nowSeconds();
    const result = await this.request<unknown>(
      'post',
      this.buildUrl(EDIT_OWNERSHIP_ADDITIONAL_ITEMS_PATH),
      'edit additional items ownership',
      {
        data: {
          additionalItems: changes.map((change) => ({
            id: change.id,
            isOwned: change.isOwned,
            ownedTimestamp,
          })),
        },
      },
    );
    const data = this.ensureObject(result, 'edit additional items ownership');
    const items: any[] = data.data ?? [];
    return items.map(additionalItemFromJson);
  }

  async addCustomRecipesToCalendar(
    day: string,
    recipeIds: string[],
  ): Promise<CookidooCalendarDay> {
    const result = await this.request<unknown>(
      'put',
      this.buildUrl(ADD_RECIPES_TO_CALENDAR_PATH),
      'add custom recipes to calendar',
      { data: { recipeIds, dayKey: day, recipeSource: 'CUSTOMER' } },
    );
    const data = this.ensureObject(result, 'add custom recipes to calendar');
    return calendarDayFromJson(
      this.ensureObject(data.content, 'add custom recipes to calendar'),
      this.localization,
    );
  }

  async removeCustomRecipeFromCalendar(
    day: string,
    recipeId: string,
  ): Promise<CookidooCalendarDay> {
    const result = await this.request<unknown>(
      'delete',
      this.buildUrl(REMOVE_RECIPE_FROM_CALENDAR_PATH, {
        day,
        recipe: recipeId,
      }),
      'remove custom recipe from calendar',
      { params: { recipeSource: 'CUSTOMER' } },
    );
    const data = this.ensureObject(
      result,
      'remove custom recipe from calendar',
    );
    return calendarDayFromJson(
      this.ensureObject(data.content, 'remove custom recipe from calendar'),
      this.localization,
    );
  }

  async listCustomRecipes(): Promise<CookidooCustomRecipe[]> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(CUSTOM_RECIPES_PATH),
      'listing custom recipes',
    );
    const data = this.ensureObject(result, 'listing custom recipes');
    const items: any[] = data.items ?? [];
    return items.map((item) => customRecipeFromJson(item, this.localization));
  }

  async getCustomRecipe(id: string): Promise<CookidooCustomRecipe> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(CUSTOM_RECIPE_PATH, { id }),
      'loading custom recipe',
    );
    return customRecipeFromJson(
      this.ensureObject(result, 'loading custom recipe'),
      this.localization,
    );
  }

  async addCustomRecipeFrom(
    recipeId: string,
    servingSize: number,
  ): Promise<CookidooCustomRecipe> {
    const result = await this.request<unknown>(
      'post',
      this.buildUrl(ADD_CUSTOM_RECIPE_PATH),
      'add custom recipe',
      {
        data: {
          recipeUrl: this.buildUrl(RECIPE_PATH, { id: recipeId }),
          servingSize,
        },
      },
    );
    return customRecipeFromJson(
      this.ensureObject(result, 'add custom recipe'),
      this.localization,
    );
  }

  async removeCustomRecipe(id: string): Promise<void> {
    await this.request<void>(
      'delete',
      this.buildUrl(REMOVE_CUSTOM_RECIPE_PATH, { id }),
      'remove custom recipe',
      { parseResponse: false },
    );
  }

  async countManagedCollections(): Promise<CookidooCollectionPage> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(MANAGED_COLLECTIONS_PATH),
      'counting managed collections',
    );
    return this.pageFromJson(result, 'counting managed collections');
  }

  async getManagedCollections(page = 0): Promise<CookidooCollection[]> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(MANAGED_COLLECTIONS_PATH),
      'loading managed collections',
      { params: { page: String(page) } },
    );
    const data = this.ensureObject(result, 'loading managed collections');
    const lists: any[] = data.managedlists ?? [];
    return lists.map(collectionFromJson);
  }

  async addManagedCollection(
    collectionId: string,
  ): Promise<CookidooCollection> {
    const result = await this.request<unknown>(
      'post',
      this.buildUrl(ADD_MANAGED_COLLECTION_PATH),
      'add managed collection',
      { data: { collectionId } },
    );
    const data = this.ensureObject(result, 'add managed collection');
    return collectionFromJson(
      this.ensureObject(data.content, 'add managed collection'),
    );
  }

  async removeManagedCollection(collectionId: string): Promise<void> {
    await this.request<void>(
      'delete',
      this.buildUrl(REMOVE_MANAGED_COLLECTION_PATH, { id: collectionId }),
      'remove managed collection',
      { parseResponse: false },
    );
  }

  async countCustomCollections(): Promise<CookidooCollectionPage> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(CUSTOM_COLLECTIONS_PATH),
      'counting custom collections',
    );
    return this.pageFromJson(result, 'counting custom collections');
  }

  async getCustomCollections(page = 0): Promise<CookidooCollection[]> {
    const result = await this.request<unknown>(
      'get',
      this.buildUrl(CUSTOM_COLLECTIONS_PATH),
      'loading custom collections',
      { params: { page: String(page) } },
    );
    const data = this.ensureObject(result, 'loading custom collections');
    const lists: any[] = data.customlists ?? [];
    return lists.map(collectionFromJson);
  }

  async addCustomCollection(name: string): Promise<CookidooCollection> {
    const result = await this.request<unknown>(
      'post',
      this.buildUrl(ADD_CUSTOM_COLLECTION_PATH),
      'add custom collection',
      { data: { title: name } },
    );
    const data = this.ensureObject(result, 'add custom collection');
    return collectionFromJson(
      this.ensureObject(data.content, 'add custom collection'),
    );
  }

  async removeCustomCollection(collectionId: string): Promise<void> {
    await this.request<void>(
      'delete',
      this.buildUrl(REMOVE_CUSTOM_COLLECTION_PATH, { id: collectionId }),
      'remove custom collection',
      { parseResponse: false },
    );
  }

  async addRecipesToCustomCollection(
    collectionId: string,
    recipeIds: string[],
  ): Promise<CookidooCollection> {
    const result = await this.request<unknown>(
      'put',
      this.buildUrl(ADD_RECIPES_TO_CUSTOM_COLLECTION_PATH, {
        id: collectionId,
      }),
      'add recipes to custom collection',
      { data: { recipeIds } },
    );
    const data = this.ensureObject(result, 'add recipes to custom collection');
    return collectionFromJson(
      this.ensureObject(data.content, 'add recipes to custom collection'),
    );
  }

  async removeRecipeFromCustomCollection(
    collectionId: string,
    recipeId: string,
  ): Promise<CookidooCollection> {
    const result = await this.request<unknown>(
      'delete',
      this.buildUrl(REMOVE_RECIPE_FROM_CUSTOM_COLLECTION_PATH, {
        id: collectionId,
        recipe: recipeId,
      }),
      'remove recipe from custom collection',
    );
    const data = this.ensureObject(
      result,
      'remove recipe from custom collection',
    );
    return collectionFromJson(
      this.ensureObject(data.content, 'remove recipe from custom collection'),
    );
  }

  /** Current epoch time in seconds, used for the `ownedTimestamp` fields. */
  private nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  /** Read the `page` pagination block (totalElements/totalPages). */
  private pageFromJson(
    result: unknown,
    operation: string,
  ): CookidooCollectionPage {
    const data = this.ensureObject(result, operation);
    const page = this.ensureObject(data.page ?? {}, operation);
    return {
      totalElements: Number(page.totalElements ?? 0),
      totalPages: Number(page.totalPages ?? 0),
    };
  }

  /** Flatten the `recipeIngredientGroups` of a list of recipes into items. */
  private collectIngredientItems(recipes: any[]): CookidooIngredientItem[] {
    return recipes.flatMap((recipe) =>
      (recipe.recipeIngredientGroups ?? []).map(ingredientItemFromJson),
    );
  }
}
