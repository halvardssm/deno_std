interface Address {
  name?: string;
  address: string;
}

type MessageHeaders = Record<string, any>;

interface MessageOptions {
  headerParser?: Record<string, (header: string, value: string[]) => any>;
}

export class Message {
  headersRaw: Map<string, string[]>;
  body: string;
  headers: MessageHeaders = {};

  constructor(
    headers: Map<string, string[]>,
    body: string,
    options: MessageOptions = {},
  ) {
    this.headersRaw = headers;
    this.body = body;
  }

  parseAddress(address: string): Address {
    const [name, email] = address.split("<", 2).map((el) => el.trim());
    return {
      name: name === "" ? undefined : name,
      address: email.endsWith(">") ? email.slice(0, -1) : email,
    };
  }

  toString() {
    const lines: string[] = [];

    for (const [key, values] of this.headersRaw.entries()) {
      for (const value of values) {
        lines.push(`${key}: ${value}`);
      }
    }

    lines.push(this.body);

    return lines.join("\n");
  }

  static parseMessage(messageRaw: string) {
    const lines = messageRaw.split("\n");
    let iBody: number | null = null;
    const headers = new Map<string, string[]>();

    for (const [i, line] of lines.entries()) {
      const isHeader = /^\S+:/.test(line.trim());

      if (!isHeader) {
        iBody = i;
        break;
      }

      const [key, value] = line.split(":", 2).map((el) => el.trim());

      if (headers.has(key)) {
        headers.set(key, [...headers.get(key)!, value]);
      } else {
        headers.set(key, [value]);
      }
    }

    let body;

    if (iBody) {
      body = lines.slice(iBody).join("\n");
    } else {
      body = "";
    }

    return new Message(headers, body);
  }
}
