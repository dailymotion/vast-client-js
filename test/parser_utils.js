import should from 'should';
import { ParserUtils } from '../src/parser/parser_utils.js';

const parserUtils = new ParserUtils();

describe('ParserUtils', function() {
  describe('#splitVAST', function() {
    it('should parse normally defined vast pods', () => {
      const input = [
        { id: 2, sequence: 1 },
        { id: 3, sequence: 2 },
        { id: 4 },
        { id: 5, sequence: 1 },
        { id: 6, sequence: 2 },
        { id: 7, sequence: 3 },
        { id: 8, sequence: 1 },
        { id: 9, sequence: 2 },
        { id: 10 },
        { id: 11, sequence: 1 },
        { id: 12 }
      ];

      const expectedOutput = [
        [{ id: 2, sequence: 1 }, { id: 3, sequence: 2 }],
        [{ id: 4 }],
        [
          { id: 5, sequence: 1 },
          { id: 6, sequence: 2 },
          { id: 7, sequence: 3 }
        ],
        [{ id: 8, sequence: 1 }, { id: 9, sequence: 2 }],
        [{ id: 10 }],
        [{ id: 11, sequence: 1 }],
        [{ id: 12 }]
      ];

      const output = parserUtils.splitVAST(input);

      output.should.deepEqual(expectedOutput);
    });

    it('should parse vast pods with single sequence', () => {
      const input = [
        { id: 1, sequence: 1 },
        { id: 2, sequence: 1 },
        { id: 3, sequence: 1 }
      ];

      const expectedOutput = [
        [{ id: 1, sequence: 1 }],
        [{ id: 2, sequence: 1 }],
        [{ id: 3, sequence: 1 }]
      ];

      const output = parserUtils.splitVAST(input);

      output.should.deepEqual(expectedOutput);
    });

    it('should parse vast pods with no pods', () => {
      const input = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const expectedOutput = [[{ id: 1 }], [{ id: 2 }], [{ id: 3 }]];

      const output = parserUtils.splitVAST(input);

      output.should.deepEqual(expectedOutput);
    });

    it('should parse vast pods with weird sequences', () => {
      const input = [
        { id: 1, sequence: 99 },
        { id: 2, sequence: 99 },
        { id: 3, sequence: 99 }
      ];

      const expectedOutput = [
        [{ id: 1, sequence: 99 }],
        [{ id: 2, sequence: 99 }],
        [{ id: 3, sequence: 99 }]
      ];

      const output = parserUtils.splitVAST(input);

      output.should.deepEqual(expectedOutput);
    });

    it('should parse vast pods with sequences that not start with index = 1', () => {
      const input = [
        { id: 1, sequence: 2 },
        { id: 4 },
        { id: 98, sequence: 3 },
        { id: 99, sequence: 4 },
        { id: 5, sequence: 1 },
        { id: 6, sequence: 2 },
        { id: 7, sequence: 3 },
        { id: 8, sequence: 1 },
        { id: 9, sequence: 2 },
        { id: 10 },
        { id: 11, sequence: 1 },
        { id: 12 }
      ];

      const expectedOutput = [
        [{ id: 1, sequence: 2 }],
        [{ id: 4 }],
        [{ id: 98, sequence: 3 }],
        [{ id: 99, sequence: 4 }],
        [
          { id: 5, sequence: 1 },
          { id: 6, sequence: 2 },
          { id: 7, sequence: 3 }
        ],
        [{ id: 8, sequence: 1 }, { id: 9, sequence: 2 }],
        [{ id: 10 }],
        [{ id: 11, sequence: 1 }],
        [{ id: 12 }]
      ];

      const output = parserUtils.splitVAST(input);

      output.should.deepEqual(expectedOutput);
    });

    it('should parse vast pods with sequences that not start with index = 1, and not following incrementally', () => {
      const input = [
        { id: 1, sequence: 2 },
        { id: 2, sequence: 4 },
        { id: 4 },
        { id: 98, sequence: 3 },
        { id: 99, sequence: 4 },
        { id: 100, sequence: 17 },
        { id: 101, sequence: 18 },
        { id: 5, sequence: 1 },
        { id: 6, sequence: 2 },
        { id: 7, sequence: 3 },
        { id: 8, sequence: 1 },
        { id: 9, sequence: 2 },
        { id: 10 },
        { id: 11, sequence: 1 },
        { id: 12 }
      ];

      const expectedOutput = [
        [{ id: 1, sequence: 2 }],
        [{ id: 2, sequence: 4 }],
        [{ id: 4 }],
        [{ id: 98, sequence: 3 }],
        [{ id: 99, sequence: 4 }],
        [{ id: 100, sequence: 17 }],
        [{ id: 101, sequence: 18 }],
        [
          { id: 5, sequence: 1 },
          { id: 6, sequence: 2 },
          { id: 7, sequence: 3 }
        ],
        [{ id: 8, sequence: 1 }, { id: 9, sequence: 2 }],
        [{ id: 10 }],
        [{ id: 11, sequence: 1 }],
        [{ id: 12 }]
      ];

      const output = parserUtils.splitVAST(input);

      output.should.deepEqual(expectedOutput);
    });
  });
});
