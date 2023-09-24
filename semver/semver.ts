import * as core from "./mod.ts";
import { tryParse } from "./try_parse.ts";

export class SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease: (string | number)[];
  build: string[];

  constructor(version: string | core.SemVer | SemVer) {
    let v: core.SemVer | SemVer;
    if (typeof version === "string") {
      v = core.parse(version);
    } else {
      v = version;
    }
    this.major = v.major;
    this.minor = v.minor;
    this.patch = v.patch;
    this.prerelease = v.prerelease;
    this.build = v.build;
  }

  static cmp(
    s0: core.SemVer,
    operator: core.Operator,
    s1: core.SemVer,
  ): boolean {
    return core.cmp(s0, operator, s1);
  }

  cmp(operator: core.Operator, s1: SemVer): boolean {
    return SemVer.cmp(this, operator, s1);
  }

  static compareBuild(s0: core.SemVer, s1: core.SemVer): 1 | 0 | -1 {
    return core.compareBuild(s0, s1);
  }

  compareBuild(s1: SemVer): 1 | 0 | -1 {
    return SemVer.compareBuild(this, s1);
  }

  static compare(s0: core.SemVer, s1: core.SemVer): 1 | 0 | -1 {
    return core.compare(s0, s1);
  }

  compare(s1: SemVer): 1 | 0 | -1 {
    return SemVer.compare(this, s1);
  }

  static difference(
    s0: core.SemVer,
    s1: core.SemVer,
  ): core.ReleaseType | undefined {
    return core.difference(s0, s1);
  }

  difference(s1: SemVer): core.ReleaseType | undefined {
    return SemVer.difference(this, s1);
  }

  static eq(s0: SemVer, s1: SemVer): boolean {
    return core.eq(s0, s1);
  }

  eq(s1: SemVer): boolean {
    return SemVer.eq(this, s1);
  }

  static format(semver: SemVer, style: core.FormatStyle = "full"): string {
    return core.format(semver, style);
  }

  format(style: core.FormatStyle = "full"): string {
    return SemVer.format(this, style);
  }

  static gt(s0: core.SemVer, s1: core.SemVer): boolean {
    return core.gt(s0, s1);
  }

  gt(s1: SemVer): boolean {
    return SemVer.gt(this, s1);
  }

  static gte(s0: core.SemVer, s1: core.SemVer): boolean {
    return core.gte(s0, s1);
  }

  gte(s1: SemVer): boolean {
    return SemVer.gte(this, s1);
  }

  static gtr(version: SemVer, range: core.SemVerRange) {
    return core.gtr(version, range);
  }

  gtr(range: core.SemVerRange): boolean {
    return SemVer.gtr(this, range);
  }

  static increment(
    version: SemVer,
    release: core.ReleaseType,
    prerelease?: string,
    build?: string,
  ): SemVer {
    return new SemVer(core.increment(version, release, prerelease, build));
  }

  increment(
    release: core.ReleaseType,
    prerelease?: string,
    build?: string,
  ): SemVer {
    return SemVer.increment(this, release, prerelease, build);
  }

  static isSemVer(value: unknown): value is SemVer {
    if (value instanceof SemVer) return true;

    return core.isSemVer(value);
  }

  static lt(s0: core.SemVer, s1: core.SemVer): boolean {
    return core.lt(s0, s1);
  }

  lt(s1: SemVer): boolean {
    return SemVer.lt(this, s1);
  }

  static lte(s0: core.SemVer, s1: core.SemVer): boolean {
    return core.lte(s0, s1);
  }

  lte(s1: SemVer): boolean {
    return SemVer.lte(this, s1);
  }

  static ltr(version: SemVer, range: core.SemVerRange): boolean {
    return core.ltr(version, range);
  }

  ltr(range: core.SemVerRange): boolean {
    return SemVer.ltr(this, range);
  }

  static maxSatifying(
    versions: SemVer[],
    range: core.SemVerRange,
  ): core.SemVer | undefined {
    return core.maxSatisfying(versions, range);
  }

  static minSatisfying(
    versions: SemVer[],
    range: core.SemVerRange,
  ): core.SemVer | undefined {
    return core.minSatisfying(versions, range);
  }

  static neq(s0: core.SemVer, s1: core.SemVer): boolean {
    return core.neq(s0, s1);
  }

  neq(s1: SemVer): boolean {
    return SemVer.neq(this, s1);
  }

  static outside(
    version: SemVer,
    range: core.SemVerRange,
    hilo?: ">" | "<",
  ): boolean {
    return core.outside(version, range, hilo);
  }

  outside(range: core.SemVerRange, hilo?: ">" | "<"): boolean {
    return SemVer.outside(this, range, hilo);
  }

  static rcompare(s0: core.SemVer, s1: core.SemVer): 1 | 0 | -1 {
    return core.rcompare(s0, s1);
  }

  rcompare(s1: SemVer): 1 | 0 | -1 {
    return SemVer.rcompare(this, s1);
  }

  static rsort(versions: SemVer[]): core.SemVer[] {
    return core.rsort(versions);
  }

  static sort(versions: SemVer[]): core.SemVer[] {
    return core.sort(versions);
  }

  static tryParse(version?: string): SemVer | undefined {
    const parsedVersion = tryParse(version);
    if (!parsedVersion) return undefined;
    return new SemVer(parsedVersion);
  }
}
