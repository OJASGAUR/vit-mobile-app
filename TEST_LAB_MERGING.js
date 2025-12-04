// Test data for Lab Merging Verification
// Place this in a test file or console to verify the mergeConsecutiveLabs function

const testData = {
  "Monday": [
    {
      courseCode: "BASE103",
      courseName: "Computational Structures (Embedded Lab)",
      slot: "L39",
      start: "15:51",
      end: "16:40",
      venue: "PRP347"
    },
    {
      courseCode: "BASE103",
      courseName: "Computational Structures (Embedded Lab)",
      slot: "L40",
      start: "16:41",
      end: "17:30",
      venue: "PRP347"
    },
    {
      courseCode: "BACHY105",
      courseName: "Applied Chemistry (Embedded Lab)",
      slot: "L41",
      start: "17:40",
      end: "18:30",
      venue: "PRP607"
    },
    {
      courseCode: "BACHY105",
      courseName: "Applied Chemistry (Embedded Lab)",
      slot: "L42",
      start: "18:31",
      end: "19:20",
      venue: "PRP607"
    }
  ]
};

// Expected Result After Merging:
// [
//   {
//     courseCode: "BASE103",
//     courseName: "Computational Structures (Embedded Lab)",
//     slot: "L39+L40",           // Merged slots
//     start: "15:51",            // First start time
//     end: "17:30",              // Last end time
//     venue: "PRP347"            // Combined venue
//   },
//   {
//     courseCode: "BACHY105",
//     courseName: "Applied Chemistry (Embedded Lab)",
//     slot: "L41+L42",           // Merged slots
//     start: "17:40",
//     end: "19:20",
//     venue: "PRP607"
//   }
// ]

// Test Cases:
// ✅ Same course code + both labs + contiguous time = MERGE
// ✅ Slot names combined with +
// ✅ Time span updated to include both slots
// ✅ Venue preserved (same venue for merged pair)
// ❌ Different course codes = NO MERGE (stays separate)
// ❌ Non-contiguous times (gap between) = NO MERGE
// ❌ Non-lab courses = NO MERGE

// To test:
// 1. Call mergeConsecutiveLabs(testData["Monday"])
// 2. Should return 2 items (L39+L40 as one, L41+L42 as one)
// 3. Each merged item should have combined slots and end times
