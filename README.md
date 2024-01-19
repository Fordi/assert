# @fordi-org/assert

A wrapper around node:assert where I keep custom assertions.

## sameType

Assert that two items are the same type.

```javascript
assert.sameType(actual, expected, message)
```


## sameLength

Assert that two objects have the same length.

```javascript
assert.sameLength(actual, expected, message);
```

## closeTo

Assert that two numbers are close to one another within some tolerance.

```javascript
assert.closeTo(actual, expected, epsilon, message);
```

The default tolerance is an epsilon of 1e-15; you can change the default by setting `assert.closeTo.defaultEpsilon`.

## deeply

Create an assertion that applies recursively to objects / arrays.

```javascript
const deepCustomAssertion = deeply(customAssertion);
```

## deepCloseTo

```javascript
assert.deepCloseTo(actual, expected, epsilon, message);
```

Same as [assert.closeTo](#closeTo), but recursive.
