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
import { ICookidooClient } from '../../domain/interfaces/cookidoo-client.interface';
import {
  CookidooAuthException,
  CookidooParseException,
  CookidooRequestException,
} from '../../domain/exceptions/cookidoo.exceptions';
import {
  additionalItemFromJson,
  ingredientItemFromJson,
  recipeDetailsFromJson,
  searchResultFromJson,
  shoppingRecipeFromJson,
  subscriptionFromJson,
  userInfoFromJson,
} from './cookidoo.mappers';
import {
  ADD_ADDITIONAL_ITEMS_PATH,
  ADD_INGREDIENT_ITEMS_FOR_RECIPES_PATH,
  ADDITIONAL_ITEMS_PATH,
  CIAM_LOGIN_SRV_URL,
  COMMUNITY_PROFILE_PATH,
  DEFAULT_API_HEADERS,
  INGREDIENT_ITEMS_PATH,
  LOGIN_PATH,
  LOGIN_REDIRECT,
  RECIPE_PATH,
  REMOVE_ADDITIONAL_ITEMS_PATH,
  REMOVE_INGREDIENT_ITEMS_FOR_RECIPES_PATH,
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
  private readonly jar: CookieJar;
  private readonly http: AxiosInstance;

  private loggedIn = false;
  private loginInFlight: Promise<void> | null = null;

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
        await this.jar
          .setCookie(raw, url, { ignoreError: true })
          .catch(() => undefined);
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
    method: 'get' | 'post' | 'delete',
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
    try {
      const resp = await this.sendFollowingRedirects('get', loginUrl, {
        responseType: 'text',
        headers: { Accept: BROWSER_ACCEPT },
      });
      if (resp.status !== 200) {
        throw new CookidooAuthException(
          `Login flow failed: could not reach login page (status ${resp.status}).`,
        );
      }
      loginHtml = resp.data as string;
    } catch (error) {
      throw this.wrapNetworkError(error, 'reach login page');
    }

    const requestId = this.extractRequestId(loginHtml);

    try {
      await this.sendFollowingRedirects('post', CIAM_LOGIN_SRV_URL, {
        data: new URLSearchParams({
          requestId,
          username: this.config.email,
          password: this.config.password,
        }),
        responseType: 'text',
        headers: { Accept: BROWSER_ACCEPT },
      });
    } catch (error) {
      throw this.wrapNetworkError(error, 'submit credentials');
    }

    await this.verifyAuthCookies();
    this.loggedIn = true;
    this.logger.log('Cookidoo login successful');
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

  private async verifyAuthCookies(): Promise<void> {
    const cookies = await this.jar.getCookies(this.apiEndpoint);
    const names = new Set(cookies.map((cookie) => cookie.key));
    const missing = REQUIRED_AUTH_COOKIES.filter((name) => !names.has(name));
    if (missing.length > 0) {
      throw new CookidooAuthException(
        'Login failed: authentication cookies were not set. ' +
          'Please check COOKIDOO_EMAIL and COOKIDOO_PASSWORD.',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Request helper
  // ---------------------------------------------------------------------------

  private async request<T>(
    method: 'get' | 'post' | 'delete',
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
    method: 'get' | 'post' | 'delete',
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

  /** Flatten the `recipeIngredientGroups` of a list of recipes into items. */
  private collectIngredientItems(recipes: any[]): CookidooIngredientItem[] {
    return recipes.flatMap((recipe) =>
      (recipe.recipeIngredientGroups ?? []).map(ingredientItemFromJson),
    );
  }
}
