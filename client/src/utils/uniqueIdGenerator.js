import { format } from 'date-fns';

// Function to generate a unique ID
const generateUniqueId = async () => {
  // Get the current date in YYYYMMDD format
  const currentDate = format(new Date(), 'yyyyMMdd');

  // Retrieve the last sequential number from the database or a file
  // For simplicity, we'll use a variable here, but you should use a persistent storage
  let lastSequentialNumber = await getLastSequentialNumber(); // Implement this function to retrieve the last number

  // Increment the sequential number
  const newSequentialNumber = lastSequentialNumber + 1;

  // Update the last sequential number in the database or file
  await updateLastSequentialNumber(newSequentialNumber); // Implement this function to update the number

  // Generate the unique ID
  const uniqueId = `${currentDate}-${String(newSequentialNumber).padStart(3, '0')}`;

  return uniqueId;
};

// Example implementations of getLastSequentialNumber and updateLastSequentialNumber
// These should be replaced with actual database or file operations
let lastSequentialNumber = 0;

const getLastSequentialNumber = async () => {
  return lastSequentialNumber;
};

const updateLastSequentialNumber = async (newNumber) => {
  lastSequentialNumber = newNumber;
};

export default generateUniqueId;