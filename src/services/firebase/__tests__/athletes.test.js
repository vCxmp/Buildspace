import {
    addAthleteProfile,
    getAllAthletes,
    submitAthleteProfile,
    submitSponsorshipOffer
} from '../athletes';

// Test data
const testAthlete = {
  name: "Test Athlete",
  college: "Test University",
  sport: "Test Sport",
  amountRequested: 5000,
  profilePhotoUrl: "https://example.com/test.jpg"
};

const testOffer = {
  companyName: "Test Company",
  offerAmount: 3000
};

// Test functions
const testAthleteProfile = async () => {
  try {
    console.log("Testing addAthleteProfile...");
    const athleteId = await addAthleteProfile(testAthlete);
    console.log("✅ addAthleteProfile successful. Athlete ID:", athleteId);
    return athleteId;
  } catch (error) {
    console.error("❌ addAthleteProfile failed:", error);
    throw error;
  }
};

const testSubmitAthleteProfile = async () => {
  try {
    console.log("\nTesting submitAthleteProfile...");
    // Note: You'll need to provide a real image URI for this test
    const result = await submitAthleteProfile({
      ...testAthlete,
      imageUri: "file://path/to/test/image.jpg" // Replace with actual image URI
    });
    console.log("✅ submitAthleteProfile successful:", result);
    return result.id;
  } catch (error) {
    console.error("❌ submitAthleteProfile failed:", error);
    throw error;
  }
};

const testGetAllAthletes = async () => {
  try {
    console.log("\nTesting getAllAthletes...");
    const athletes = await getAllAthletes();
    console.log(`✅ getAllAthletes successful. Found ${athletes.length} athletes:`);
    athletes.forEach(athlete => {
      console.log(`- ${athlete.name} (${athlete.sport})`);
    });
    return athletes;
  } catch (error) {
    console.error("❌ getAllAthletes failed:", error);
    throw error;
  }
};

const testSubmitSponsorshipOffer = async (athleteId) => {
  try {
    console.log("\nTesting submitSponsorshipOffer...");
    const offerId = await submitSponsorshipOffer(athleteId, testOffer);
    console.log("✅ submitSponsorshipOffer successful. Offer ID:", offerId);
    return offerId;
  } catch (error) {
    console.error("❌ submitSponsorshipOffer failed:", error);
    throw error;
  }
};

// Run all tests
const runAllTests = async () => {
  try {
    console.log("🚀 Starting Firestore tests...\n");
    
    // Test basic athlete profile creation
    const athleteId = await testAthleteProfile();
    
    // Test getting all athletes
    await testGetAllAthletes();
    
    // Test submitting an offer
    await testSubmitSponsorshipOffer(athleteId);
    
    console.log("\n✨ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test suite failed:", error);
  }
};

// Export the test functions
export {
    runAllTests, testAthleteProfile, testGetAllAthletes, testSubmitAthleteProfile, testSubmitSponsorshipOffer
};
