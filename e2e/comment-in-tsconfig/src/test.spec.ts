import { expect, Test, TestSuite } from 'testyts';

@TestSuite()
export class MyTestSuite {
  @Test()
  public myTest() {
    // Assert
    expect.toBeEqual(1 + 1, 2);
  }
}
