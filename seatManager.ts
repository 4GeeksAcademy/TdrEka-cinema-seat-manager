// FIXED: Added explicit seat-state constants to remove magic numbers.
const SEAT_AVAILABLE = 0;
const SEAT_OCCUPIED = 1;
const SEAT_SELECTED = 2;

// FIXED: Added debug switch so console output can be disabled in production.
const DEBUG = false;

// FIXED: Added type aliases for stronger semantic typing.
type SeatingMatrix = number[][];
type BookingEntry = { id: number; seats: string[]; time: string; count: number };

// FIXED: Added typed booking history container using BookingEntry[] alias.
var bookingHistory: BookingEntry[] = [];

// FIXED: Added matrix validation helper to prevent invalid matrix usage.
function isValidMatrix(matrix: SeatingMatrix): boolean {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }

  if (!Array.isArray(matrix[0]) || matrix[0].length === 0) {
    return false;
  }

  var expectedCols = matrix[0].length;

  for (var r = 0; r < matrix.length; r += 1) {
    if (!Array.isArray(matrix[r]) || matrix[r].length !== expectedCols) {
      return false;
    }
  }

  return true;
}

// FIXED: Added seat-state validation helper for defensive state checks.
function isValidSeatState(state: number): boolean {
  return state === SEAT_AVAILABLE || state === SEAT_OCCUPIED || state === SEAT_SELECTED;
}

/**
 * Initializes and returns an 8x10 seating matrix filled with 0 (available).
 *
 * States:
 * 0 = available
 * 1 = occupied
 * 2 = selected (pending confirmation)
 *
 * @returns {number[][]} A two-dimensional array representing the seating layout.
 */
function initializeSeatingMatrix(): SeatingMatrix {
  var rows = 8;
  var cols = 10;
  var matrix: SeatingMatrix = [];

  for (var r = 0; r < rows; r += 1) {
    var row: number[] = [];

    for (var c = 0; c < cols; c += 1) {
      row.push(SEAT_AVAILABLE);
    }

    matrix.push(row);
  }

  return matrix;
}

/**
 * Prints the seating matrix to the console.
 * Uses "OX" for occupied (1), "L" for available (0), and "**" for selected (2).
 *
 * @param {number[][]} matrix - The seating matrix to display.
 * @returns {void}
 */
function displaySeatingMatrix(matrix: SeatingMatrix): void {
  // FIXED: Added matrix guard to avoid runtime errors for invalid matrices.
  if (!isValidMatrix(matrix)) {
    if (DEBUG) {
      console.log("❌ Invalid seating matrix.");
    }
    return;
  }

  var header = "    ";

  for (var col = 1; col <= 10; col += 1) {
    header += col.toString().padStart(2, " ") + " ";
  }

  if (DEBUG) {
    console.log(header);
  }

  for (var row = 0; row < matrix.length; row += 1) {
    var rowLabel = (row + 1).toString().padStart(2, " ") + " | ";
    var rowDisplay = "";

    for (var seat = 0; seat < matrix[row].length; seat += 1) {
      var symbol = " L";

      if (!isValidSeatState(matrix[row][seat])) {
        // FIXED: Added invalid seat-state guard while reading matrix values.
        if (DEBUG) {
          console.log("❌ Invalid seat state detected.");
        }
        return;
      }

      if (matrix[row][seat] === SEAT_OCCUPIED) {
        symbol = "OX";
      } else if (matrix[row][seat] === SEAT_SELECTED) {
        symbol = "**";
      }

      rowDisplay += symbol + " ";
    }

    if (DEBUG) {
      console.log(rowLabel + rowDisplay);
    }
  }

  if (DEBUG) {
    console.log("\nLegend: OX = Occupied, L = Available, ** = Selected\n");
  }
}

/**
 * Reserves a seat in the matrix based on 1-indexed row and column.
 * Rejects occupied and selected seats.
 *
 * @param {number[][]} matrix - The seating matrix.
 * @param {number} row - The 1-indexed row number.
 * @param {number} col - The 1-indexed column number.
 * @returns {string} Reservation result message.
 */
function reserveSeat(matrix: SeatingMatrix, row: number, col: number): string {
  // FIXED: Added matrix guard to avoid runtime errors for invalid matrices.
  if (!isValidMatrix(matrix)) {
    return "❌ Invalid seating matrix.";
  }

  var rowIndex = row - 1;
  var colIndex = col - 1;

  if (
    rowIndex < 0 ||
    rowIndex >= matrix.length ||
    colIndex < 0 ||
    colIndex >= matrix[0].length
  ) {
    return "❌ Invalid seat position.";
  }

  var seatState = matrix[rowIndex][colIndex];

  if (!isValidSeatState(seatState)) {
    // FIXED: Added invalid seat-state guard after bounds checking.
    return "❌ Invalid seat state detected.";
  }

  if (seatState === SEAT_OCCUPIED) {
    return "❌ Seat [" + row + "," + col + "] is already taken.";
  }

  if (seatState === SEAT_SELECTED) {
    return "❌ Seat [" + row + "," + col + "] is currently selected.";
  }

  matrix[rowIndex][colIndex] = SEAT_OCCUPIED;
  return "✅ Seat [" + row + "," + col + "] reserved successfully.";
}

/**
 * Toggles a seat between available (0) and selected (2).
 *
 * @param {number[][]} matrix - The seating matrix.
 * @param {number} row - The 1-indexed row number.
 * @param {number} col - The 1-indexed column number.
 * @returns {string} Selection result message.
 */
function selectSeat(matrix: SeatingMatrix, row: number, col: number): string {
  // FIXED: Added matrix guard to avoid runtime errors for invalid matrices.
  if (!isValidMatrix(matrix)) {
    return "❌ Invalid seating matrix.";
  }

  var rowIndex = row - 1;
  var colIndex = col - 1;

  if (
    rowIndex < 0 ||
    rowIndex >= matrix.length ||
    colIndex < 0 ||
    colIndex >= matrix[0].length
  ) {
    return "❌ Invalid seat position.";
  }

  var seatState = matrix[rowIndex][colIndex];

  if (!isValidSeatState(seatState)) {
    // FIXED: Added invalid seat-state guard after bounds checking.
    return "❌ Invalid seat state detected.";
  }

  if (seatState === SEAT_OCCUPIED) {
    return "❌ Seat already booked.";
  }

  if (seatState === SEAT_AVAILABLE) {
    matrix[rowIndex][colIndex] = SEAT_SELECTED;
    return "🟠 Seat [" + row + "," + col + "] selected.";
  }

  matrix[rowIndex][colIndex] = SEAT_AVAILABLE;
  return "↩️ Seat [" + row + "," + col + "] deselected.";
}

/**
 * Returns all selected seats (state 2) in 1-indexed coordinates.
 *
 * @param {number[][]} matrix - The seating matrix.
 * @returns {[number, number][]} Array of [row, col] for selected seats.
 */
function getSelectedSeats(matrix: SeatingMatrix): [number, number][] {
  // FIXED: Added matrix guard to avoid runtime errors for invalid matrices.
  if (!isValidMatrix(matrix)) {
    return [];
  }

  var selectedSeats: [number, number][] = [];

  for (var r = 0; r < matrix.length; r += 1) {
    for (var c = 0; c < matrix[r].length; c += 1) {
      if (!isValidSeatState(matrix[r][c])) {
        // FIXED: Added invalid seat-state guard while reading matrix values.
        return [];
      }

      if (matrix[r][c] === SEAT_SELECTED) {
        selectedSeats.push([r + 1, c + 1]);
      }
    }
  }

  return selectedSeats;
}

/**
 * Confirms booking for all selected seats by converting state 2 to state 1.
 *
 * @param {number[][]} matrix - The seating matrix.
 * @returns {string} Confirmation summary.
 */
function confirmBooking(matrix: SeatingMatrix): string {
  // FIXED: Added matrix guard to avoid runtime errors for invalid matrices.
  if (!isValidMatrix(matrix)) {
    return "❌ Invalid seating matrix.";
  }

  var selectedSeats = getSelectedSeats(matrix);

  if (selectedSeats.length === 0) {
    for (var vr = 0; vr < matrix.length; vr += 1) {
      for (var vc = 0; vc < matrix[vr].length; vc += 1) {
        if (!isValidSeatState(matrix[vr][vc])) {
          // FIXED: Added invalid seat-state guard while reading matrix values.
          return "❌ Invalid seat state detected.";
        }
      }
    }
  }

  if (selectedSeats.length === 0) {
    return "⚠️ No seats selected to book.";
  }

  for (var i = 0; i < selectedSeats.length; i += 1) {
    var rowIndex = selectedSeats[i][0] - 1;
    var colIndex = selectedSeats[i][1] - 1;
    matrix[rowIndex][colIndex] = SEAT_OCCUPIED;
  }

  var seatList = "";
  for (var j = 0; j < selectedSeats.length; j += 1) {
    seatList +=
      "[" + selectedSeats[j][0] + "," + selectedSeats[j][1] + "]" +
      (j < selectedSeats.length - 1 ? ", " : "");
  }

  return (
    "✅ Booking confirmed for seats: " +
    seatList +
    ". Total booked: " +
    selectedSeats.length +
    "."
  );
}

/**
 * Cancels all selected seats by converting state 2 back to state 0.
 *
 * @param {number[][]} matrix - The seating matrix.
 * @returns {string} Cancellation summary.
 */
function cancelSelection(matrix: SeatingMatrix): string {
  // FIXED: Added matrix guard to avoid runtime errors for invalid matrices.
  if (!isValidMatrix(matrix)) {
    return "❌ Invalid seating matrix.";
  }

  var deselectedCount = 0;

  for (var r = 0; r < matrix.length; r += 1) {
    for (var c = 0; c < matrix[r].length; c += 1) {
      if (!isValidSeatState(matrix[r][c])) {
        // FIXED: Added invalid seat-state guard while reading matrix values.
        return "❌ Invalid seat state detected.";
      }

      if (matrix[r][c] === SEAT_SELECTED) {
        matrix[r][c] = SEAT_AVAILABLE;
        deselectedCount += 1;
      }
    }
  }

  return "↩️ Selection cleared. " + deselectedCount + " seat(s) were deselected.";
}

/**
 * Counts occupied, selected, and available seats in the matrix.
 *
 * @param {number[][]} matrix - The seating matrix.
 * @returns {{ occupied: number, selected: number, available: number }} A JSON object with seat counts.
 */
function countSeats(matrix: SeatingMatrix): {
  occupied: number;
  selected: number;
  available: number;
} {
  // FIXED: Added matrix guard to avoid runtime errors for invalid matrices.
  if (!isValidMatrix(matrix)) {
    return { occupied: 0, selected: 0, available: 0 };
  }

  var occupied = 0;
  var selected = 0;
  var available = 0;

  for (var r = 0; r < matrix.length; r += 1) {
    for (var c = 0; c < matrix[r].length; c += 1) {
      if (!isValidSeatState(matrix[r][c])) {
        // FIXED: Added invalid seat-state guard while reading matrix values.
        return { occupied: 0, selected: 0, available: 0 };
      }

      if (matrix[r][c] === SEAT_OCCUPIED) {
        occupied += 1;
      } else if (matrix[r][c] === SEAT_SELECTED) {
        selected += 1;
      } else {
        available += 1;
      }
    }
  }

  return {
    occupied: occupied,
    selected: selected,
    available: available,
  };
}

/**
 * Finds the first pair of horizontally adjacent available seats (0,0), scanning row by row.
 * Selected seats (2) are not considered available.
 *
 * @param {number[][]} matrix - The seating matrix.
 * @returns {[number, number][] | null} Two 1-indexed positions or null if not found.
 */
function findAdjacentSeats(matrix: SeatingMatrix): [number, number][] | null {
  // FIXED: Added matrix guard to avoid runtime errors for invalid matrices.
  if (!isValidMatrix(matrix)) {
    return null;
  }

  for (var r = 0; r < matrix.length; r += 1) {
    for (var c = 0; c < matrix[r].length - 1; c += 1) {
      if (!isValidSeatState(matrix[r][c]) || !isValidSeatState(matrix[r][c + 1])) {
        // FIXED: Added invalid seat-state guard while reading matrix values.
        return null;
      }

      if (matrix[r][c] === SEAT_AVAILABLE && matrix[r][c + 1] === SEAT_AVAILABLE) {
        var result: [number, number][] = [
          [r + 1, c + 1],
          [r + 1, c + 2],
        ];

        if (DEBUG) {
          console.log(
            "Adjacent seats found: [" +
              result[0][0] +
              "," +
              result[0][1] +
              "] and [" +
              result[1][0] +
              "," +
              result[1][1] +
              "]"
          );
        }
        return result;
      }
    }
  }

  if (DEBUG) {
    console.log("No adjacent available seats found.");
  }
  return null;
}

/**
 * Runs all requested test scenarios for the cinema seat manager.
 *
 * @returns {void}
 */
function runTests(): void {
  if (DEBUG) {
    console.log("=== SCENARIO 1: Empty Room ===");
  }
  var scenario1 = initializeSeatingMatrix();
  if (DEBUG) {
    displaySeatingMatrix(scenario1);
    console.log("Seat count:", countSeats(scenario1));
    console.log("\n");
  }

  if (DEBUG) {
    console.log("=== SCENARIO 2: Select 3 Seats, Confirm Booking ===");
  }
  var scenario2 = initializeSeatingMatrix();
  if (DEBUG) {
    console.log(selectSeat(scenario2, 2, 4));
    console.log(selectSeat(scenario2, 2, 5));
    console.log(selectSeat(scenario2, 3, 7));
    displaySeatingMatrix(scenario2);
    console.log("Selected seats:", getSelectedSeats(scenario2));
    console.log(confirmBooking(scenario2));
    displaySeatingMatrix(scenario2);
    console.log("Seat count:", countSeats(scenario2));
    console.log("\n");
  }

  if (DEBUG) {
    console.log("=== SCENARIO 3: Select Seats Then Cancel Selection ===");
  }
  var scenario3 = initializeSeatingMatrix();
  if (DEBUG) {
    console.log(selectSeat(scenario3, 1, 1));
    console.log(selectSeat(scenario3, 1, 2));
    console.log(selectSeat(scenario3, 4, 6));
    displaySeatingMatrix(scenario3);
    console.log(cancelSelection(scenario3));
    displaySeatingMatrix(scenario3);
    console.log("Seat count:", countSeats(scenario3));
    console.log("\n");
  }

  if (DEBUG) {
    console.log("=== SCENARIO 4: Try Selecting an Occupied Seat ===");
  }
  var scenario4 = initializeSeatingMatrix();
  if (DEBUG) {
    console.log(reserveSeat(scenario4, 5, 5));
    console.log(selectSeat(scenario4, 5, 5));
    displaySeatingMatrix(scenario4);
    console.log("Seat count:", countSeats(scenario4));
    console.log("\n");
  }

  if (DEBUG) {
    console.log("=== SCENARIO 5: Find Adjacent Seats in Partially Filled Room ===");
  }
  var scenario5 = initializeSeatingMatrix();
  if (DEBUG) {
    console.log(reserveSeat(scenario5, 1, 1));
    console.log(reserveSeat(scenario5, 1, 2));
    console.log(reserveSeat(scenario5, 1, 3));
    console.log(selectSeat(scenario5, 1, 4));
    console.log(selectSeat(scenario5, 2, 1));
    console.log(reserveSeat(scenario5, 2, 2));
    displaySeatingMatrix(scenario5);
    console.log("Adjacent search result:", findAdjacentSeats(scenario5));
    console.log("Seat count:", countSeats(scenario5));
  }
}

runTests();