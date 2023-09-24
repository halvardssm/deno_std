import * as core from "./mod.ts";
import { tryParseRange } from "./try_parse_range.ts";

export class SemVerRange {
  ranges: core.SemVerRange["ranges"];

  constructor(range: SemVerRange | string) {
    if (typeof range === "string") {
      const { ranges } = core.parseRange(range);
      this.ranges = ranges;
    } else {
      this.ranges = range.ranges;
    }
  }

  static isSemVerRange(value: unknown): value is SemVerRange {
    if (value instanceof SemVerRange) return true;

    return core.isSemVerRange(value);
  }

  static format(range: SemVerRange): string {
    return core.rangeFormat(range);
  }

  format(): string {
    return SemVerRange.format(this);
  }

  static intersects(r0: SemVerRange, r1: SemVerRange): boolean {
    return core.rangeIntersects(r0, r1);
  }

  intersects(r1: SemVerRange): boolean {
    return SemVerRange.intersects(this, r1);
  }

  static max(range: SemVerRange): core.SemVer | undefined {
    return core.rangeMax(range);
  }

  get max(): core.SemVer | undefined {
    return SemVerRange.max(this);
  }

  static min(range: SemVerRange): core.SemVer | undefined {
    return core.rangeMin(range);
  }

  get min(): core.SemVer | undefined {
    return SemVerRange.min(this);
  }

  static test(version: core.SemVer, range: SemVerRange): boolean {
    return core.testRange(version, range);
  }

  test(version: core.SemVer): boolean {
    return SemVerRange.test(version, this);
  }

  static tryParse(range: string): SemVerRange | undefined {
    const parsedRange = tryParseRange(range);
    if (!parsedRange) return undefined;
    return new SemVerRange(parsedRange as SemVerRange);
  }

  toString(): string {
    return this.format();
  }
}
