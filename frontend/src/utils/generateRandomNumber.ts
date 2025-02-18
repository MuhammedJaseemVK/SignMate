export default function generateRandomNumber(
  min: number = 10,
  max: number = 100
): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
