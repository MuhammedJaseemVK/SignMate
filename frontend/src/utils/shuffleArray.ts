export default function shuffleArray<T>(arr: T[]): T[] {
  const shuffledArr = [...arr]; // Create a copy to avoid mutation
  for (let i = shuffledArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]]; // Swap elements
  }
  return shuffledArr;
}
