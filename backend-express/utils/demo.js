const double = (n) => {
  if (n < 0) {
    return 0;
  }
  return n * 2;
};

const triple = (n) => {
  if (n < 0) {
    return 0;
  }
  return n * 3;
};

const clamp = (n, min, max) => {
  if (n < min) {
    return min;
  }
  if (n > max) {
    return max;
  }
  return n;
};

const average = (values) => {
  if (values.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total / values.length;
};

const sumTo = (limit) => {
  let total = 0;
  for (let i = 1; i <= limit; i += 1) {
    total += i;
  }
  return total;
};

const factorial = (n) => {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
};

module.exports = { double, triple, clamp, average, sumTo, factorial };
