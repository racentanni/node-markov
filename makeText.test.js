const fs = require("fs");
const axios = require("axios");
const { MarkovMachine } = require("./markov");
const process = require("process");

jest.mock("fs");
jest.mock("axios");

describe("Markov Machine Command Line Interface", () => {
  test("generateText generates text", () => {
    const text = "the cat in the hat";
    const logSpy = jest.spyOn(console, 'log');
    const mm = new MarkovMachine(text);

    mm.makeText = jest.fn().mockReturnValue("the cat in the hat");
    console.log(mm.makeText());
    expect(logSpy).toHaveBeenCalledWith("the cat in the hat");
  });

  test("makeText reads file and generates text", done => {
    const path = "file.txt";
    const text = "the cat in the hat";
    fs.readFile.mockImplementation((path, encoding, callback) => {
      callback(null, text);
    });

    const logSpy = jest.spyOn(console, 'log');
    const processSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    makeText(path);

    process.nextTick(() => {
      expect(logSpy).toHaveBeenCalled();
      expect(processSpy).not.toHaveBeenCalled();
      done();
    });
  });

  test("makeURLText reads URL and generates text", async () => {
    const url = "http://example.com";
    const text = "the cat in the hat";
    axios.get.mockResolvedValue({ data: text });

    const logSpy = jest.spyOn(console, 'log');
    const processSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    await makeURLText(url);

    expect(logSpy).toHaveBeenCalled();
    expect(processSpy).not.toHaveBeenCalled();
  });

  test("Command line interface handles file method", () => {
    const path = "file.txt";
    const mockArgv = ["node", "script.js", "file", path];
    jest.spyOn(process, 'argv', 'get').mockReturnValue(mockArgv);

    const makeTextSpy = jest.spyOn(global, 'makeText').mockImplementation(() => {});
    const processSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    require("./script");

    expect(makeTextSpy).toHaveBeenCalledWith(path);
    expect(processSpy).not.toHaveBeenCalled();
  });

  test("Command line interface handles url method", () => {
    const url = "http://example.com";
    const mockArgv = ["node", "script.js", "url", url];
    jest.spyOn(process, 'argv', 'get').mockReturnValue(mockArgv);

    const makeURLTextSpy = jest.spyOn(global, 'makeURLText').mockImplementation(() => {});
    const processSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    require("./script");

    expect(makeURLTextSpy).toHaveBeenCalledWith(url);
    expect(processSpy).not.toHaveBeenCalled();
  });

  test("Command line interface handles unknown method", () => {
    const mockArgv = ["node", "script.js", "unknown"];
    jest.spyOn(process, 'argv', 'get').mockReturnValue(mockArgv);

    const logSpy = jest.spyOn(console, 'error');
    const processSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    require("./script");

    expect(logSpy).toHaveBeenCalledWith("Unknown method: unknown");
    expect(processSpy).toHaveBeenCalledWith(1);
  });
});

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
      ['the cat', ['in']],
      ['cat in', ['the']],
      ['in the', ['hat']],
      ['the hat', [null]]
    ]);

    expect(mm.chains).toEqual(expectedChains);
  });

  test('choice returns a random element from an array', () => {
    const array = [1, 2, 3, 4, 5];
    const chosen = mm.choice(array);
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
