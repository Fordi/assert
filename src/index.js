import assert from "node:assert";

// should be the same for all of `{(Int|Uint)(8|16|32)|Big(Int|Uint)64|Float(32|64)|Uint8Clamped}Array`
const TypedArray = Object.getPrototypeOf(Uint8Array);

const typeOf = (v) =>
  Array.isArray(v) ? "array" : typeof v === "object" ? v.constructor : typeof v;

const nameOf = (T) => (typeof T === "function" ? T.name : T);

const sameType = (actual, expected, message) => {
  const aType = typeOf(actual);
  const eType = typeOf(expected);
  assert(
    aType === eType,
    message ?? `Expected a ${nameOf(eType)}, got a ${nameOf(aType)} instead`
  );
};

const sameLength = (actual, expected, message) =>
  assert(
    expected.length === actual.length,
    message ??
      `Expected length ${expected.length}, got ${actual.length} instead`
  );

const closeTo = function assertNumbersCloseOrOtherwiseExactEquality(
  actual,
  expected,
  epsilon = closeTo.defaultEpsilon,
  message
) {
  sameType(actual, expected);
  if (typeOf(expected) === "number") {
    const delta = Math.abs(actual - expected);
    assert(
      delta <= epsilon,
      message ?? `Expected ${actual} to be within ${epsilon} of ${expected}`
    );
  } else {
    assert.equal(actual, expected, message);
  }
};

const unshiftPathItem = (e, key) => {
  if (!("path" in e)) {
    e.path = [];
  }
  e.path.unshift(key);
  const message = e.message;
  e.message = message.replace(
    /( \(path: (\.[a-zA-Z_][a-zA-Z0-9_]*|\[[^\]]+\])+\))?$/,
    " (path: " +
      e.path
        .map((p) =>
          /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(p)
            ? `.${p}`
            : `[${JSON.stringify(p)}]`
        )
        .join("") +
      ")"
  );
  e.stack = e.stack.replace(message, e.message);
  return e;
};

closeTo.defaultEpsilon = 1e-15;

const cleanUpStack = (e, ...names) => {
  const rx = new RegExp(
    `[^\n]*(?:${["ignoreThisStackLine", ...names].join("|")})[^\n]*\n`,
    "g"
  );
  e.stack = e.stack.replace(rx, "");
  return e;
};

const deeply = (comparator) => {
  // Long names for ease of clean-up
  const compareActualToExpectedWithRecursion = (actual, expected, ...other) => {
    if (actual === expected) {
      return;
    }
    sameType(actual, expected);
    if (Array.isArray(expected) || expected instanceof TypedArray) {
      sameLength(actual, expected);
      for (let i = 0; i < expected.length; i++) {
        try {
          compareActualToExpectedWithRecursion(
            actual[i],
            expected[i],
            ...other
          );
        } catch (e) {
          throw unshiftPathItem(e, i);
        }
      }
      return;
    }
    if (typeof expected === "object") {
      const eKeys = Object.keys(expected).sort();
      const aKeys = Object.keys(actual).sort();
      assert(
        eKeys.length === aKeys.length,
        `Expected { ${eKeys.join(", ")} }, got { ${aKeys.join(", ")} }`
      );
      for (let i = 0; i < eKeys.length; i++) {
        const key = eKeys[i];
        assert(
          key === aKeys[i],
          `Expected { ${eKeys.join(", ")} }, got { ${aKeys.join(", ")} }`
        );
        try {
          compareActualToExpectedWithRecursion(
            expected[key],
            actual[key],
            ...other
          );
        } catch (e) {
          throw unshiftPathItem(e, key);
        }
      }
      return;
    }
    comparator(actual, expected, ...other);
  };
  const wrapTheComparisonSoFailuresCanBeCleanedUp = (...args) => {
    try {
      compareActualToExpectedWithRecursion(...args);
    } catch (e) {
      throw cleanUpStack(
        e,
        wrapTheComparisonSoFailuresCanBeCleanedUp.name,
        compareActualToExpectedWithRecursion.name,
        comparator.name
      );
    }
  };
  return wrapTheComparisonSoFailuresCanBeCleanedUp;
};

const deepCloseTo = deeply(closeTo);
export default {
  ...assert,
  sameType,
  sameLength,
  deeply,
  closeTo,
  deepCloseTo,
};
export * from "node:assert";
export { sameType, sameLength, deeply, closeTo, deepCloseTo };
