
import { generateTOTP } from "./src/services/totp.service.js";

async function runTotpTest() {
  const testAccount = {
    // Public RFC 6238 test secret
    secret: "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ",
    algorithm: "SHA1",
    digits: 6,
    period: 30
  };

  // Test timestamp: 59 seconds
  const testTimestampSeconds = 59;

  try {
    const actualCode = await generateTOTP(
      testAccount,
      testTimestampSeconds
    );

    const expectedCode = "287082";

    console.log("Expected OTP:", expectedCode);
    console.log("Actual OTP:  ", actualCode);

    if (actualCode === expectedCode) {
      console.log("Result: PASS - TOTP generation is correct.");
    } else {
      console.error("Result: FAIL - TOTP output does not match.");
    }

  } catch (error) {
    console.error("TOTP test failed:", error);
  }
}

runTotpTest();
