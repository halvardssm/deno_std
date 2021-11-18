interface Address {
  name?: string;
  address: string;
}

class MailError extends Error {
  name = this.constructor.name;

  constructor(message: string) {
    super(`MailError: ${message}`);
  }
}

function isAtext(char: string, dot: boolean, permissive: boolean): boolean {
  switch (char) {
    case ".":
      return dot;
    case "(":
    case ")":
    case "[":
    case "]":
    case ";":
    case "@":
    case "\\":
    case ",":
      return permissive;
    case "<":
    case ">":
    case '"':
    case ":":
      return false;
    default:
      return isVchar(char);
  }
}

function isVchar(char: string): boolean {
  return "!" <= char && char <= "~" || isMultbyte(char);
}

function isMultbyte(char: string): boolean {
  return char.charCodeAt(0) >= 0x80;
}

function isSpace(char: string): boolean {
  return char === " " || char === "\t";
}

function isQtext(char: string): boolean {
  if (char === "\\" || char === '"') return false;
  return isVchar(char);
}

class AddressParser {
  original: string;
  s: string;
  decoder = new TextDecoder();

  constructor(addressString: string) {
    this.s = addressString;
    this.original = addressString;
  }

  parseAddressList(): Address[] {
    const list: Address[] = [];

    while (true) {
      this.skipSpace();

      if (this.consume(",")) {
        continue;
      }

      const address = this.parseAddress();

      list.push(address);

      if (!this.skipCFWS()) {
        throw new MailError("Misformatted parenthetical comment");
      }

      if (this.empty()) break;

      if (this.peek() !== ",") throw new MailError("Expected comma");

      while (this.consume(",")) {
        this.skipSpace();
      }

      if (this.empty()) break;
    }

    return list;
  }

  parseSingleAddress(): Address {
    const addresses = this.parseAddress(true);

    if (!this.skipCFWS()) {
      throw new MailError("Misformatted parenthetical comment");
    }
    if (!this.empty()) {
      throw new MailError(`Expected single address, got ${this.s}`);
    }
    if (addresses.length === 0) throw new MailError("Empty group");
    if (addresses.length > 1) {
      throw new MailError("Group with multiple addresses");
    }
    return addresses[0];
  }

  parseAddress(handleGroup: boolean): Address[] {
    this.skipSpace();

    if (this.empty()) throw new MailError("No address");

    try {
      const spec = this.consumeAddrSpec();

      let displayName: string | undefined = undefined;
      this.skipSpace();
      if (!this.empty() && this.peek() === "(") {
        displayName = this.consumeDisplayNameComment();
      }

      return [{ name: displayName, address: spec }];
    } catch (_) {}

    let displayName: string | undefined = undefined;

    if (this.peek() !== "<") displayName = this.consumePhrase();

    this.skipSpace();

    if (handleGroup && this.consume(":")) return this.consumeGroupList();

    if (!this.consume("<")) {
      let atext = true;

      if (displayName) {
        for (const char of displayName) {
          if (!isAtext(char, true, false)) {
            atext = false;
            break;
          }
        }
      }

      if (atext) throw new MailError("Missing '@' or angle-addr");

      throw new MailError("No angle-addr");
    }

    const spec = this.consumeAddrSpec();
    if (!this.consume(">")) throw new MailError("Unclosed angle-addr");

    return [{ name: displayName, address: spec }];
  }

  consumeGroupList(): Address[] {
    const group: Address[] = [];

    this.skipSpace();
    if (this.consume(";")) {
      this.skipCFWS();
      return group;
    }

    while (true) {
      this.skipSpace();
      const address = this.parseAddress(false);
      group.push(...address);

      if (!this.skipCFWS()) {
        throw new MailError("Misformatted parenthetical comment");
      }
      if (this.consume(";")) {
        this.skipCFWS();
        break;
      }
      if (!this.consume(",")) throw new MailError("Expected comma");
    }
    return group;
  }

  consumeAddrSpec(): string {
    let localPart: string;
    this.skipSpace();
    if (this.empty()) throw new MailError("No addr-spec");
    if (this.peek() === '"') {
      localPart = this.consumeQuotedString();
      if (localPart === "") {
        throw new MailError("Empty quoted string in addr-spec");
      }
    } else {
      localPart = this.consumeAtom(true, false);
    }

    if (!this.consume("@")) throw new MailError("Missing @ in addr-spec");

    this.skipSpace();
    if (this.empty()) throw new MailError("No domain in addr-spec");
    const domain = this.consumeAtom(true, false);

    return localPart + "@" + domain;
  }
  consumePhrase(): string {
    const words: string[] = [];
    let isPrevEncoded: boolean | undefined = undefined;
    let error: string | undefined = undefined;
    while (true) {
      let word: string;
      this.skipSpace();
      if (this.empty()) break;
      let isEncoded = false;
      try {
        if (this.peek() === '"') {
          word = this.consumeQuotedString();
        } else {
          word = this.consumeAtom(true, true);
          [word, isEncoded] = this.decodeRFC2047Word(word);
        }
      } catch (err) {
        error = err;
        break;
      }
      if (isPrevEncoded && isEncoded) {
        words[words.length - 1] += word;
      } else {
        words.push(word);
      }
      isPrevEncoded = isEncoded;
    }

    if (error && words.length === 0) {
      throw new MailError(`Missing word in phrase: ${error}`);
    }

    return words.join(" ");
  }

  consumeQuotedString() {
    let i = 1;
    let qsb: string[] = [];
    let escaped = false;

    Loop:
    while (true) {
      const [char, size] = this.s.slice(1);
      if (size === 0) throw new MailError("Unclosed quoted-string");
      else if (size === 1 && char === "\uFFFD") {
        throw new MailError(`Invalid utf8 in quoted-string: ${this.s}`);
      } else if (escaped) {
        if (!isVchar(char) && !isSpace(char)) {
          throw new MailError(`Bad character in quoted-string: ${char}`);
        }
        qsb.push(char);
        escaped = false;
      } else if (isQtext(char) || isSpace) {
        qsb.push(char);
      } else if (char === '"') {
        break Loop;
      } else if (char === "\\") {
        escaped = true;
      } else {
        throw new MailError(`Bad character in quoted-string: ${char}`);
      }

      i += size;
    }
    this.s = this.s.slice(i + 1);
    return;
  }
  consumeAtom(dot, permissive) {
  }
  consumeDisplayNameComment() {
  }

  consume(char: string) {
    if (this.empty() || this.peek() !== char) return false;

    this.s = this.s.slice(1);
    return true;
  }

  skipSpace() {
    this.s = this.s.trimStart();
  }

  peek() {
    return this.s[0];
  }

  empty() {
    return this.len() === 0;
  }

  len() {
    return this.s.length;
  }
  
  skipCFWS() {
    this.skipSpace();

    while (true) {
      if (!this.consume("(")) break;
      const [_, ok] = this.consumeComment();
      if (!ok) return false;
      this.skipSpace();
    }

    return true;
  }

  consumeComment() {
    let depth = 1;

    let comment = "";

    while (true) {
      if (this.empty() || depth === 0) break;
      if (this.peek() === "\\" && this.len() > 1) {
        this.s = this.s.slice(1);
      } else if (this.peek() === "(") {
        depth++;
      } else if (this.peek() === ")") {
        depth--;
      }
      if (depth > 0) {
        comment += this.s.slice(0, 1);
      }
      this.s = this.s.slice(1);
    }
    return [comment, depth === 0];
  }
}
