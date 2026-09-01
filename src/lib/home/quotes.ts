/**
 * Thirty quotes — one per day of the month, cycling. `quoteOfTheDay()` picks by
 * the calendar day so it's stable for a given date and rolls over each month.
 */

export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: readonly Quote[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  {
    text: 'It always seems impossible until it’s done.',
    author: 'Nelson Mandela',
  },
  {
    text: 'Well done is better than well said.',
    author: 'Benjamin Franklin',
  },
  {
    text: 'What you do every day matters more than what you do once in a while.',
    author: 'Gretchen Rubin',
  },
  {
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
  },
  {
    text: 'Amateurs sit and wait for inspiration, the rest of us just get up and go to work.',
    author: 'Stephen King',
  },
  {
    text: 'The way to get started is to quit talking and begin doing.',
    author: 'Walt Disney',
  },
  {
    text: 'Simplicity is the ultimate sophistication.',
    author: 'Leonardo da Vinci',
  },
  {
    text: 'Action is the foundational key to all success.',
    author: 'Pablo Picasso',
  },
  {
    text: 'Do the hard jobs first. The easy jobs will take care of themselves.',
    author: 'Dale Carnegie',
  },
  {
    text: 'It’s not always that we need to do more but rather that we need to focus on less.',
    author: 'Nathan W. Morris',
  },
  {
    text: 'You don’t have to be great to start, but you have to start to be great.',
    author: 'Zig Ziglar',
  },
  {
    text: 'Focus on being productive instead of busy.',
    author: 'Tim Ferriss',
  },
  {
    text: 'A year from now you may wish you had started today.',
    author: 'Karen Lamb',
  },
  {
    text: 'Great things are done by a series of small things brought together.',
    author: 'Vincent van Gogh',
  },
  {
    text: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Abraham Lincoln',
  },
  {
    text: 'The best way out is always through.',
    author: 'Robert Frost',
  },
  {
    text: 'Start where you are. Use what you have. Do what you can.',
    author: 'Arthur Ashe',
  },
  {
    text: 'Motivation gets you going, but discipline keeps you growing.',
    author: 'John C. Maxwell',
  },
  {
    text: 'Either you run the day or the day runs you.',
    author: 'Jim Rohn',
  },
  {
    text: 'Done is better than perfect.',
    author: 'Sheryl Sandberg',
  },
  {
    text: 'The future depends on what you do today.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'Small daily improvements over time lead to stunning results.',
    author: 'Robin Sharma',
  },
  {
    text: 'If you spend too long thinking about a thing, you’ll never get it done.',
    author: 'Bruce Lee',
  },
  {
    text: 'Ordinary people think merely of spending time. Great people think of using it.',
    author: 'Arthur Schopenhauer',
  },
  {
    text: 'You miss 100% of the shots you don’t take.',
    author: 'Wayne Gretzky',
  },
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    text: 'Patience, persistence and perspiration make an unbeatable combination for success.',
    author: 'Napoleon Hill',
  },
  {
    text: 'Nothing will work unless you do.',
    author: 'Maya Angelou',
  },
  {
    text: 'Continuous improvement is better than delayed perfection.',
    author: 'Mark Twain',
  },
];

/** The quote for a given date — index by day-of-month, wrapping at 30. */
export const quoteOfTheDay = (date: Date = new Date()): Quote =>
  QUOTES[(date.getDate() - 1) % QUOTES.length] ?? QUOTES[0]!;
