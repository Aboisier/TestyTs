import { expect } from '../../lib/assertion/expect';
import { Test, TestSuite } from '../../testyCore';

@TestSuite('Expect ToBeIn Tests')
export class ExpectToMatch {
  @Test(`'a' to be in, should succeed`)
  private aToBeInSuccess() {
    expect.toBeIn('a', ['a', 'b', 'c']);
  }
  
  @Test(`'a' to be in ReadonlyArray, should succeed`)
  private aToBeInReadonlySuccess() {
    const readonlyArray: ReaonlyArray<string> = ['a', 'b', 'c'];
    expect.toBeIn('a', readonlyArray);
  }  

  @Test(`'a' to be in, should fail`)
  private aToBeInFail() {
    expect.toThrow(() => {
      expect.toBeIn('a', ['b', 'c', 'd']);
    });
  }

  @Test(`'a' not to be in, should fail`)
  private aNotToBeInFail() {
    expect.toThrow(() => {
      expect.not.toBeIn('a', ['a', 'b', 'c']);
    });
  }

  @Test(`'a' not to be in, should succeed`)
  private aNotToBeInSuccess() {
    expect.not.toBeIn('a', ['b', 'c', 'd']);
  }
}
