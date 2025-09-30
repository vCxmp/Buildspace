import { runAllTests } from './athletes.test';

// Run the tests
console.log("Starting Firestore integration tests...");
runAllTests()
  .then(() => {
    console.log("Test execution completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test execution failed:", error);
    process.exit(1);
  }); 