export default {
  testEnvironment: "allure-jest/node",
};

if (!process.env.DEBUG) {
  process.env.DEBUG = 'false';
}
