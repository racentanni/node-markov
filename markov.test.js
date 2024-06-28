const { MarkovMachine } = require('./markov');

describe('MarkovMachine', () => {
  test('constructor initializes words and calls makeChains', () => {
    const text = 'the cat in the hat';
    const mm = new MarkovMachine(text);

    expect(mm.words).toEqual(['the', 'cat', 'in', 'the', 'hat']);
    expect(mm.chains).toBeInstanceOf(Map);
  });

  test('makeChains builds correct chains', () => {
    const text = 'the cat in the hat';
    const mm = new MarkovMachine(text);

    const expectedChains = new Map([
      ['the', ['cat', 'hat']],
      ['cat', ['in']],
      ['in', ['the']],
      ['hat', [null]]
    ]);

    expect(mm.chains).toEqual(expectedChains);
  });

  test('choice returns a random element from an array', () => {
    const array = [1, 2, 3, 4, 5];
    const chosen = MarkovMachine.choice(array);
    expect(array).toContain(chosen);
  });

  test('makeText produces random text of specified length', () => {
    const text = 'the cat in the hat';
    const mm = new MarkovMachine(text);

    const generatedText = mm.makeText(5);
    const words = generatedText.split(' ');

    expect(words.length).toBeLessThanOrEqual(5);
    words.forEach(word => {
      expect(mm.words).toContain(word);
    });
  });

  test('makeText terminates correctly on null', () => {
    const text = 'the cat in the hat';
    const mm = new MarkovMachine(text);

    const generatedText = mm.makeText(100);
    const words = generatedText.split(' ');

    expect(words.length).toBeLessThanOrEqual(100);
    expect(words[words.length - 1]).toBe('hat');
  });
});
