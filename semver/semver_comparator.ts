import * as core from "./mod.ts";
import { tryParseComparator } from "./try_parse_comparator.ts";

export type SemVerComparatorH = core.SemVerComparator | SemVerComparator;

export class SemVerComparator {
  operator: core.Operator;
  semver: core.SemVer;

  constructor(comparator: SemVerComparatorH | string) {
    if (typeof comparator === "string") {
      comparator = core.parseComparator(comparator);
    }

    this.operator = comparator.operator;
    this.semver = comparator.semver;
  }

  static format(comparator: SemVerComparatorH): string {
    return core.comparatorFormat(comparator);
  }

  format(): string {
    return SemVerComparator.format({
      operator: this.operator,
      semver: this.semver,
      min: this.min,
      max: this.max,
    });
  }

  static intersects(c0: SemVerComparatorH, c1: SemVerComparatorH): boolean {
    return core.comparatorIntersects(c0, c1);
  }

  intersects(c1: SemVerComparatorH): boolean {
    return SemVerComparator.intersects(this, c1);
  }

  static max(semver: core.SemVer, operator: core.Operator): core.SemVer {
    return core.comparatorMax(semver, operator);
  }

  get max(): core.SemVer {
    return SemVerComparator.max(this.semver, this.operator);
  }

  static min(semver: core.SemVer, operator: core.Operator): core.SemVer {
    return core.comparatorMin(semver, operator);
  }

  get min(): core.SemVer {
    return SemVerComparator.min(this.semver, this.operator);
  }

  static isSemVerComparator(value: unknown): value is SemVerComparator {
    if (value instanceof SemVerComparator) return true;

    return core.isSemVerComparator(value);
  }

  static test(version: core.SemVer, comparator: SemVerComparatorH): boolean {
    return core.testComparator(version, comparator);
  }

  test(version: core.SemVer): boolean {
    return SemVerComparator.test(version, this);
  }

  static tryParse(comparator: string): SemVerComparator | undefined {
    const parsedComparator = tryParseComparator(comparator);
    if (!parsedComparator) return undefined;
    return new SemVerComparator(parsedComparator);
  }

  toString(): string {
    return this.format();
  }
}
