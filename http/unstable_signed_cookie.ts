// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { decodeHex, encodeHex } from "@std/encoding/hex";

const encoder = new TextEncoder();

function splitByLast(value: string, separator: string): [string, string] {
  const index = value.lastIndexOf(separator);
  return index === -1
    ? [value, ""]
    : [value.slice(0, index), value.slice(index + 1)];
}

/**
 * Returns a promise with the signed cookie value from the given cryptographic
 * key.
 *
 * @example
 * ```ts
 * import { signCookie } from "@std/http/unstable-signed-cookie";
 * import { setCookie } from "@std/http/cookie";
 *
 * const key = await crypto.subtle.generateKey(
 *   { name: "HMAC", hash: "SHA-256" },
 *   true,
 *   ["sign", "verify"],
 * );
 * const value = await signCookie("my-cookie-value", key);
 *
 * const headers = new Headers();
 * setCookie(headers, {
 *   name: "my-cookie-name",
 *   value,
 * });
 *
 * const cookieHeader = headers.get("set-cookie");
 * ```
 */
export async function signCookie(
  value: string,
  key: CryptoKey,
): Promise<string> {
  const data = encoder.encode(value);
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const signatureHex = encodeHex(signature);
  return `${value}.${signatureHex}`;
}

/**
 * Returns a promise of a boolean indicating whether the signed cookie is valid.
 *
 * @example
 * ```ts
 * import { verifyCookie } from "@std/http/unstable-signed-cookie";
 * import { getCookies } from "@std/http/cookie";
 *
 * const key = await crypto.subtle.generateKey(
 *   { name: "HMAC", hash: "SHA-256" },
 *   true,
 *   ["sign", "verify"],
 * );
 *
 * const headers = new Headers({
 *   Cookie: "location=tokyo.37f7481039762eef5cd46669f93c0a3214dfecba7d0cdc0b0dc40036063fb22e",
 * });
 * const signedCookie = getCookies(headers)["location"];
 * if (signedCookie === undefined) throw new Error("Cookie not found");
 * await verifyCookie(signedCookie, key);
 * ```
 */
export async function verifyCookie(
  signedCookie: string,
  key: CryptoKey,
): Promise<boolean> {
  const [value, signatureHex] = splitByLast(signedCookie, ".");
  if (!value || !signatureHex) return false;

  const data = encoder.encode(value);
  const signature = decodeHex(signatureHex);

  return await crypto.subtle.verify("HMAC", key, signature, data);
}

/**
 * Parses a signed cookie to get its value.
 *
 * Important: always verify the cookie using {@linkcode verifyCookie} first.
 *
 * @example
 * ```ts
 * import { verifyCookie, parseSignedCookie } from "@std/http/unstable-signed-cookie";
 * import { getCookies } from "@std/http/cookie";
 *
 * const key = await crypto.subtle.generateKey(
 *   { name: "HMAC", hash: "SHA-256" },
 *   true,
 *   ["sign", "verify"],
 * );
 *
 * const headers = new Headers({
 *   Cookie: "location=tokyo.37f7481039762eef5cd46669f93c0a3214dfecba7d0cdc0b0dc40036063fb22e",
 * });
 * const signedCookie = getCookies(headers)["location"];
 * if (signedCookie === undefined) throw new Error("Cookie not found");
 * await verifyCookie(signedCookie, key);
 * const cookie = parseSignedCookie(signedCookie);
 * ```
 */
export function parseSignedCookie(signedCookie: string): string {
  return splitByLast(signedCookie, ".")[0];
}
